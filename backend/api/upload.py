import time
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
import aiofiles

from backend.config import settings
from backend.services.ffmpeg_service import ffmpeg_service
from backend.utils.file_utils import is_allowed_file, sanitize_filename

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {Path(file.filename).suffix}. Supported formats: MP4, MOV, MKV, WEBM, MP3, WAV, etc."
        )

    safe_name = sanitize_filename(file.filename)
    timestamp = int(time.time())
    unique_filename = f"{timestamp}_{safe_name}"
    dest_path = settings.UPLOADS_PATH / unique_filename

    # Stream write in 1MB chunks to support large files cleanly
    try:
        async with aiofiles.open(dest_path, "wb") as out_file:
            while chunk := await file.read(1024 * 1024):
                await out_file.write(chunk)
    except Exception as e:
        if dest_path.exists():
            dest_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}")

    # Probe media metadata
    metadata = ffmpeg_service.probe_media(dest_path)

    return {
        "filename": unique_filename,
        "originalFilename": file.filename,
        "videoUrl": f"/media/uploads/{unique_filename}",
        "metadata": metadata
    }
