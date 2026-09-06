from pathlib import Path
from pydantic_settings import BaseSettings

# Base directories using relative paths (zero hardcoded absolute paths)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
DATA_DIR = PROJECT_ROOT / "data"

UPLOADS_DIR = DATA_DIR / "uploads"
TEMP_DIR = DATA_DIR / "temp"
PROJECTS_DIR = DATA_DIR / "projects"
OUTPUTS_DIR = DATA_DIR / "outputs"

FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dist"

# Ensure runtime directories exist
for folder in [UPLOADS_DIR, TEMP_DIR, PROJECTS_DIR, OUTPUTS_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    # Server settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False

    # Storage paths
    PROJECT_ROOT_PATH: Path = PROJECT_ROOT
    UPLOADS_PATH: Path = UPLOADS_DIR
    TEMP_PATH: Path = TEMP_DIR
    PROJECTS_PATH: Path = PROJECTS_DIR
    OUTPUTS_PATH: Path = OUTPUTS_DIR
    FRONTEND_DIST_PATH: Path = FRONTEND_DIST_DIR

    # AI & WhisperX Settings tuned for RTX 3050 6GB Laptop GPU
    DEFAULT_WHISPER_MODEL: str = "small"  # tiny, base, small, medium, large-v3
    DEFAULT_BATCH_SIZE: int = 8           # Safe memory usage for 6GB VRAM
    DEFAULT_COMPUTE_TYPE: str = "float16" # float16 on CUDA, int8 on CPU
    DEFAULT_ALIGNMENT: bool = True

    # Subtitle defaults
    MAX_CHARS_PER_LINE: int = 42

    class Config:
        env_prefix = "CAPTION_"

settings = Settings()
