import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import settings
from backend.services.gpu_service import gpu_service
from backend.services.ffmpeg_service import ffmpeg_service
from backend.api import system, upload, transcription, captions, export

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("caption_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log environment diagnostic banner
    logger.info("=" * 60)
    logger.info("  LOCAL AI AUTO CAPTION GENERATOR - STARTING SERVER")
    logger.info("=" * 60)
    
    gpu_info = gpu_service.get_status()
    logger.info(f"PyTorch Version  : {gpu_info['torchVersion']}")
    logger.info(f"CUDA Available   : {gpu_info['cudaAvailable']}")
    logger.info(f"Inference Device : {gpu_info['device'].upper()}")
    if gpu_info["cudaAvailable"]:
        logger.info(f"GPU Hardware     : {gpu_info['gpuName']}")
        logger.info(f"Total VRAM       : {gpu_info['totalVramGb']} GB")
        logger.info(f"Compute Type     : {gpu_info['recommendedComputeType']}")
        logger.info(f"Batch Size       : {gpu_info['recommendedBatchSize']}")
    else:
        logger.warning("CUDA is NOT available. WhisperX will run on CPU.")

    ffmpeg_info = ffmpeg_service.get_info()
    if ffmpeg_info["available"]:
        logger.info(f"FFmpeg Status    : AVAILABLE ({ffmpeg_info['ffmpegPath']})")
    else:
        logger.warning("FFmpeg Status    : NOT FOUND! Audio extraction and video burning will fail.")
        
    logger.info(f"Web Server Local : http://{settings.HOST}:{settings.PORT}")
    logger.info("=" * 60)
    yield
    logger.info("Shutting down Local AI Auto Caption Generator.")

app = FastAPI(
    title="Local AI Auto Caption Generator",
    description="GPU-accelerated local auto-captioning studio using WhisperX and FFmpeg.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for media uploads and rendered outputs
app.mount("/media/uploads", StaticFiles(directory=str(settings.UPLOADS_PATH)), name="uploads")
app.mount("/media/outputs", StaticFiles(directory=str(settings.OUTPUTS_PATH)), name="outputs")

# Include API routers
app.include_router(system.router)
app.include_router(upload.router)
app.include_router(transcription.router)
app.include_router(captions.router)
app.include_router(export.router)

# Serve pre-built frontend SPA if frontend/dist exists
index_html_path = settings.FRONTEND_DIST_PATH / "index.html"
assets_path = settings.FRONTEND_DIST_PATH / "assets"

if settings.FRONTEND_DIST_PATH.exists() and index_html_path.exists():
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="static_assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(index_html_path)

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith(("api/", "media/")):
            return None
        target_file = settings.FRONTEND_DIST_PATH / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(index_html_path)
else:
    @app.get("/")
    def serve_fallback():
        from fastapi.responses import HTMLResponse
        return HTMLResponse("""
        <!DOCTYPE html>
        <html>
        <head><title>Auto Caption Studio - Backend Running</title></head>
        <body style="font-family: sans-serif; background: #0f111a; color: #fff; padding: 40px; text-align: center;">
            <h1 style="color: #6366f1;">Auto Caption Studio Backend is Online</h1>
            <p>The FastAPI backend server is active and listening.</p>
            <p style="color: #94a3b8;">API Documentation is available at <a href="/docs" style="color: #818cf8;">/docs</a></p>
            <p style="color: #f59e0b;">Frontend dist folder not found. Please update git repository to include pre-built frontend.</p>
        </body>
        </html>
        """)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
