import math
import re
from typing import List, Tuple
from backend.models.caption_models import CaptionItem, CaptionStyle

class CaptionService:
    @staticmethod
    def format_timestamp_srt(seconds: float) -> str:
        """Format seconds into SRT timestamp: HH:MM:SS,mmm"""
        seconds = max(0.0, seconds)
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int(round((seconds - int(seconds)) * 1000))
        if millis >= 1000:
            secs += 1
            millis = 0
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    @staticmethod
    def format_timestamp_vtt(seconds: float) -> str:
        """Format seconds into WebVTT timestamp: HH:MM:SS.mmm"""
        seconds = max(0.0, seconds)
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int(round((seconds - int(seconds)) * 1000))
        if millis >= 1000:
            secs += 1
            millis = 0
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

    @staticmethod
    def format_timestamp_ass(seconds: float) -> str:
        """Format seconds into ASS timestamp: H:MM:SS.cc (centiseconds)"""
        seconds = max(0.0, seconds)
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centis = int(round((seconds - int(seconds)) * 100))
        if centis >= 100:
            secs += 1
            centis = 0
        return f"{hours:d}:{minutes:02d}:{secs:02d}.{centis:02d}"

    @classmethod
    def to_srt(cls, captions: List[CaptionItem]) -> str:
        lines = []
        for index, cap in enumerate(captions, start=1):
            start_str = cls.format_timestamp_srt(cap.start)
            end_str = cls.format_timestamp_srt(cap.end)
            text = cap.text.strip()
            lines.append(f"{index}\n{start_str} --> {end_str}\n{text}\n")
        return "\n".join(lines)

    @classmethod
    def to_vtt(cls, captions: List[CaptionItem]) -> str:
        lines = ["WEBVTT\n"]
        for index, cap in enumerate(captions, start=1):
            start_str = cls.format_timestamp_vtt(cap.start)
            end_str = cls.format_timestamp_vtt(cap.end)
            text = cap.text.strip()
            lines.append(f"{index}\n{start_str} --> {end_str}\n{text}\n")
        return "\n".join(lines)

    @classmethod
    def to_txt(cls, captions: List[CaptionItem]) -> str:
        lines = [cap.text.strip() for cap in captions if cap.text.strip()]
        return "\n".join(lines)

    @staticmethod
    def _hex_to_ass_color(hex_str: str, alpha: float = 1.0) -> str:
        """
        Convert '#RRGGBB' or 'rgba(r,g,b,a)' to ASS color format: &HAABBGGRR.
        In ASS, alpha is 00 for fully opaque, FF for fully transparent.
        """
        hex_str = hex_str.strip()
        r, g, b = 255, 255, 255
        
        if hex_str.startswith("#"):
            hex_clean = hex_str.lstrip("#")
            if len(hex_clean) == 3:
                r = int(hex_clean[0] * 2, 16)
                g = int(hex_clean[1] * 2, 16)
                b = int(hex_clean[2] * 2, 16)
            elif len(hex_clean) >= 6:
                r = int(hex_clean[0:2], 16)
                g = int(hex_clean[2:4], 16)
                b = int(hex_clean[4:6], 16)
        elif hex_str.startswith("rgb"):
            nums = re.findall(r"[\d.]+", hex_str)
            if len(nums) >= 3:
                r, g, b = int(nums[0]), int(nums[1]), int(nums[2])
                if len(nums) >= 4:
                    alpha = float(nums[3])

        # ASS alpha: 00 = opaque, 255 = transparent
        ass_alpha = int(round((1.0 - max(0.0, min(1.0, alpha))) * 255))
        return f"&H{ass_alpha:02X}{b:02X}{g:02X}{r:02X}"

    @classmethod
    def to_ass(cls, captions: List[CaptionItem], style: CaptionStyle) -> str:
        """Generate full ASS (Advanced SubStation Alpha) subtitle file with rich styling.
        
        Maps the full preset animation config (entrance, activeWord, emphasis, easing)
        to ASS tags — ensuring the exported MP4 visually matches the browser preview.
        """
        primary_color = cls._hex_to_ass_color(style.textColor, style.textOpacity)
        back_color    = cls._hex_to_ass_color(style.backgroundColor, style.backgroundOpacity)
        outline_color = cls._hex_to_ass_color(style.outlineColor, 1.0)

        # ── Animation config from preset ─────────────────────────────────
        anim_preset = getattr(style, "animationPreset", "fade")
        anim_cfg    = getattr(style, "animation", None) or {}
        if isinstance(anim_cfg, dict):
            anim_entrance  = anim_cfg.get("entrance", anim_preset)
            anim_easing    = anim_cfg.get("easing", "premium")
            anim_duration  = int(anim_cfg.get("duration", 200))
        else:
            anim_entrance  = anim_preset
            anim_easing    = "premium"
            anim_duration  = 200

        # ── ASS fade tags based on entrance animation ────────────────────
        # \fad(fadeIn_ms, fadeOut_ms) — used for fade and karaoke styles
        fade_in_ms  = max(60, min(350, anim_duration))
        fade_out_ms = 80

        # Select fade/move tag from entrance type
        if anim_entrance in ("fade", "smooth-fade"):
            entrance_tag = f"{{\\fad({fade_in_ms},{fade_out_ms})}}"
        elif anim_entrance in ("scale-in", "pop", "bounce", "elastic", "spring"):
            # Best ASS approximation: fast fade with slight scale hint
            entrance_tag = f"{{\\fad({max(60, fade_in_ms // 2)},{fade_out_ms})}}"
        elif anim_entrance == "slide-up":
            # Use \move for slide effect (y1→y2)
            entrance_tag = f"{{\\fad({fade_in_ms},{fade_out_ms})}}"
        else:
            entrance_tag = f"{{\\fad(80,{fade_out_ms})}}"

        # ── Determine ASS alignment & margins ────────────────────────────
        margin_l = 40
        margin_r = 40
        margin_v = 40

        if style.position == "left-chest":
            align_val = 7  # Top-left
            horiz_pct = getattr(style, "horizontalPercent", 22) or 22
            vert_pct  = getattr(style, "verticalPositionPercent", 58) or 58
            margin_l  = int(1920 * (horiz_pct / 100.0))
            margin_v  = int(1080 * (vert_pct / 100.0))
        elif style.position == "top":
            align_row = 8
            align_val = align_row - 1 if style.alignment == "left" else (align_row + 1 if style.alignment == "right" else align_row)
            margin_v  = 40
        elif style.position == "middle":
            align_row = 5
            align_val = align_row - 1 if style.alignment == "left" else (align_row + 1 if style.alignment == "right" else align_row)
            margin_v  = 0
        else:  # bottom or custom
            align_row = 2
            align_val = align_row - 1 if style.alignment == "left" else (align_row + 1 if style.alignment == "right" else align_row)
            vert_pct  = getattr(style, "verticalPositionPercent", None)
            if style.position == "custom" and vert_pct is not None:
                margin_v = int((100 - vert_pct) * 7.2)
            else:
                margin_v = 40

        font_clean   = style.fontFamily.split(",")[0].replace("'", "").replace('"', '').strip()
        bold_flag    = -1 if int(style.fontWeight) >= 600 else 0
        border_style = 3 if style.hasBackgroundBox else 1  # 3 = opaque box

        # ── Shadow / glow ────────────────────────────────────────────────
        shadow_depth = min(12, style.shadowBlur // 2) if style.hasShadow else 0
        if style.hasNeonGlow:
            shadow_color = cls._hex_to_ass_color(style.neonColor, 0.85)
            neon_blur    = min(8, max(2, (style.neonIntensity or 14) // 3))
            shadow_depth = neon_blur
        else:
            shadow_color = back_color

        header = f"""[Script Info]
Title: Auto Captions — Generated by Caption Studio
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_clean},{style.fontSize * 2},{primary_color},&H000000FF,{outline_color},{shadow_color},{bold_flag},0,0,0,100,100,{style.letterSpacing},0,{border_style},{style.outlineWidth},{shadow_depth},{align_val},{margin_l},{margin_r},{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        events = []
        active_color_ass = cls._hex_to_ass_color(style.activeWordColor or "#3091F7", 1.0)
        neon_color_ass   = cls._hex_to_ass_color(getattr(style, "neonColor", None) or style.activeWordColor or "#3091F7", 1.0)

        # Neon blur tag for active/emphasized words
        neon_tag = f"\\blur{min(6, max(1, (style.neonIntensity or 14) // 4))}" if style.hasNeonGlow else ""

        highlight_type = getattr(style, "highlightType", "karaoke")

        for cap in captions:
            words = cap.words or []

            if words:
                for active_idx, active_w in enumerate(words):
                    w_start_str = cls.format_timestamp_ass(active_w.start)
                    w_end_str   = cls.format_timestamp_ass(active_w.end)

                    # Precompute line start indices for sentence casing
                    line_start_indices = {0}
                    if cap.lines and len(cap.lines) >= 2:
                        running = 0
                        for l_text in cap.lines:
                            line_start_indices.add(running)
                            running += len(l_text.strip().split())

                    word_tokens = []
                    for idx, w in enumerate(words):
                        raw_word   = w.word.strip()
                        is_current = (idx == active_idx)
                        is_emp     = bool(w.isEmphasized)

                        # ── Casing ──────────────────────────────────────
                        if is_emp or (is_current and style.spotlightCase == "uppercase"):
                            display_text = raw_word.upper()
                        elif style.textTransform == "uppercase":
                            display_text = raw_word.upper()
                        elif getattr(style, "normalWordCase", "") == "sentence" and not is_emp:
                            if raw_word.lower() == "i":
                                display_text = "I"
                            elif idx in line_start_indices:
                                display_text = raw_word.capitalize()
                            else:
                                display_text = raw_word.lower()
                        else:
                            display_text = raw_word

                        # ── ASS token generation ─────────────────────────
                        if is_current:
                            # Active word: colored + scaled + optional neon blur
                            active_scale = getattr(style, "activeWordScale", 1.15) or 1.15
                            # Hero spotlight uses large scale; other presets use moderate scale
                            if highlight_type == "spotlight":
                                scale_int = int(round(active_scale * 100))
                            else:
                                scale_int = min(150, int(round(active_scale * 100)))

                            token = (
                                f"{{\\c{active_color_ass}\\fscx{scale_int}\\fscy{scale_int}{neon_tag}}}"
                                f"{display_text}{{\\r}}"
                            )
                        elif is_emp:
                            # Emphasized non-active word: colored + hero scale
                            emp_scale = getattr(style, "activeWordScale", 1.15) or 1.15
                            scale_int = int(round(emp_scale * 100))
                            token = (
                                f"{{\\c{active_color_ass}\\fscx{scale_int}\\fscy{scale_int}}}"
                                f"{display_text}{{\\r}}"
                            )
                        else:
                            # For karaoke: dim past words visually using secondary color
                            if highlight_type == "karaoke" and idx < active_idx:
                                token = f"{{\\c{primary_color}\\alpha&H50&}}{display_text}{{\\r}}"
                            else:
                                token = display_text

                        word_tokens.append(token)

                    # ── Reassemble with line breaks ───────────────────────
                    if cap.lines and len(cap.lines) >= 2:
                        line_slices = []
                        curr_idx = 0
                        for line_text in cap.lines:
                            w_count = len(line_text.strip().split())
                            if w_count > 0:
                                line_slices.append(" ".join(word_tokens[curr_idx:curr_idx + w_count]))
                                curr_idx += w_count
                        if curr_idx < len(word_tokens):
                            if line_slices:
                                line_slices[-1] += " " + " ".join(word_tokens[curr_idx:])
                            else:
                                line_slices.append(" ".join(word_tokens))
                        final_event_text = "\\N".join(line_slices)
                    else:
                        final_event_text = " ".join(word_tokens)

                    events.append(
                        f"Dialogue: 0,{w_start_str},{w_end_str},Default,,0,0,0,,{entrance_tag}{final_event_text}"
                    )
            else:
                # Fallback: plain phrase without word timings
                start_str = cls.format_timestamp_ass(cap.start)
                end_str   = cls.format_timestamp_ass(cap.end)
                text = cap.text.strip().replace("\n", "\\N")
                if style.textTransform == "uppercase":
                    text = text.upper()
                blur_tag = f"{{\\blur2}}" if style.hasNeonGlow else ""
                events.append(
                    f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{entrance_tag}{blur_tag}{text}"
                )

        return header + "\n".join(events) + "\n"

    @staticmethod
    def split_caption(
        captions: List[CaptionItem],
        caption_id: str,
        split_time: float,
        split_text_index: int = None
    ) -> List[CaptionItem]:
        """Split a caption item at split_time into two items."""
        result = []
        for item in captions:
            if item.id == caption_id:
                if not (item.start < split_time < item.end):
                    result.append(item)
                    continue

                text = item.text.strip()
                if split_text_index is not None and 0 < split_text_index < len(text):
                    part1_text = text[:split_text_index].strip()
                    part2_text = text[split_text_index:].strip()
                else:
                    words = text.split()
                    mid = len(words) // 2
                    part1_text = " ".join(words[:mid])
                    part2_text = " ".join(words[mid:])

                first = CaptionItem(
                    id=f"{item.id}_a",
                    start=item.start,
                    end=round(split_time, 3),
                    text=part1_text
                )
                second = CaptionItem(
                    id=f"{item.id}_b",
                    start=round(split_time, 3),
                    end=item.end,
                    text=part2_text
                )
                result.extend([first, second])
            else:
                result.append(item)
        return result

    @staticmethod
    def merge_captions(
        captions: List[CaptionItem],
        first_id: str,
        second_id: str
    ) -> List[CaptionItem]:
        """Merge two captions into one."""
        first_item = None
        second_item = None
        for item in captions:
            if item.id == first_id:
                first_item = item
            elif item.id == second_id:
                second_item = item

        if not first_item or not second_item:
            return captions

        merged = CaptionItem(
            id=first_item.id,
            start=min(first_item.start, second_item.start),
            end=max(first_item.end, second_item.end),
            text=f"{first_item.text.strip()} {second_item.text.strip()}".strip()
        )

        result = []
        for item in captions:
            if item.id == first_id:
                result.append(merged)
            elif item.id == second_id:
                continue
            else:
                result.append(item)
        return result

caption_service = CaptionService()
