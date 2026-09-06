import time
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse

from backend.config import settings
from backend.models.caption_models import ExportRequest, CaptionStyle
from backend.services.caption_service import caption_service
from backend.services.ffmpeg_service import ffmpeg_service

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.post("/subtitles")
def export_subtitles(request: ExportRequest):
    fmt = request.format.lower()
    captions = request.captions

    if fmt == "srt":
        content = caption_service.to_srt(captions)
        media_type = "application/x-subrip"
        filename = "captions.srt"
    elif fmt == "vtt":
        content = caption_service.to_vtt(captions)
        media_type = "text/vtt"
        filename = "captions.vtt"
    elif fmt == "ass":
        style = request.style or CaptionStyle()
        content = caption_service.to_ass(captions, style)
        media_type = "text/x-ssa"
        filename = "captions.ass"
    elif fmt == "txt":
        content = caption_service.to_txt(captions)
        media_type = "text/plain"
        filename = "captions.txt"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{fmt}' for subtitle export.")

    return Response(
        content=content.encode("utf-8"),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/burn-video")
def burn_video(request: ExportRequest):
    if not request.videoFilename:
        raise HTTPException(status_code=400, detail="videoFilename is required for video burning.")

    video_path = settings.UPLOADS_PATH / request.videoFilename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail=f"Source video '{request.videoFilename}' not found.")

    style = request.style or CaptionStyle()
    
    # 1. Write temporary ASS subtitle file
    timestamp = int(time.time())
    ass_content = caption_service.to_ass(request.captions, style)
    temp_ass_path = settings.TEMP_PATH / f"burn_{timestamp}.ass"
    with open(temp_ass_path, "w", encoding="utf-8") as f:
        f.write(ass_content)

    # 2. Render burned output video
    output_filename = f"captioned_{timestamp}_{video_path.name}"
    output_video_path = settings.OUTPUTS_PATH / output_filename

    try:
        ffmpeg_service.burn_subtitles(
            video_path=video_path,
            subtitle_path=temp_ass_path,
            output_video_path=output_video_path,
            use_ass=True
        )
    finally:
        if temp_ass_path.exists():
            try:
                temp_ass_path.unlink()
            except Exception:
                pass

    return {
        "status": "success",
        "outputFilename": output_filename,
        "downloadUrl": f"/media/outputs/{output_filename}"
    }

@router.get("/download/{filename}")
def download_output_file(filename: str):
    file_path = settings.OUTPUTS_PATH / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)
