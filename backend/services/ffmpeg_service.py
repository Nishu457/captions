import shutil
import subprocess
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger("caption_app.ffmpeg")

class FFmpegService:
    def __init__(self):
        self.ffmpeg_path = shutil.which("ffmpeg")
        self.ffprobe_path = shutil.which("ffprobe")
        if not self.ffmpeg_path:
            logger.warning("FFmpeg binary not found in system PATH.")
        if not self.ffprobe_path:
            logger.warning("FFprobe binary not found in system PATH.")

    def is_available(self) -> bool:
        return bool(self.ffmpeg_path)

    def get_info(self) -> Dict[str, Any]:
        return {
            "available": self.is_available(),
            "ffmpegPath": self.ffmpeg_path or "Not found",
            "ffprobePath": self.ffprobe_path or "Not found"
        }

    def probe_media(self, file_path: Path) -> Dict[str, Any]:
        """Inspect media file to extract duration, resolution, audio streams."""
        if not self.ffprobe_path:
            # Fallback if ffprobe is not found
            return {"duration": 0.0, "width": 1920, "height": 1080, "fps": 30.0, "hasAudio": True}

        cmd = [
            self.ffprobe_path,
            "-v", "error",
            "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
            "-of", "json",
            str(file_path)
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=15)
            data = json.loads(res.stdout)
            
            duration = float(data.get("format", {}).get("duration", 0.0))
            width = 1920
            height = 1080
            fps = 30.0
            has_audio = False

            for stream in data.get("streams", []):
                ctype = stream.get("codec_type")
                if ctype == "video":
                    width = stream.get("width", width)
                    height = stream.get("height", height)
                    r_fps = stream.get("r_frame_rate", "30/1")
                    try:
                        num, den = map(int, r_fps.split("/"))
                        if den > 0:
                            fps = round(num / den, 2)
                    except Exception:
                        pass
                elif ctype == "audio":
                    has_audio = True

            return {
                "duration": duration,
                "width": width,
                "height": height,
                "fps": fps,
                "hasAudio": has_audio
            }
        except Exception as e:
            logger.error(f"Error probing media file {file_path}: {e}")
            return {"duration": 0.0, "width": 1920, "height": 1080, "fps": 30.0, "hasAudio": True}

    def extract_audio(self, video_path: Path, output_wav_path: Path) -> Path:
        """
        Extract audio as 16kHz mono 16-bit PCM WAV.
        This is the standard, highest-accuracy format for WhisperX.
        """
        if not self.ffmpeg_path:
            raise RuntimeError("FFmpeg is not installed or not in system PATH. Cannot extract audio.")

        output_wav_path.parent.mkdir(parents=True, exist_ok=True)
        
        cmd = [
            self.ffmpeg_path,
            "-y",                     # Overwrite output
            "-i", str(video_path),
            "-vn",                    # Discard video
            "-acodec", "pcm_s16le",   # 16-bit PCM
            "-ar", "16000",           # 16kHz sample rate
            "-ac", "1",               # Mono channel
            str(output_wav_path)
        ]

        logger.info(f"Extracting audio to 16kHz mono WAV: {output_wav_path.name}")
        process = subprocess.run(cmd, capture_output=True, text=True)
        if process.returncode != 0:
            logger.error(f"FFmpeg audio extraction failed: {process.stderr}")
            raise RuntimeError(f"FFmpeg audio extraction failed: {process.stderr[-300:]}")

        return output_wav_path

    def burn_subtitles(
        self,
        video_path: Path,
        subtitle_path: Path,
        output_video_path: Path,
        use_ass: bool = True
    ) -> Path:
        """
        Burn subtitles into video using FFmpeg.
        Uses ASS filter for rich styling (fonts, colors, outline, shadow, position).
        """
        if not self.ffmpeg_path:
            raise RuntimeError("FFmpeg is not installed or not in system PATH. Cannot burn subtitles.")

        output_video_path.parent.mkdir(parents=True, exist_ok=True)

        # On Windows, FFmpeg subtitles/ass filter needs path escaping:
        # Colons need backslash escaping (e.g. C\:...) and backslashes converted to forward slashes.
        sub_path_str = str(subtitle_path.resolve()).replace("\\", "/")
        if ":" in sub_path_str:
            drive, rest = sub_path_str.split(":", 1)
            sub_path_str = f"{drive}\\:{rest}"

        filter_name = "ass" if use_ass else "subtitles"
        video_filter = f"{filter_name}='{sub_path_str}'"

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", str(video_path),
            "-vf", video_filter,
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "20",
            "-c:a", "copy",
            str(output_video_path)
        ]

        logger.info(f"Burning subtitles into {output_video_path.name} using {filter_name} filter...")
        process = subprocess.run(cmd, capture_output=True, text=True)
        if process.returncode != 0:
            logger.error(f"FFmpeg subtitle burn failed: {process.stderr}")
            # Try fallback to standard subtitles filter if ASS failed
            if use_ass:
                logger.info("Retrying burn with standard subtitles filter...")
                return self.burn_subtitles(video_path, subtitle_path, output_video_path, use_ass=False)
            raise RuntimeError(f"FFmpeg subtitle burning failed: {process.stderr[-300:]}")

        return output_video_path

ffmpeg_service = FFmpegService()
