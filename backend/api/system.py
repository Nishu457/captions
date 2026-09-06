from fastapi import APIRouter
from backend.services.gpu_service import gpu_service
from backend.services.ffmpeg_service import ffmpeg_service

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/health")
def health_check():
    return {"status": "ok", "app": "Local AI Auto Caption Generator"}

@router.get("/gpu")
def get_gpu_info():
    return gpu_service.get_status()

@router.get("/ffmpeg")
def get_ffmpeg_info():
    return ffmpeg_service.get_info()
