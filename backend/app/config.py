"""Application configuration"""
from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    api_host: str = "127.0.0.1"
    api_port: int = 8000

    # Audio Processing
    max_file_size: int = 100 * 1024 * 1024  # 100MB

    # Demucs Model Settings
    demucs_model_default: str = "htdemucs_ft"  # Default model if auto-detection disabled
    demucs_segment: Optional[int] = None  # Auto-determined based on system
    demucs_shifts_default: int = 1  # Default quality (1-5)
    demucs_overlap: float = 0.25

    # System Detection
    auto_detect_capabilities: bool = True
    force_cpu: bool = False  # Override GPU detection

    # Paths
    upload_dir: Path = Path("./uploads")
    output_dir: Path = Path("./outputs")
    cache_dir: Path = Path("./cache")

    # Performance
    use_gpu: bool = True  # Deprecated - use auto_detect_capabilities
    max_workers: int = 2
    processing_timeout: int = 600  # 10 minutes max

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure directories exist
settings.upload_dir.mkdir(exist_ok=True)
settings.output_dir.mkdir(exist_ok=True)
settings.cache_dir.mkdir(exist_ok=True)
