"""Demucs audio separation service"""
from pathlib import Path
from typing import Dict, List
import torch
from demucs.pretrained import get_model


class DemucsService:
    """Service for separating audio tracks using Demucs"""

    def __init__(self, model_name: str = "htdemucs", use_gpu: bool = True):
        self.model_name = model_name
        self.device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
        self.model = None

    def load_model(self):
        """Load the Demucs model"""
        if self.model is None:
            self.model = get_model(self.model_name)
            self.model.to(self.device)

    async def separate_audio(
        self,
        input_path: Path,
        output_dir: Path,
        job_id: str
    ) -> Dict[str, Path]:
        """
        Separate an audio file into stems

        Args:
            input_path: Path to input audio file
            output_dir: Directory to save separated stems
            job_id: Unique job identifier

        Returns:
            Dictionary mapping stem names to output file paths
        """
        self.load_model()

        # TODO: Implement actual separation
        # For now, return placeholder paths
        stems = ["vocals", "drums", "bass", "other"]
        return {
            stem: output_dir / job_id / f"{stem}.wav"
            for stem in stems
        }

    def get_available_models(self) -> List[str]:
        """Get list of available Demucs models"""
        return [
            "htdemucs",  # Hybrid Transformer Demucs (default)
            "htdemucs_ft",  # Fine-tuned version
            "htdemucs_6s",  # 6-stem separation
            "mdx_extra",  # Extra quality model
        ]
