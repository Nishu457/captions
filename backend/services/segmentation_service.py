import re
from typing import List, Dict, Any, Optional
from backend.models.caption_models import CaptionItem, WordItem

# Words that indicate natural clause boundaries for intelligent phrase splitting
CLAUSE_CONNECTORS = {
    "and", "but", "because", "so", "that", "which", "who", "or", 
    "when", "while", "although", "though", "if", "then", "since",
    "where", "why", "how", "what", "as", "before", "after", "until"
}

# Strong impact keywords for auto-emphasis heuristic
EMPHASIS_KEYWORDS = {
    "ai", "best", "worst", "never", "always", "huge", "secret", "money",
    "free", "million", "billion", "first", "last", "crazy", "insane",
    "shocking", "important", "stop", "danger", "win", "lose", "love",
    "hate", "perfect", "magic", "power", "fast", "easy", "hard", "truth"
}

DENSITY_RULES = {
    "compact": {"min_words": 2, "target_words": 3, "max_words": 4, "max_chars": 22},
    "balanced": {"min_words": 2, "target_words": 4, "max_words": 6, "max_chars": 34},
    "relaxed": {"min_words": 3, "target_words": 6, "max_words": 8, "max_chars": 48},
}

class SegmentationService:
    @staticmethod
    def _is_hard_punct(text: str) -> bool:
        """Check if word ends with sentence terminating punctuation."""
        return bool(re.search(r'[.!?…]+$', text.strip()))

    @staticmethod
    def _is_soft_punct(text: str) -> bool:
        """Check if word ends with clause punctuation (comma, semicolon, dash)."""
        return bool(re.search(r'[,;:\-—]+$', text.strip()))

    @staticmethod
    def _clean_word_for_lookup(text: str) -> str:
        return re.sub(r'[^\w]', '', text).lower()

    @classmethod
    def _detect_emphasis(cls, words: List[WordItem]) -> None:
        """
        Identify high-impact words to spotlight (like 'BUMBLEBEE' in Upper Dynamic).
        Marks WordItem.isEmphasized = True.
        """
        if not words:
            return

        # 1. Check for explicit emphasis keywords, numbers, or all-caps
        found_any = False
        for w in words:
            clean = cls._clean_word_for_lookup(w.word)
            if (
                clean in EMPHASIS_KEYWORDS or 
                re.match(r'^\d+[%kKmMbB]?$', clean) or
                (len(clean) >= 3 and w.word.isupper() and w.word.isalpha())
            ):
                w.isEmphasized = True
                found_any = True

        # 2. If no word was emphasized, pick the most prominent non-stopword
        if not found_any and words:
            stop_words = {"the", "a", "an", "is", "are", "was", "were", "to", "in", "on", "at", "of", "for", "with", "it", "you", "i", "he", "she", "we", "they"}
            candidate = max(
                words, 
                key=lambda w: (
                    0 if cls._clean_word_for_lookup(w.word) in stop_words else len(cls._clean_word_for_lookup(w.word))
                )
            )
            if len(cls._clean_word_for_lookup(candidate.word)) >= 4:
                candidate.isEmphasized = True

    @classmethod
    def _compute_balanced_lines(cls, words: List[WordItem], max_chars_per_line: int = 28) -> List[str]:
        """
        Distribute words into 1 or 2 visually balanced lines.
        Avoids single orphan words on the second line.
        """
        if not words:
            return []

        word_texts = [w.word for w in words]
        total_words = len(word_texts)
        total_text = " ".join(word_texts)

        # Prefer single line if text is short and under char limit
        if total_words <= 3 or len(total_text) <= max_chars_per_line:
            return [total_text]

        # Balance into 2 lines
        # Find split index that minimizes character length difference between line 1 and line 2
        best_split = total_words // 2
        min_diff = 999

        for split_idx in range(1, total_words):
            line1 = " ".join(word_texts[:split_idx])
            line2 = " ".join(word_texts[split_idx:])

            # Penalize single-word line 2
            penalty = 20 if split_idx == total_words - 1 else 0
            # Penalize lines exceeding max_chars
            if len(line1) > max_chars_per_line + 4 or len(line2) > max_chars_per_line + 4:
                penalty += 30

            diff = abs(len(line1) - len(line2)) + penalty
            if diff < min_diff:
                min_diff = diff
                best_split = split_idx

        return [
            " ".join(word_texts[:best_split]),
            " ".join(word_texts[best_split:])
        ]

    @classmethod
    def segment_words(
        cls,
        words: List[Dict[str, Any]],
        density: str = "balanced"
    ) -> List[CaptionItem]:
        """
        Smart caption segmentation algorithm.
        Breaks continuous word stream into 2-6 word short-form caption phrases.
        """
        if not words:
            return []

        rules = DENSITY_RULES.get(density.lower(), DENSITY_RULES["balanced"])
        min_words = rules["min_words"]
        target_words = rules["target_words"]
        max_words = rules["max_words"]
        max_chars = rules["max_chars"]

        # Clean and normalize input word items
        clean_words: List[WordItem] = []
        for w in words:
            w_text = str(w.get("word", "")).strip()
            if not w_text:
                continue
            start_t = round(float(w.get("start", 0.0)), 3)
            end_t = round(float(w.get("end", start_t + 0.3)), 3)
            if end_t <= start_t:
                end_t = start_t + 0.25
            score = float(w.get("score", 1.0)) if w.get("score") is not None else 1.0

            clean_words.append(
                WordItem(
                    word=w_text,
                    start=start_t,
                    end=end_t,
                    score=score,
                    isEmphasized=False
                )
            )

        if not clean_words:
            return []

        captions: List[CaptionItem] = []
        current_chunk: List[WordItem] = []

        def commit_chunk(chunk: List[WordItem]):
            if not chunk:
                return
            cls._detect_emphasis(chunk)
            chunk_text = " ".join(w.word for w in chunk)
            lines = cls._compute_balanced_lines(chunk, max_chars)
            captions.append(
                CaptionItem(
                    id=f"cap_{len(captions) + 1:03d}",
                    start=chunk[0].start,
                    end=chunk[-1].end,
                    text=chunk_text,
                    words=chunk,
                    lines=lines
                )
            )

        for i, word_item in enumerate(clean_words):
            current_chunk.append(word_item)
            chunk_len = len(current_chunk)
            chunk_chars = sum(len(w.word) for w in current_chunk) + chunk_len - 1

            has_next = i + 1 < len(clean_words)
            next_word_item = clean_words[i + 1] if has_next else None

            # Reason 1: End of all words
            if not has_next:
                commit_chunk(current_chunk)
                current_chunk = []
                break

            # Reason 2: Hard punctuation on current word (. ? ! …)
            if cls._is_hard_punct(word_item.word) and chunk_len >= min_words:
                commit_chunk(current_chunk)
                current_chunk = []
                continue

            # Reason 3: Significant speech pause between words (silence gap >= 0.28s)
            silence_gap = next_word_item.start - word_item.end
            if silence_gap >= 0.28 and chunk_len >= min_words:
                commit_chunk(current_chunk)
                current_chunk = []
                continue

            # Reason 4: Soft punctuation (, ; - :) and reached reasonable length
            if cls._is_soft_punct(word_item.word) and chunk_len >= min_words:
                commit_chunk(current_chunk)
                current_chunk = []
                continue

            # Reason 5: Next word is a conjunction / clause connector AND we have reached target words
            next_clean = cls._clean_word_for_lookup(next_word_item.word)
            if next_clean in CLAUSE_CONNECTORS and chunk_len >= target_words:
                commit_chunk(current_chunk)
                current_chunk = []
                continue

            # Reason 6: Reached maximum words or character threshold
            if chunk_len >= max_words or chunk_chars >= max_chars:
                commit_chunk(current_chunk)
                current_chunk = []
                continue

        # Commit any leftover
        if current_chunk:
            commit_chunk(current_chunk)

        return captions

    @classmethod
    def resegment_captions(
        cls,
        existing_captions: List[CaptionItem],
        density: str = "balanced"
    ) -> List[CaptionItem]:
        """Re-segment existing project captions when user toggles density."""
        # Collect all individual words across captions
        all_words: List[Dict[str, Any]] = []
        for cap in existing_captions:
            if cap.words:
                for w in cap.words:
                    all_words.append({
                        "word": w.word,
                        "start": w.start,
                        "end": w.end,
                        "score": w.score
                    })
            else:
                # Fallback: estimate word timestamps if words list was missing
                words_in_text = cap.text.strip().split()
                if not words_in_text:
                    continue
                total_duration = max(0.4, cap.end - cap.start)
                step = total_duration / len(words_in_text)
                for idx, text_word in enumerate(words_in_text):
                    all_words.append({
                        "word": text_word,
                        "start": round(cap.start + idx * step, 3),
                        "end": round(cap.start + (idx + 1) * step, 3),
                        "score": 1.0
                    })

        return cls.segment_words(all_words, density=density)

segmentation_service = SegmentationService()
