from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field
from backend.models.caption_models import CaptionItem

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class JobProgress(BaseModel):
    jobId: str
    status: JobStatus = JobStatus.PENDING
    step: str = "Initializing"
    progressPercent: int = 0
    message: str = "Job created"
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class TranscriptionRequest(BaseModel):
    filename: str
    model: str = "small"
    language: Optional[str] = None  # None for auto-detect
    align: bool = True
    batchSize: int = 8
