"""Application configuration"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    api_host: str = "127.0.0.1"
    api_port: int = 8000

    # Audio Processing
    demucs_model: str = "htdemucs"  # or "htdemucs_ft" for fine-tuned
    max_file_size: int = 100 * 1024 * 1024  # 100MB

    # Paths
    upload_dir: Path = Path("./uploads")
    output_dir: Path = Path("./outputs")
    cache_dir: Path = Path("./cache")

    # Performance
    use_gpu: bool = True
    max_workers: int = 2

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure directories exist
settings.upload_dir.mkdir(exist_ok=True)
settings.output_dir.mkdir(exist_ok=True)
settings.cache_dir.mkdir(exist_ok=True)
