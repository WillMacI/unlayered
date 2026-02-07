"""Demucs audio separation service"""
from pathlib import Path
from typing import Dict, List
import torch
import demucs.api


class DemucsService:
    """Service for separating audio tracks using Demucs"""

    def __init__(self):
        self.separater = demucs.api.Separator()


    async def separate_audio(
        self,
        input_path: Path,
        output_dir: Path,
        song_id: str
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

        
        origin, separated = self.separater.separate_audio_file(input_path)
        stem_to_path = {}
        for file, sources in separated:
            for stem, source in sources.items():
                path = self.save_audio(source, stem, file, output_dir, song_id)
                stem_to_path[stem] = path
        return stem_to_path

    def save_audio(self, source, stem, file, output_dir, song_id):
        path = Path(output_dir, song_id, f"{stem}_{file}")
        demucs.api.save_audio(source, path, samplerate=self.separater.samplerate)
        return path

