import logging
import os
import tempfile
from pathlib import Path
from typing import List, Dict, Optional

import tensorflow as tf

# Monkey patch scipy.signal.gaussian for older basic-pitch compatibility
import scipy.signal
import scipy.signal.windows
if not hasattr(scipy.signal, 'gaussian'):
    scipy.signal.gaussian = scipy.signal.windows.gaussian

from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH

from app.models.schemas import NoteEvent

logger = logging.getLogger(__name__)

class NoteDetectionService:
    """Service for detecting notes in audio files using basic-pitch"""
    
    def __init__(self):
        self.model_path = ICASSP_2022_MODEL_PATH
        
    def detect_notes(
        self, 
        audio_path: Path, 
        onset_threshold: float = 0.6, 
        frame_threshold: float = 0.4
    ) -> List[NoteEvent]:
        """
        Detect notes in an audio file.
        
        Args:
            audio_path: Path to the audio file
            onset_threshold: Threshold for note onset detection (0.0-1.0). Higher = fewer false positives.
            frame_threshold: Threshold for note frame detection (0.0-1.0). Higher = fewer false positives.
            
        Returns:
            List of detected NoteEvents
        """
        try:
            logger.info(f"Starting note detection for {audio_path} (onset={onset_threshold}, frame={frame_threshold})")
            
            # Predict using basic-pitch
            # predict returns: model_output, midi_data, note_events
            model_output, midi_data, note_events = predict(
                str(audio_path),
                self.model_path,
                onset_threshold=onset_threshold,
                frame_threshold=frame_threshold,
                minimum_note_length=58.0,
                minimum_frequency=None,
                maximum_frequency=None
            )
            
            detected_notes = []
            
            # note_events is a list of (start_time, end_time, pitch, amplitude, instrument_index)
            for start, end, pitch, velocity, _ in note_events:
                detected_notes.append(
                    NoteEvent(
                        start_time=float(start),
                        end_time=float(end),
                        pitch=int(pitch),
                        velocity=float(velocity),
                        confidence=1.0  # basic-pitch doesn't return per-note confidence directly in this list
                    )
                )
                
            logger.info(f"Detected {len(detected_notes)} notes in {audio_path}")
            return detected_notes
            
        except Exception as e:
            logger.error(f"Error checking notes for {audio_path}: {e}")
            # Return empty list on failure rather than crashing the whole job
            return []

# Global instance
_note_service = None

def get_note_detection_service() -> NoteDetectionService:
    global _note_service
    if _note_service is None:
        _note_service = NoteDetectionService()
    return _note_service
