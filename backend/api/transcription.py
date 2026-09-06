import asyncio
import json
import logging
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse

from backend.config import settings
from backend.models.job_models import TranscriptionRequest, JobStatus
from backend.services.job_manager import job_manager
from backend.services.ffmpeg_service import ffmpeg_service
from backend.services.whisper_service import whisper_service
from backend.services.gpu_service import gpu_service

logger = logging.getLogger("caption_app.transcription_api")

router = APIRouter(prefix="/api/transcription", tags=["Transcription"])

def run_transcription_worker(job_id: str, request: TranscriptionRequest):
    """Background worker executing the audio extraction and WhisperX pipeline."""
    video_path = settings.UPLOADS_PATH / request.filename
    temp_wav_path = settings.TEMP_PATH / f"{job_id}_audio.wav"

    try:
        job_manager.update_job(
            job_id,
            status=JobStatus.PROCESSING,
            step="Extracting audio...",
            progress=15,
            message="Extracting 16kHz audio with FFmpeg"
        )

        if not video_path.exists():
            raise FileNotFoundError(f"Media file '{request.filename}' not found on server.")

        # 1. FFmpeg extraction
        ffmpeg_service.extract_audio(video_path, temp_wav_path)

        # 2. WhisperX Transcription
        def on_whisper_progress(percent: int, msg: str):
            job_manager.update_job(
                job_id,
                step=msg,
                progress=percent,
                message=msg
            )

        job_manager.update_job(
            job_id,
            step="Loading WhisperX...",
            progress=30,
            message=f"Initializing model '{request.model}' on {gpu_service.device.upper()}"
        )

        result = whisper_service.transcribe(
            audio_path=temp_wav_path,
            model_name=request.model,
            language=request.language,
            align=request.align,
            batch_size=request.batchSize,
            progress_callback=on_whisper_progress
        )

        job_manager.update_job(
            job_id,
            status=JobStatus.COMPLETED,
            step="Ready!",
            progress=100,
            message="Captions generated successfully",
            result=result
        )

    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_manager.update_job(
            job_id,
            status=JobStatus.FAILED,
            step="Failed",
            progress=0,
            error=str(e),
            message=f"Processing failed: {e}"
        )
    finally:
        # Cleanup temporary audio file
        if temp_wav_path.exists():
            try:
                temp_wav_path.unlink()
            except Exception:
                pass
        gpu_service.empty_cache()

@router.post("/start")
def start_transcription(request: TranscriptionRequest, background_tasks: BackgroundTasks):
    job_id = job_manager.create_job()
    background_tasks.add_task(run_transcription_worker, job_id, request)
    return {"jobId": job_id, "status": "queued"}

@router.get("/status/{job_id}")
def get_job_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/stream/{job_id}")
async def stream_job_progress(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        async for data in job_manager.subscribe(job_id):
            yield f"data: {json.dumps(data)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
