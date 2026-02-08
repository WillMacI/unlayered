"""
Job storage service for tracking audio separation jobs.
"""
import json
import threading
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    """Job processing status."""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Job:
    """Job information for audio separation."""
    job_id: str
    filename: str
    status: JobStatus
    progress: float = 0.0
    model_used: Optional[str] = None
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    input_path: Optional[str] = None
    output_dir: Optional[str] = None
    stems: Optional[Dict[str, Optional[str]]] = None  # stem_name -> Optional[file_path], None if unavailable
    error_message: Optional[str] = None
    processing_time: Optional[float] = None  # seconds

    def to_dict(self) -> dict:
        """Convert job to dictionary for JSON serialization."""
        data = asdict(self)
        # Convert datetime objects to ISO format strings
        for key in ['created_at', 'started_at', 'completed_at']:
            if data[key] is not None:
                data[key] = data[key].isoformat()
        # Convert enum to string
        data['status'] = self.status.value
        return data

    @classmethod
    def from_dict(cls, data: dict) -> 'Job':
        """Create job from dictionary."""
        # Convert ISO strings back to datetime
        for key in ['created_at', 'started_at', 'completed_at']:
            if data.get(key):
                data[key] = datetime.fromisoformat(data[key])
        # Convert string to enum
        if isinstance(data.get('status'), str):
            data['status'] = JobStatus(data['status'])
        return cls(**data)


