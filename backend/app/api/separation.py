"""Audio separation API endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime
from typing import Optional
import asyncio
import uuid
import logging
import shutil
import time

from app.config import settings
# Note: app.models.schemas exists and contains Pydantic response models
from app.models.schemas import JobResponse, SeparationResult, SystemCapabilities
from app.services.job_store import get_job_store, Job, JobStatus
from app.services.demucs_service import DemucsService, get_executor
from app.services.system_detector import get_system_capabilities, SystemDetector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/separate", tags=["separation"])

# Allowed audio file types
ALLOWED_AUDIO_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/flac",
    "audio/x-flac",
    "audio/ogg",
    "audio/aac",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "video/mp4"
}


@router.post("/upload", response_model=JobResponse)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    quality: int = Form(1),
    model: Optional[str] = Form(None)
):
    """
    Upload an audio file for separation.

    Args:
        file: Audio file to separate
        quality: Quality parameter (1-5, higher = better quality but slower)
        model: Optional model override (htdemucs, htdemucs_ft, htdemucs_6s)

    Returns:
        Job information with job_id and status
    """
    # Validate file type
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Must be an audio file."
        )

    # Validate quality parameter
    if quality < 1 or quality > 5:
        raise HTTPException(
            status_code=400,
            detail="Quality must be between 1 and 5"
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size / (1024*1024):.0f}MB"
        )

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Create upload directory for this job
    job_upload_dir = settings.upload_dir / job_id
    job_upload_dir.mkdir(parents=True, exist_ok=True)

    # Save uploaded file with sanitized filename (prevent path traversal)
    # Use only the basename to prevent directory traversal attacks
    safe_filename = Path(file.filename).name if file.filename else "upload"
    input_path = job_upload_dir / safe_filename
    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"File uploaded for job {job_id}: {input_path}")
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Error saving uploaded file")

    # Validate actual file content (not just MIME type which can be spoofed)
    # Note: We use a simple size/extension check for MP3 since soundfile/libsndfile
    # often lacks MP3 support. Demucs uses ffmpeg internally which handles all formats.
    try:
        import soundfile as sf
        file_ext = input_path.suffix.lower()

        # For formats soundfile supports (WAV, FLAC, OGG), validate with soundfile
        if file_ext in ['.wav', '.flac', '.ogg']:
            info = sf.info(str(input_path))
            logger.info(f"Validated audio file: {info.samplerate}Hz, {info.channels} channels, {info.duration:.1f}s")
        # For MP3 and other formats, do basic file size check
        # (Demucs will validate properly using ffmpeg during processing)
        elif file_ext in ['.mp3', '.m4a', '.aac']:
            file_size = input_path.stat().st_size
            if file_size < 100:  # Suspiciously small
                raise ValueError(f"File too small ({file_size} bytes) to be valid audio")
            logger.info(f"Accepted {file_ext} file ({file_size} bytes) - will be validated by Demucs")
        else:
            logger.warning(f"Unknown audio format: {file_ext}")
    except Exception as e:
        # Invalid audio file - clean up and reject
        logger.warning(f"Invalid audio file for job {job_id}: {e}")
        input_path.unlink(missing_ok=True)
        try:
            shutil.rmtree(job_upload_dir, ignore_errors=True)
        except Exception as cleanup_error:
            logger.warning(
                f"Failed to clean up upload dir for invalid job {job_id}: {cleanup_error}"
            )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid audio file. Could not read audio data: {str(e)}"
        )

    # Get system capabilities
    capabilities = get_system_capabilities(force_cpu=settings.force_cpu)

    # Get job store for capacity checks and enqueue
    job_store = get_job_store()

    # Determine which model to use
    if model is None:
        # Auto-select based on system capabilities
        selected_model = capabilities.recommended_model
        segment = capabilities.recommended_segment
    else:
        # Validate requested model
        is_valid, error_msg = SystemDetector.validate_model_for_system(model, capabilities)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        selected_model = model
        segment = capabilities.recommended_segment

    # Create job
    job = Job(
        job_id=job_id,
        filename=safe_filename,
        status=JobStatus.QUEUED,
        model_used=selected_model,
        created_at=datetime.now(),
        input_path=str(input_path),
        output_dir=str(settings.output_dir / job_id)
    )

    # Add to job store with an atomic capacity check
    added, active_jobs = job_store.try_add_with_capacity(job, capabilities.max_concurrent_jobs)
    if not added:
        # Clean up saved upload when at capacity
        try:
            shutil.rmtree(job_upload_dir, ignore_errors=True)
        except Exception as e:
            logger.warning(f"Failed to clean up upload dir for rejected job {job_id}: {e}")

        raise HTTPException(
            status_code=429,
            detail=f"System at capacity. Currently queued/processing {active_jobs} job(s). Please try again later."
        )

    # Queue background processing
    background_tasks.add_task(
        process_separation_job,
        job_id,
        selected_model,
        capabilities.device,
        segment,
        quality
    )

    logger.info(f"Job {job_id} queued for processing with model {selected_model}")

    return JobResponse(
        job_id=job_id,
        filename=safe_filename,
        status=job.status,
        progress=0.0,
        error=None
    )


async def process_separation_job(
    job_id: str,
    model: str,
    device: str,
    segment: Optional[int],
    shifts: int
):
    """
    Background task to process audio separation.

    Args:
        job_id: Job ID
        model: Demucs model name
        device: "cuda" or "cpu"
        segment: Segment size for memory constraints
        shifts: Quality parameter (1-5)
    """
    job_store = get_job_store()
    start_time = time.time()

    try:
        # Update job status to processing
        # Note: Job is marked as PROCESSING when background task starts, even though
        # actual separation work may be queued in the thread pool. This is acceptable
        # since the background task is running (not waiting in FastAPI queue) and the
        # distinction between "queued in executor" vs "actively processing" is minimal
        # for end users. For production, consider a job queue with explicit queued state.
        job_store.update(
            job_id,
            status=JobStatus.PROCESSING,
            started_at=datetime.now(),
            progress=0.1
        )

        job = job_store.get(job_id)
        if job is None:
            logger.error(f"Job {job_id} not found")
            return

        # Initialize Demucs service off the event loop (model load can be expensive)
        logger.info(f"Initializing Demucs for job {job_id}")
        loop = asyncio.get_running_loop()
        demucs_service = await loop.run_in_executor(
            get_executor(),
            lambda: DemucsService(
                model=model,
                device=device,
                segment=segment,
                shifts=shifts,
                overlap=settings.demucs_overlap
            )
        )

        # Update progress
        job_store.update(job_id, progress=0.2)

        # Run separation
        logger.info(f"Starting separation for job {job_id}")
        stems = await demucs_service.separate_audio(
            input_path=Path(job.input_path),
            output_dir=settings.output_dir,
            job_id=job_id
        )

        # Convert Path objects to strings and filter out None values
        stems_dict = {
            name: str(path) if path is not None else None
            for name, path in stems.items()
        }

        # Calculate processing time
        processing_time = time.time() - start_time

        # Update job with results
        job_store.update(
            job_id,
            status=JobStatus.COMPLETED,
            completed_at=datetime.now(),
            stems=stems_dict,
            progress=1.0,
            processing_time=processing_time
        )

        # Save metadata
        job_store.save_metadata(job_id)
        try:
            shutil.rmtree(settings.upload_dir / job_id, ignore_errors=True)
        except Exception as cleanup_error:
            logger.warning(f"Failed to clean up upload dir for job {job_id}: {cleanup_error}")

        logger.info(f"Job {job_id} completed successfully in {processing_time:.2f}s")

    except Exception as e:
        logger.error(f"Error processing job {job_id}: {e}", exc_info=True)
        job_store.update(
            job_id,
            status=JobStatus.FAILED,
            error_message=str(e),
            completed_at=datetime.now()
        )
        job_store.save_metadata(job_id)
        try:
            shutil.rmtree(settings.upload_dir / job_id, ignore_errors=True)
        except Exception as cleanup_error:
            logger.warning(f"Failed to clean up upload dir for failed job {job_id}: {cleanup_error}")


@router.get("/status/{job_id}", response_model=JobResponse)
async def get_status(job_id: str):
    """Get the status of a separation job."""
    job_store = get_job_store()
    job = job_store.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobResponse(
        job_id=job.job_id,
        filename=job.filename,
        status=job.status,
        progress=job.progress,
        error=job.error_message
    )


@router.get("/result/{job_id}", response_model=SeparationResult)
async def get_result(job_id: str):
    """Get the separated audio tracks for a completed job."""
    job_store = get_job_store()
    job = job_store.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job.status.value}"
        )

    if job.stems is None:
        raise HTTPException(status_code=500, detail="No stems found for completed job")

    # Build download URLs for stems
    tracks = {}
    for stem_name, stem_path in job.stems.items():
        if stem_path is not None:
            tracks[stem_name] = f"/api/separate/download/{job_id}/{stem_name}"
        else:
            tracks[stem_name] = None

    return SeparationResult(
        job_id=job_id,
        status=job.status,
        tracks=tracks,
        duration=job.processing_time
    )


@router.get("/download/{job_id}/{stem_name}")
async def download_stem(job_id: str, stem_name: str):
    """Download a specific stem from a completed job."""
    job_store = get_job_store()
    job = job_store.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job.status.value}"
        )

    if job.stems is None or stem_name not in job.stems:
        raise HTTPException(status_code=404, detail=f"Stem '{stem_name}' not found")

    stem_path = job.stems[stem_name]
    if stem_path is None:
        raise HTTPException(
            status_code=404,
            detail=f"Stem '{stem_name}' not available for this model"
        )

    file_path = Path(stem_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Stem file not found on disk")

    return FileResponse(
        path=file_path,
        media_type="audio/wav",
        filename=f"{stem_name}.wav"
    )


@router.get("/capabilities", response_model=SystemCapabilities)
async def get_capabilities():
    """Get system capabilities and recommended settings."""
    capabilities = get_system_capabilities(force_cpu=settings.force_cpu)

    return SystemCapabilities(
        has_gpu=capabilities.has_gpu,
        gpu_name=capabilities.gpu_name,
        gpu_memory_gb=capabilities.gpu_memory_gb,
        system_memory_gb=capabilities.system_memory_gb,
        cpu_cores=capabilities.cpu_cores,
        recommended_model=capabilities.recommended_model,
        max_concurrent_jobs=capabilities.max_concurrent_jobs
    )
