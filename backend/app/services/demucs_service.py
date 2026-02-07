"""Demucs audio separation service"""
from pathlib import Path
from typing import Dict, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
import soundfile as sf
import demucs.api

from app.config import settings

logger = logging.getLogger(__name__)

# Shared thread pool executor for async operations
_executor: Optional[ThreadPoolExecutor] = None


def get_executor() -> ThreadPoolExecutor:
    """Get or create the shared thread pool executor."""
    global _executor
    if _executor is None:
        # Use configured max_workers for thread pool
        max_workers = getattr(settings, "max_workers", 2)
        _executor = ThreadPoolExecutor(max_workers=max_workers)
    return _executor


class DemucsService:
    """Service for separating audio tracks using Demucs"""

    def __init__(
        self,
        model: str = "htdemucs_ft",
        device: str = "cuda",
        segment: Optional[int] = None,
        shifts: int = 1,
        overlap: float = 0.25
    ):
        """
        Initialize Demucs service with configurable parameters.

        Args:
            model: Model name (htdemucs, htdemucs_ft, htdemucs_6s)
            device: "cuda" or "cpu"
            segment: Segment size for memory-constrained systems (None = full song)
            shifts: Quality parameter (1=fast, 2-5=higher quality)
            overlap: Overlap between segments (0.25 = 25%)
        """
        self.model_name = model
        self.device = device
        self.segment = segment
        self.shifts = shifts
        self.overlap = overlap

        logger.info(
            f"Initializing DemucsService: model={model}, device={device}, "
            f"segment={segment}, shifts={shifts}"
        )

        # Initialize Demucs separator
        try:
            self.separator = demucs.api.Separator(
                model=model,
                device=device,
                segment=segment,
                shifts=shifts,
                overlap=overlap,
                progress=True  # Enable progress tracking
            )
            logger.info(f"Demucs separator initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Demucs: {e}")
            raise

    async def separate_audio(
        self,
        input_path: Path,
        output_dir: Path,
        job_id: str
    ) -> Dict[str, Optional[Path]]:
        """
        Separate an audio file into stems.

        Args:
            input_path: Path to input audio file
            output_dir: Directory to save separated stems
            job_id: Unique job identifier

        Returns:
            Dictionary mapping stem names to output file paths (None for unavailable stems)
        """
        logger.info(f"Starting separation for job {job_id}: {input_path}")

        # Create job output directory
        job_output_dir = Path(output_dir) / job_id
        job_output_dir.mkdir(parents=True, exist_ok=True)

        # Run separation in thread pool to avoid blocking event loop
        loop = asyncio.get_running_loop()
        stem_to_path = await loop.run_in_executor(
            get_executor(),
            self._separate_sync,
            input_path,
            job_output_dir,
            job_id
        )

        logger.info(f"Separation completed for job {job_id}: {len(stem_to_path)} stems")
        return stem_to_path

    def _separate_sync(
        self,
        input_path: Path,
        output_dir: Path,
        job_id: str
    ) -> Dict[str, Optional[Path]]:
        """
        Synchronous separation (runs in thread pool).

        Args:
            input_path: Path to input audio file
            output_dir: Directory to save separated stems
            job_id: Unique job identifier

        Returns:
            Dictionary mapping stem names to output file paths (None for unavailable stems)
        """
        try:
            # Run Demucs separation
            logger.info(f"Running Demucs separation for job {job_id}")
            _, separated = self.separator.separate_audio_file(str(input_path))

            stem_to_path = {}

            # Process separated stems (separated is a dict of stem_name -> audio_tensor)
            for stem_name, audio_tensor in separated.items():
                # Save as WAV with high quality
                output_path = output_dir / f"{stem_name}.wav"

                # Convert tensor to numpy and save using soundfile
                # audio_tensor shape: (channels, samples)
                audio_np = audio_tensor.cpu().numpy()
                # Transpose to (samples, channels) for soundfile
                audio_np = audio_np.T

                # Save as 16-bit WAV
                sf.write(
                    str(output_path),
                    audio_np,
                    self.separator.samplerate,
                    subtype='PCM_16'
                )

                stem_to_path[stem_name] = output_path
                logger.info(f"Saved {stem_name} to {output_path}")

            # Map stems to frontend format
            stem_to_path = self.map_stems_to_frontend(stem_to_path)

            return stem_to_path

        except Exception as e:
            logger.error(f"Error during separation: {e}")
            raise

    def map_stems_to_frontend(self, stems: Dict[str, Path]) -> Dict[str, Optional[Path]]:
        """
        Map Demucs stem names to frontend expected format.

        For 4-stem models: vocals, drums, bass, other (guitar/piano = None)
        For 6-stem models: vocals, drums, bass, guitar, piano, other

        Args:
            stems: Dictionary of stem_name -> file_path from Demucs

        Returns:
            Mapped dictionary for frontend (None values for unavailable stems)
        """
        # Check if this is a 6-stem model
        is_6_stem = "guitar" in stems or "piano" in stems

        if is_6_stem:
            # Return all 6 stems
            logger.info("Using 6-stem model output")
            return {
                "vocals": stems.get("vocals"),
                "drums": stems.get("drums"),
                "bass": stems.get("bass"),
                "guitar": stems.get("guitar"),
                "piano": stems.get("piano"),
                "other": stems.get("other")
            }
        else:
            # Return 4 stems, mark guitar/piano as None
            logger.info("Using 4-stem model output")
            return {
                "vocals": stems.get("vocals"),
                "drums": stems.get("drums"),
                "bass": stems.get("bass"),
                "other": stems.get("other"),
                "guitar": None,
                "piano": None
            }

    def get_model_info(self) -> dict:
        """Get information about the current model configuration."""
        return {
            "model": self.model_name,
            "device": self.device,
            "segment": self.segment,
            "shifts": self.shifts,
            "overlap": self.overlap
        }
