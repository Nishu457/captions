import uuid
import asyncio
from typing import Dict, Optional, AsyncGenerator
from backend.models.job_models import JobProgress, JobStatus

class JobManager:
    _instance = None

    def __init__(self):
        self.jobs: Dict[str, JobProgress] = {}
        self.listeners: Dict[str, list[asyncio.Queue]] = {}

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = JobManager()
        return cls._instance

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())[:8]
        self.jobs[job_id] = JobProgress(
            jobId=job_id,
            status=JobStatus.PENDING,
            step="Queued",
            progressPercent=0,
            message="Job queued for processing"
        )
        self.listeners[job_id] = []
        return job_id

    def update_job(
        self,
        job_id: str,
        status: Optional[JobStatus] = None,
        step: Optional[str] = None,
        progress: Optional[int] = None,
        message: Optional[str] = None,
        error: Optional[str] = None,
        result: Optional[dict] = None
    ):
        if job_id not in self.jobs:
            return

        job = self.jobs[job_id]
        if status is not None:
            job.status = status
        if step is not None:
            job.step = step
        if progress is not None:
            job.progressPercent = max(0, min(100, progress))
        if message is not None:
            job.message = message
        if error is not None:
            job.error = error
        if result is not None:
            job.result = result

        # Notify any active SSE subscribers
        queues = self.listeners.get(job_id, [])
        for q in queues:
            try:
                q.put_nowait(job.model_dump())
            except Exception:
                pass

    def get_job(self, job_id: str) -> Optional[JobProgress]:
        return self.jobs.get(job_id)

    async def subscribe(self, job_id: str) -> AsyncGenerator[dict, None]:
        """Async generator for Server-Sent Events (SSE)."""
        if job_id not in self.jobs:
            return

        q = asyncio.Queue()
        if job_id not in self.listeners:
            self.listeners[job_id] = []
        self.listeners[job_id].append(q)

        # Send initial state immediately
        yield self.jobs[job_id].model_dump()

        try:
            while True:
                data = await q.get()
                yield data
                if data.get("status") in [JobStatus.COMPLETED.value, JobStatus.FAILED.value, JobStatus.CANCELLED.value]:
                    break
        finally:
            if job_id in self.listeners and q in self.listeners[job_id]:
                self.listeners[job_id].remove(q)

job_manager = JobManager.get_instance()
