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
    presetName: Optional[str] = "Hero Spotlight"
    fontFamily: str = "Poppins, sans-serif"
    fontSize: int = 36  # px base size
    fontWeight: str = "600"  # 400, 600, 700, 800, 900
    heroFontWeight: str = "900"
    textColor: str = "#FFFFFF"
    textOpacity: float = 1.0
    
    # Active Word / Spotlight Styling
    activeWordColor: str = "#3091F7"  # Exact electric blue from reference video
    activeWordScale: float = 2.15     # 2.15x scale for hero spotlight word
    activeWordBackground: Optional[str] = None # For highlight pill
    activeWordBgRadius: int = 8
    spotlightCase: str = "uppercase"  # "uppercase", "normal", "capitalize"
    normalWordCase: str = "sentence"  # "sentence", "uppercase", "normal"
    highlightType: str = "spotlight"   # "spotlight", "karaoke", "pill", "scale", "neon", "reveal", "none"

    # Background Box / Pill
    backgroundColor: str = "#000000"
    backgroundOpacity: float = 0.0  # 0 to 1
    hasBackgroundBox: bool = False
    backgroundPadding: int = 8
    borderRadius: int = 8
    
    # Outline & Shadow
    outlineColor: str = "#000000"
    outlineWidth: int = 0  # 0px matching reference video (clean, no harsh stroke)
    hasShadow: bool = True
    shadowColor: str = "rgba(0, 0, 0, 0.65)"
    shadowBlur: int = 16
    shadowOffsetX: int = 0
    shadowOffsetY: int = 4
    
    # Neon Glow Aura
    hasNeonGlow: bool = True
    neonColor: str = "#3091F7"
    neonIntensity: int = 14

    # Layout & Density
    position: str = "left-chest"  # "left-chest", "bottom", "top", "middle", "custom"
    horizontalPercent: int = 22   # % from left (reference sweet spot)
    verticalPositionPercent: int = 58  # % from top (chest level)
    alignment: str = "left"       # "left" matching reference video
    maxWidthPercent: int = 70
    letterSpacing: float = 0.5  # px
    lineSpacing: float = 1.15
    textTransform: str = "none"  # Default fallback
    density: str = "balanced"   # "compact", "balanced", "relaxed"
    maxWordsPerCaption: int = 5
    maxLines: int = 3
    maxCharactersPerLine: int = 28

    # Dynamic Animation
    animationPreset: str = "smooth-fade"  # legacy compat
    animation: Optional[Dict[str, Any]] = None  # Full animation config from preset schema
    
    # Extended preset fields (new schema)
    highlightColor: Optional[str] = None
    category: Optional[str] = None


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
