"""Pydantic schemas for API requests/responses"""
from pydantic import BaseModel
from typing import Optional, Dict
from enum import Enum


class JobStatus(str, Enum):
    """Status of a separation job"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SeparationRequest(BaseModel):
    """Request for audio separation"""
    filename: str
    model: Optional[str] = "htdemucs"


class JobResponse(BaseModel):
    """Response with job information"""
    job_id: str
    filename: str
    status: JobStatus
    progress: Optional[float] = None
    error: Optional[str] = None


class SeparationResult(BaseModel):
    """Result of audio separation"""
    job_id: str
    status: JobStatus
    tracks: Dict[str, Optional[str]]  # stem name -> download URL (None if not available)
    duration: Optional[float] = None  # processing duration in seconds


class SystemCapabilities(BaseModel):
    """System capabilities information"""
    has_gpu: bool
    gpu_name: Optional[str] = None
    gpu_memory_gb: Optional[float] = None
    system_memory_gb: float
    cpu_cores: int
    recommended_model: str
    max_concurrent_jobs: int
