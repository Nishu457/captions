import gc
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

from backend.config import settings
from backend.services.gpu_service import gpu_service
from backend.models.caption_models import CaptionItem

logger = logging.getLogger("caption_app.whisper")

class WhisperService:
    _instance = None

    def __init__(self):
        # Cache loaded WhisperX models in memory: {model_name: model_instance}
        self.cached_models: Dict[str, Any] = {}
        self.current_model_name: Optional[str] = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = WhisperService()
        return cls._instance

    def _get_or_load_model(self, model_name: str):
        """Load WhisperX model or retrieve from cache."""
        try:
            import whisperx
        except ImportError:
            raise RuntimeError(
                "WhisperX is not installed in the current Python environment. "
                "Ensure you run this on Laptop B where WhisperX 3.8.6 is installed."
            )

        if model_name in self.cached_models:
            logger.info(f"Reusing cached WhisperX model: '{model_name}'")
            return self.cached_models[model_name]

        # Free previously cached models if switching to another to prevent VRAM accumulation
        if self.cached_models:
            logger.info("Unloading previous WhisperX model to preserve VRAM...")
            self.cached_models.clear()
            gpu_service.empty_cache()

        device = gpu_service.device
        compute_type = gpu_service.recommended_compute_type

        logger.info(
            f"Loading WhisperX model '{model_name}' on device='{device}' "
            f"with compute_type='{compute_type}'..."
        )

        try:
            model = whisperx.load_model(
                model_name,
                device=device,
                compute_type=compute_type
            )
            self.cached_models[model_name] = model
            self.current_model_name = model_name
            return model
        except Exception as e:
            # If float16 causes issue, retry with int8
            if device == "cuda" and compute_type != "int8":
                logger.warning(f"Failed with compute_type='{compute_type}', retrying with 'int8': {e}")
                gpu_service.empty_cache()
                model = whisperx.load_model(
                    model_name,
                    device=device,
                    compute_type="int8"
                )
                self.cached_models[model_name] = model
                self.current_model_name = model_name
                return model
            raise

    def transcribe(
        self,
        audio_path: Path,
        model_name: str = "small",
        language: Optional[str] = None,
        align: bool = True,
        batch_size: Optional[int] = None,
        progress_callback = None
    ) -> Dict[str, Any]:
        """
        Transcribe 16kHz WAV audio using WhisperX and optional word alignment.
        """
        try:
            import whisperx
        except ImportError:
            raise RuntimeError(
                "WhisperX is not installed. Please run on the configured GPU laptop."
            )

        if progress_callback:
            progress_callback(30, "Loading WhisperX model into GPU memory...")

        model = self._get_or_load_model(model_name)

        if progress_callback:
            progress_callback(50, "Loading audio file...")

        audio = whisperx.load_audio(str(audio_path))

        effective_batch_size = batch_size or gpu_service.recommended_batch_size

        if progress_callback:
            progress_callback(60, f"Transcribing audio with batch size {effective_batch_size}...")

        logger.info(f"Starting WhisperX transcription (language={language}, batch_size={effective_batch_size})...")

        kwargs = {"batch_size": effective_batch_size}
        if language and language.lower() != "auto":
            kwargs["language"] = language.lower()

        raw_result = model.transcribe(audio, **kwargs)
        detected_language = raw_result.get("language", language or "en")
        logger.info(f"Transcription complete. Detected language: {detected_language}")

        # Optional Alignment step
        if align and raw_result.get("segments"):
            if progress_callback:
                progress_callback(80, "Aligning word timestamps...")
            try:
                device = gpu_service.device
                logger.info(f"Loading alignment model for language: {detected_language}...")
                align_model, align_metadata = whisperx.load_align_model(
                    language_code=detected_language,
                    device=device
                )
                raw_result = whisperx.align(
                    raw_result["segments"],
                    align_model,
                    align_metadata,
                    audio,
                    device,
                    return_char_alignments=False
                )
                # Free alignment model right away to save VRAM
                del align_model
                del align_metadata
                gpu_service.empty_cache()
                logger.info("Alignment finished successfully.")
            except Exception as e:
                logger.warning(f"Alignment step skipped or failed ({e}), using base segment timestamps.")

        if progress_callback:
            progress_callback(95, "Formatting timestamped captions...")

        # Convert WhisperX segments into internal CaptionItem format
        captions: List[CaptionItem] = []
        raw_segments = raw_result.get("segments", [])
        
        for idx, seg in enumerate(raw_segments, start=1):
            text = seg.get("text", "").strip()
            if not text:
                continue
            start_t = round(float(seg.get("start", 0.0)), 3)
            end_t = round(float(seg.get("end", start_t + 1.0)), 3)
            if end_t <= start_t:
                end_t = start_t + 0.5

            captions.append(
                CaptionItem(
                    id=f"cap_{idx:03d}",
                    start=start_t,
                    end=end_t,
                    text=text
                )
            )

        gpu_service.empty_cache()

        return {
            "language": detected_language,
            "captions": captions,
            "segmentCount": len(captions)
        }

whisper_service = WhisperService.get_instance()
