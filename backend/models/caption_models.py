from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CaptionItem(BaseModel):
    id: str
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    text: str = Field(..., description="Caption text")

class CaptionStyle(BaseModel):
    fontFamily: str = "Inter, sans-serif"
    fontSize: int = 24  # px or pt
    fontWeight: str = "700"  # 400, 600, 700, 800, 900
    textColor: str = "#FFFFFF"
    textOpacity: float = 1.0
    backgroundColor: str = "#000000"
    backgroundOpacity: float = 0.6  # 0 to 1
    hasBackgroundBox: bool = True
    backgroundPadding: int = 8
    borderRadius: int = 6
    outlineColor: str = "#000000"
    outlineWidth: int = 2  # px
    hasShadow: bool = True
    shadowColor: str = "rgba(0, 0, 0, 0.75)"
    shadowBlur: int = 4
    shadowOffsetX: int = 2
    shadowOffsetY: int = 2
    position: str = "bottom"  # "bottom", "top", "middle", "custom"
    verticalPositionPercent: int = 85  # % from top when position="custom"
    alignment: str = "center"  # "left", "center", "right"
    maxWidthPercent: int = 90
    letterSpacing: float = 0.5  # px
    lineSpacing: float = 1.2
    textTransform: str = "none"  # "none", "uppercase", "capitalize"
    hasNeonGlow: bool = False
    neonColor: str = "#00F0FF"
    neonIntensity: int = 20
    animationPreset: str = "pop"  # "pop", "bounce", "zoom", "fade", "none"
    presetName: Optional[str] = "Hormozi Pop"

class ProjectMetadata(BaseModel):
    id: str
    title: str
    videoFilename: str
    originalFilename: str
    duration: float = 0.0
    fps: float = 30.0
    width: int = 1920
    height: int = 1080
    language: Optional[str] = "en"
    whisperModel: Optional[str] = "small"
    createdAt: str
    updatedAt: str

class ProjectData(BaseModel):
    metadata: ProjectMetadata
    captions: List[CaptionItem] = []
    style: CaptionStyle = CaptionStyle()

class SplitCaptionRequest(BaseModel):
    captionId: str
    splitTime: float
    splitTextIndex: Optional[int] = None

class MergeCaptionRequest(BaseModel):
    firstCaptionId: str
    secondCaptionId: str

class ExportRequest(BaseModel):
    format: str = Field(..., description="srt, vtt, ass, txt, or mp4")
    captions: List[CaptionItem]
    style: Optional[CaptionStyle] = None
    videoFilename: Optional[str] = None
