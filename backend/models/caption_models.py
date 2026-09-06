from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class WordItem(BaseModel):
    word: str
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    score: Optional[float] = 1.0
    isEmphasized: Optional[bool] = False

class CaptionItem(BaseModel):
    id: str
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    text: str = Field(..., description="Caption text")
    words: List[WordItem] = []
    lines: Optional[List[str]] = []

class CaptionStyle(BaseModel):
    presetName: Optional[str] = "Upper Dynamic"
    fontFamily: str = "Montserrat, sans-serif"
    fontSize: int = 34  # px
    fontWeight: str = "900"  # 400, 600, 700, 800, 900
    textColor: str = "#FFFFFF"
    textOpacity: float = 1.0
    
    # Active Word / Spotlight Styling
    activeWordColor: str = "#00B4D8"  # Electric blue / spotlight color
    activeWordScale: float = 1.15     # Scale factor for active/spotlight word
    activeWordBackground: Optional[str] = None # For highlight pill
    activeWordBgRadius: int = 8
    spotlightCase: str = "uppercase"  # "uppercase", "normal", "capitalize"
    normalWordCase: str = "sentence"  # "sentence", "uppercase", "normal"
    highlightType: str = "karaoke"    # "karaoke", "spotlight", "pill", "scale", "neon", "reveal", "none"

    # Background Box / Pill
    backgroundColor: str = "#000000"
    backgroundOpacity: float = 0.0  # 0 to 1
    hasBackgroundBox: bool = False
    backgroundPadding: int = 8
    borderRadius: int = 8
    
    # Outline & Shadow
    outlineColor: str = "#000000"
    outlineWidth: int = 3  # px
    hasShadow: bool = True
    shadowColor: str = "rgba(0, 0, 0, 0.9)"
    shadowBlur: int = 12
    shadowOffsetX: int = 2
    shadowOffsetY: int = 3
    
    # Neon Glow Aura
    hasNeonGlow: bool = False
    neonColor: str = "#00F0FF"
    neonIntensity: int = 20

    # Layout & Density
    position: str = "middle"  # "bottom", "top", "middle", "custom"
    verticalPositionPercent: int = 60  # % from top when position="custom" or "middle"
    alignment: str = "center"  # "left", "center", "right"
    maxWidthPercent: int = 88
    letterSpacing: float = 0.8  # px
    lineSpacing: float = 1.15
    textTransform: str = "none"  # Default fallback
    density: str = "balanced"   # "compact", "balanced", "relaxed"
    maxWordsPerCaption: int = 5
    maxLines: int = 2
    maxCharactersPerLine: int = 28

    # Dynamic Animation
    animationPreset: str = "pop"  # "pop", "bounce", "zoom", "fade", "glitch", "none"

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

class ResegmentRequest(BaseModel):
    density: str = "balanced"  # "compact", "balanced", "relaxed"
    captions: List[CaptionItem]

class ExportRequest(BaseModel):
    format: str = Field(..., description="srt, vtt, ass, txt, or mp4")
    captions: List[CaptionItem]
    style: Optional[CaptionStyle] = None
    videoFilename: Optional[str] = None
