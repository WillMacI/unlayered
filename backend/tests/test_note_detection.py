import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path
from app.services.note_detection import NoteDetectionService, NoteEvent

@pytest.fixture
def note_service():
    return NoteDetectionService()

def test_detect_notes_success(note_service):
    # Mock basic_pitch.inference.predict
    with patch('app.services.note_detection.predict') as mock_predict:
        # predict returns: model_output, midi_data, note_events
        # note_events is list of (start, end, pitch, velocity, instrument)
        mock_note_events = [
            (0.5, 1.0, 60, 0.8, 0),
            (1.0, 1.5, 62, 0.7, 0)
        ]
        mock_predict.return_value = (None, None, mock_note_events)
        
        notes = note_service.detect_notes(Path("dummy.wav"))
        
        assert len(notes) == 2
        assert isinstance(notes[0], NoteEvent)
        assert notes[0].start_time == 0.5
        assert notes[0].end_time == 1.0
        assert notes[0].pitch == 60
        assert notes[0].velocity == 0.8
        assert notes[0].confidence == 1.0

def test_detect_notes_failure(note_service):
    with patch('app.services.note_detection.predict') as mock_predict:
        mock_predict.side_effect = Exception("Prediction failed")
        
        notes = note_service.detect_notes(Path("dummy.wav"))
        
        assert notes == []
