import re
from pathlib import Path

ALLOWED_EXTENSIONS = {
    ".mp4", ".mov", ".mkv", ".avi", ".webm", ".flv", ".wmv", ".m4v",
    ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma"
}

def is_allowed_file(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def sanitize_filename(filename: str) -> str:
    # Keep alphanumeric, dashes, dots, underscores
    clean = re.sub(r"[^\w\.-]", "_", Path(filename).name)
    return clean or "upload_file"
