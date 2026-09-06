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
        """Generate full ASS (Advanced SubStation Alpha) subtitle file with rich styling and neon bloom."""
        primary_color = cls._hex_to_ass_color(style.textColor, style.textOpacity)
        back_color = cls._hex_to_ass_color(style.backgroundColor, style.backgroundOpacity)
        outline_color = cls._hex_to_ass_color(style.outlineColor, 1.0)
        
        # Determine ASS alignment:
        # 1=bottom-left, 2=bottom-center, 3=bottom-right
        # 4=middle-left, 5=middle-center, 6=middle-right
        # 7=top-left, 8=top-center, 9=top-right
        align_row = 2  # bottom default
        if style.position == "top":
            align_row = 8
        elif style.position == "middle":
            align_row = 5

        if style.alignment == "left":
            align_val = align_row - 1
        elif style.alignment == "right":
            align_val = align_row + 1
        else:
            align_val = align_row

        font_clean = style.fontFamily.split(",")[0].replace("'", "").replace('"', '').strip()
        bold_flag = -1 if int(style.fontWeight) >= 600 else 0
        border_style = 3 if style.hasBackgroundBox else 1  # 3 = opaque box, 1 = outline + shadow

        # Shadow depth and color
        shadow_depth = style.shadowBlur if style.hasShadow else 0
        if style.hasNeonGlow:
            # For neon glow, use neon color for shadow aura
            shadow_color = cls._hex_to_ass_color(style.neonColor, 0.8)
            shadow_depth = min(8, style.neonIntensity // 3)
        else:
            shadow_color = back_color

        margin_v = 40
        if style.position == "custom":
            margin_v = int((100 - style.verticalPositionPercent) * 7.2)
        elif style.position == "middle":
            margin_v = 0

        header = f"""[Script Info]
Title: Auto Captions
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_clean},{style.fontSize * 2},{primary_color},&H000000FF,{outline_color},{shadow_color},{bold_flag},0,0,0,100,100,{style.letterSpacing},0,{border_style},{style.outlineWidth},{shadow_depth},{align_val},40,40,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        events = []
        for cap in captions:
            start_str = cls.format_timestamp_ass(cap.start)
            end_str = cls.format_timestamp_ass(cap.end)
            text = cap.text.strip().replace("\n", "\\N")
            if style.textTransform == "uppercase":
                text = text.upper()
            elif style.textTransform == "capitalize":
                text = text.title()

            # Add ASS blur tag for neon glow bloom if enabled
            tag_prefix = "{\\blur3}" if style.hasNeonGlow else ""
            events.append(f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{tag_prefix}{text}")

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
