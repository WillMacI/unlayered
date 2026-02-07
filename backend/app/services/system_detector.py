"""
System detection service for determining GPU/CPU capabilities
and recommending appropriate Demucs models.
"""
import torch
import psutil
from dataclasses import dataclass
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class SystemCapabilities:
    """System capabilities information."""
    has_gpu: bool
    gpu_name: Optional[str]
    gpu_memory_gb: Optional[float]
    system_memory_gb: float
    cpu_cores: int
    recommended_model: str
    recommended_segment: Optional[int]
    max_concurrent_jobs: int
    device: str  # "cuda" or "cpu"


class SystemDetector:
    """Detects system capabilities and recommends Demucs configuration."""

    @staticmethod
    def detect_capabilities(force_cpu: bool = False) -> SystemCapabilities:
        """
        Detect system capabilities and recommend appropriate Demucs model.

        Args:
            force_cpu: If True, forces CPU usage even if GPU is available

        Returns:
            SystemCapabilities object with detected info and recommendations
        """
        # Detect GPU
        has_gpu = torch.cuda.is_available() and not force_cpu
        gpu_name = None
        gpu_memory_gb = None
        device = "cpu"

        if has_gpu:
            try:
                gpu_name = torch.cuda.get_device_name(0)
                gpu_memory_bytes = torch.cuda.get_device_properties(0).total_memory
                gpu_memory_gb = gpu_memory_bytes / (1024 ** 3)  # Convert to GB
                device = "cuda"
                logger.info(f"GPU detected: {gpu_name} with {gpu_memory_gb:.2f}GB VRAM")
            except Exception as e:
                logger.warning(f"Error detecting GPU properties: {e}")
                has_gpu = False

        # Detect system RAM
        system_memory = psutil.virtual_memory()
        system_memory_gb = system_memory.total / (1024 ** 3)

        # Detect CPU cores
        cpu_cores = psutil.cpu_count(logical=False) or 1

        # Recommend model and settings based on capabilities
        recommended_model, recommended_segment = SystemDetector._recommend_model_and_settings(
            has_gpu, gpu_memory_gb, system_memory_gb
        )

        # Recommend max concurrent jobs based on resources
        max_concurrent_jobs = SystemDetector._recommend_max_jobs(
            has_gpu, gpu_memory_gb, system_memory_gb, cpu_cores
        )

        logger.info(
            f"System detected - GPU: {has_gpu}, Model: {recommended_model}, "
            f"Segment: {recommended_segment}, Max Jobs: {max_concurrent_jobs}"
        )

        return SystemCapabilities(
            has_gpu=has_gpu,
            gpu_name=gpu_name,
            gpu_memory_gb=gpu_memory_gb,
            system_memory_gb=system_memory_gb,
            cpu_cores=cpu_cores,
            recommended_model=recommended_model,
            recommended_segment=recommended_segment,
            max_concurrent_jobs=max_concurrent_jobs,
            device=device
        )

    @staticmethod
    def _recommend_model_and_settings(
        has_gpu: bool,
        gpu_memory_gb: Optional[float],
        system_memory_gb: float
    ) -> tuple[str, Optional[int]]:
        """
        Recommend Demucs model and segment size based on available resources.

        Returns:
            Tuple of (model_name, segment_size)
        """
        if not has_gpu:
            # CPU only - use standard model without segmentation (let Demucs decide)
            logger.info("CPU mode: Using htdemucs")
            return "htdemucs", None

        # GPU available - choose based on VRAM
        if gpu_memory_gb >= 7.0:
            # High-end GPU - use 6-stem model
            logger.info(f"High-end GPU ({gpu_memory_gb:.1f}GB): Using htdemucs_6s")
            return "htdemucs_6s", None
        elif gpu_memory_gb >= 4.0:
            # Mid-range GPU - use fine-tuned 4-stem model
            logger.info(f"Mid-range GPU ({gpu_memory_gb:.1f}GB): Using htdemucs_ft")
            return "htdemucs_ft", None
        elif gpu_memory_gb >= 2.0:
            # Low-end GPU - use standard model, let Demucs handle segmentation
            logger.info(f"Low-end GPU ({gpu_memory_gb:.1f}GB): Using htdemucs")
            return "htdemucs", None
        else:
            # Very limited GPU - treat as CPU
            logger.info(f"Very limited GPU ({gpu_memory_gb:.1f}GB): Using htdemucs")
            return "htdemucs", None

    @staticmethod
    def _recommend_max_jobs(
        has_gpu: bool,
        gpu_memory_gb: Optional[float],
        system_memory_gb: float,
        cpu_cores: int
    ) -> int:
        """
        Recommend maximum concurrent jobs based on resources.

        For MVP, we'll be conservative and recommend 1-2 jobs max.
        """
        if not has_gpu:
            # CPU mode - one job at a time to avoid thrashing
            return 1

        if gpu_memory_gb >= 12.0:
            # High-end GPU - can handle 2 concurrent jobs
            return 2
        else:
            # Standard GPU - one job at a time
            return 1

    @staticmethod
    def validate_model_for_system(
        model: str,
        capabilities: SystemCapabilities
    ) -> tuple[bool, Optional[str]]:
        """
        Validate if a requested model can run on the current system.

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check if 6-stem model is requested on insufficient hardware
        if model == "htdemucs_6s":
            if not capabilities.has_gpu:
                return False, "6-stem model requires GPU, but system has CPU only"
            if capabilities.gpu_memory_gb < 7.0:
                return False, f"6-stem model requires 7GB+ VRAM, system has {capabilities.gpu_memory_gb:.1f}GB"

        # Check if fine-tuned model is requested on CPU
        if model == "htdemucs_ft" and not capabilities.has_gpu:
            return False, "Fine-tuned model works best with GPU, consider using standard htdemucs on CPU"

        return True, None


# Global instance for easy access
_system_capabilities: Optional[SystemCapabilities] = None


def get_system_capabilities(force_refresh: bool = False, force_cpu: bool = False) -> SystemCapabilities:
    """
    Get cached system capabilities or detect if not yet cached.

    Args:
        force_refresh: Force re-detection even if cached
        force_cpu: Force CPU usage even if GPU is available

    Returns:
        SystemCapabilities object
    """
    global _system_capabilities

    if _system_capabilities is None or force_refresh:
        _system_capabilities = SystemDetector.detect_capabilities(force_cpu)

    return _system_capabilities
