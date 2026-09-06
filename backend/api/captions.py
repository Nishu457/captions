import json
from pathlib import Path
from typing import List
from fastapi import APIRouter, HTTPException

from backend.config import settings
from backend.models.caption_models import (
    CaptionItem,
    ProjectData,
    SplitCaptionRequest,
    MergeCaptionRequest,
    ResegmentRequest
)
from backend.services.caption_service import caption_service

router = APIRouter(prefix="/api/captions", tags=["Captions"])

@router.post("/split")
def split_caption(request: SplitCaptionRequest, captions: List[CaptionItem]):
    updated = caption_service.split_caption(
        captions,
        request.captionId,
        request.splitTime,
        request.splitTextIndex
    )
    return {"captions": updated}

@router.post("/merge")
def merge_captions(request: MergeCaptionRequest, captions: List[CaptionItem]):
    updated = caption_service.merge_captions(
        captions,
        request.firstCaptionId,
        request.secondCaptionId
    )
    return {"captions": updated}

@router.post("/resegment")
def resegment_captions(request: ResegmentRequest):
    from backend.services.segmentation_service import segmentation_service
    updated = segmentation_service.resegment_captions(request.captions, density=request.density)
    return {"captions": updated}

@router.post("/project/save")
def save_project(project: ProjectData):
    project_file = settings.PROJECTS_PATH / f"{project.metadata.id}.json"
    with open(project_file, "w", encoding="utf-8") as f:
        f.write(project.model_dump_json(indent=2))
    return {"status": "saved", "projectId": project.metadata.id}

@router.get("/project/{project_id}")
def load_project(project_id: str):
    project_file = settings.PROJECTS_PATH / f"{project_id}.json"
    if not project_file.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    with open(project_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
