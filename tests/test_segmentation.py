import unittest
from backend.models.caption_models import CaptionItem, WordItem, CaptionStyle
from backend.services.segmentation_service import segmentation_service
from backend.services.caption_service import caption_service

class TestSegmentationService(unittest.TestCase):
    def test_long_sentence_segmentation(self):
        long_sentence = (
            "Today I'm going to show you exactly how you can build your own "
            "AI application completely locally without paying for expensive APIs."
        )
        words = long_sentence.split()
        timed_words = []
        current_time = 1.0
        for w in words:
            timed_words.append({
                "word": w,
                "start": round(current_time, 2),
                "end": round(current_time + 0.35, 2),
                "score": 0.95
            })
            current_time += 0.40

        # Segment using balanced density (default 3-6 words)
        captions = segmentation_service.segment_words(timed_words, density="balanced")

        self.assertGreater(len(captions), 3, "Long sentence should be split into multiple phrases")
        
        for cap in captions:
            words_in_cap = cap.text.split()
            self.assertGreaterEqual(len(words_in_cap), 2, f"Phrase '{cap.text}' too short")
            self.assertLessEqual(len(words_in_cap), 7, f"Phrase '{cap.text}' exceeds 7 words")
            # Verify words field is populated
            self.assertEqual(len(cap.words), len(words_in_cap))
            # Verify timestamps consistency
            self.assertEqual(cap.start, cap.words[0].start)
            self.assertEqual(cap.end, cap.words[-1].end)
            # Verify lines
            self.assertIn(len(cap.lines or []), [1, 2], "Max 2 lines on screen")

    def test_density_modes(self):
        sentence = "Build modern video captions using AI locally on your GPU"
        words = sentence.split()
        timed_words = [
            {"word": w, "start": i * 0.4, "end": (i + 1) * 0.4, "score": 1.0}
            for i, w in enumerate(words)
        ]

        # Compact density (2-4 words)
        compact_caps = segmentation_service.segment_words(timed_words, density="compact")
        for c in compact_caps:
            self.assertLessEqual(len(c.text.split()), 4)

        # Relaxed density (3-8 words)
        relaxed_caps = segmentation_service.segment_words(timed_words, density="relaxed")
        self.assertLessEqual(len(relaxed_caps), len(compact_caps))

    def test_speech_pause_split(self):
        # Two words followed by a 0.5s pause, then two more words
        timed_words = [
            {"word": "Hello", "start": 0.0, "end": 0.4},
            {"word": "world", "start": 0.4, "end": 0.8},
            # Pause of 0.6s
            {"word": "welcome", "start": 1.4, "end": 1.8},
            {"word": "back", "start": 1.8, "end": 2.2},
        ]
        caps = segmentation_service.segment_words(timed_words, density="balanced")
        self.assertEqual(len(caps), 2, "Pause >= 0.28s should split into two phrases")
        self.assertEqual(caps[0].text, "Hello world")
        self.assertEqual(caps[1].text, "welcome back")

    def test_word_level_ass_generation(self):
        style = CaptionStyle(
            presetName="Upper Dynamic",
            activeWordColor="#00B4D8",
            activeWordScale=1.18,
            hasNeonGlow=True
        )
        words = [
            WordItem(word="the", start=1.0, end=1.3),
            WordItem(word="BUMBLEBEE", start=1.3, end=1.8, isEmphasized=True),
            WordItem(word="cannot", start=1.8, end=2.2),
            WordItem(word="fly", start=2.2, end=2.5)
        ]
        cap = CaptionItem(
            id="c1",
            start=1.0,
            end=2.5,
            text="the BUMBLEBEE cannot fly",
            words=words,
            lines=["the BUMBLEBEE", "cannot fly"]
        )

        ass = caption_service.to_ass([cap], style)
        # Verify time-sliced dialogue events were generated for each word
        self.assertIn("Dialogue:", ass)
        self.assertIn("fscx118", ass, "Active word scale should be present in ASS")
        self.assertIn("cannot fly", ass)

if __name__ == "__main__":
    unittest.main()