class JobStore:
    """Thread-safe in-memory job storage."""

    _max_history: int = 1000

    def __init__(self):
        self._jobs: Dict[str, Job] = {}
        self._lock = threading.Lock()

    def add(self, job: Job) -> None:
        """Add a new job to the store."""
        with self._lock:
            self._jobs[job.job_id] = job
            self._prune_history()
            logger.info(f"Job {job.job_id} added to store")

    def try_add_with_capacity(self, job: Job, max_concurrent_jobs: int) -> tuple[bool, int]:
        """
        Atomically check capacity (queued + processing) and add a job if allowed.

        Returns:
            (added, active_count_before_add)
        """
        with self._lock:
            active_count = sum(
                1 for j in self._jobs.values()
                if j.status in {JobStatus.QUEUED, JobStatus.PROCESSING}
            )
            if active_count >= max_concurrent_jobs:
                return False, active_count

            self._jobs[job.job_id] = job
            self._prune_history()
            logger.info(f"Job {job.job_id} added to store")
            return True, active_count

    def get(self, job_id: str) -> Optional[Job]:
        """Get a job by ID."""
        with self._lock:
            return self._jobs.get(job_id)

    def update(
        self,
        job_id: str,
        status: Optional[JobStatus] = None,
        progress: Optional[float] = None,
        model_used: Optional[str] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        stems: Optional[Dict[str, Optional[str]]] = None,
        error_message: Optional[str] = None,
        processing_time: Optional[float] = None
    ) -> Optional[Job]:
        """
        Update job fields.

        Returns:
            Updated job or None if job not found
        """
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                logger.warning(f"Attempted to update non-existent job {job_id}")
                return None

            if status is not None:
                job.status = status
            if progress is not None:
                job.progress = progress
            if model_used is not None:
                job.model_used = model_used
            if started_at is not None:
                job.started_at = started_at
            if completed_at is not None:
                job.completed_at = completed_at
            if stems is not None:
                job.stems = stems
            if error_message is not None:
                job.error_message = error_message
            if processing_time is not None:
                job.processing_time = processing_time

            self._prune_history()
            logger.info(f"Job {job_id} updated: status={job.status}, progress={job.progress}")
            return job

    def save_metadata(self, job_id: str) -> bool:
        """
        Save job metadata to JSON file.

        Args:
            job_id: Job ID to save

        Returns:
            True if successful, False otherwise
        """
        job = self.get(job_id)
        if job is None:
            logger.error(f"Cannot save metadata for non-existent job {job_id}")
            return False

        if job.output_dir is None:
            logger.error(f"Cannot save metadata for job {job_id}: no output_dir set")
            return False

        try:
            output_path = Path(job.output_dir)
            output_path.mkdir(parents=True, exist_ok=True)

            metadata_file = output_path / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(job.to_dict(), f, indent=2)

            logger.info(f"Metadata saved for job {job_id} to {metadata_file}")
            return True

        except Exception as e:
            logger.error(f"Error saving metadata for job {job_id}: {e}")
            return False

    def load_metadata(self, job_id: str, output_dir: str) -> Optional[Job]:
        """
        Load job metadata from JSON file.

        Args:
            job_id: Job ID
            output_dir: Directory containing metadata.json

        Returns:
            Job object or None if loading failed
        """
        try:
            metadata_file = Path(output_dir) / "metadata.json"
            if not metadata_file.exists():
                logger.warning(f"Metadata file not found: {metadata_file}")
                return None

            with open(metadata_file, 'r') as f:
                data = json.load(f)

            file_job_id = data.get("job_id")
            if file_job_id is not None and file_job_id != job_id:
                logger.error(
                    f"Metadata job_id {file_job_id} does not match requested job_id {job_id} "
                    f"in {metadata_file}"
                )
                return None

            job = Job.from_dict(data)
            self.add(job)
            logger.info(f"Metadata loaded for job {file_job_id or job_id} from {metadata_file}")
            return job

        except Exception as e:
            logger.error(f"Error loading metadata for job {job_id}: {e}")
            return None

    def load_from_disk(self, root_output_dir: Path) -> int:
        """
        Scan the output directory for existing jobs and load them into memory.

        Args:
            root_output_dir: Root output directory containing job subdirectories

        Returns:
            Number of jobs loaded
        """
        if not root_output_dir.exists():
            logger.warning(f"Output directory {root_output_dir} does not exist")
            return 0

        loaded_count = 0
        logger.info(f"Scanning {root_output_dir} for existing jobs...")

        for job_dir in root_output_dir.iterdir():
            if not job_dir.is_dir():
                continue
            
            # Simple check via directory name (uuid)
            job_id = job_dir.name
            try:
                # Basic UUID validation (length check is usually enough for directory scan)
                if len(job_id) != 36: 
                    continue
                
                job = self.load_metadata(job_id, str(job_dir))
                if job:
                    loaded_count += 1
            except Exception as e:
                logger.warning(f"Failed to load job from {job_dir}: {e}")

        logger.info(f"Loaded {loaded_count} jobs from disk")
        return loaded_count

    def list_jobs(self, status: Optional[JobStatus] = None) -> list[Job]:
        """
        List all jobs, optionally filtered by status.

        Args:
            status: Filter by this status, or None for all jobs

        Returns:
            List of jobs
        """
        with self._lock:
            jobs = list(self._jobs.values())
            if status is not None:
                jobs = [j for j in jobs if j.status == status]
            return jobs

    def delete(self, job_id: str) -> bool:
        """
        Delete a job from the store.

        Args:
            job_id: Job ID to delete

        Returns:
            True if deleted, False if not found
        """
        with self._lock:
            if job_id in self._jobs:
                del self._jobs[job_id]
                logger.info(f"Job {job_id} deleted from store")
                return True
            return False

    def count(self, status: Optional[JobStatus] = None) -> int:
        """
        Count jobs, optionally filtered by status.

        Args:
            status: Filter by this status, or None for all jobs

        Returns:
            Number of jobs
        """
        with self._lock:
            if status is None:
                return len(self._jobs)
            return sum(1 for j in self._jobs.values() if j.status == status)

    def _prune_history(self) -> None:
        """Evict old completed/failed jobs to cap memory usage."""
        if len(self._jobs) <= self._max_history:
            return

        removable = [
            job for job in self._jobs.values()
            if job.status in {JobStatus.COMPLETED, JobStatus.FAILED}
        ]
        if not removable:
            return

        removable.sort(key=lambda job: job.completed_at or job.created_at or datetime.min)
        to_remove = len(self._jobs) - self._max_history

        for job in removable[:to_remove]:
            self._jobs.pop(job.job_id, None)


# Global job store instance
_job_store: Optional[JobStore] = None


def get_job_store() -> JobStore:
    """Get the global job store instance."""
    global _job_store
    if _job_store is None:
        _job_store = JobStore()
    return _job_store
