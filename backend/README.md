# Unlayered Backend

Python FastAPI backend for audio track separation using Demucs.



**What you need:**
- Python 3.10+ (tested with 3.10-3.14)
- That's it!

**Note on Python 3.14:**
If using Python 3.14, some dependencies may require special handling due to limited wheel availability. The Demucs installation may need modifications (see Setup section).

**What you DON'T need:**
- ❌ Node.js (that's for the frontend team)
- ❌ Rust (that's for Tauri desktop app)
- ❌ npm or any JavaScript tools

**To get started:**
1. Follow the setup below
2. Run `python run.py`
3. Visit http://localhost:8000/docs
4. Start building the audio processing pipeline!

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note:** If you encounter issues installing Demucs (especially on Python 3.14+), you may need to install dependencies individually or use a modified Demucs package without `lameenc` (which is only needed for MP3 output). The backend uses WAV output exclusively, so `lameenc` is not required.

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

## Running

Development server:
```bash
python run.py
```

Or with uvicorn directly:
```bash
uvicorn app.main:app --reload
```

API will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

## Project Structure

```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── models/       # Data models and schemas
│   ├── services/     # Business logic (Demucs, Librosa)
│   ├── utils/        # Helper functions
│   ├── config.py     # Configuration
│   └── main.py       # FastAPI app
├── tests/            # Test files
├── requirements.txt  # Dependencies
└── run.py           # Development server
```

## API Endpoints

### Health Checks

#### `GET /`
Health check endpoint.

**Response:**
```json
{
  "status": "online",
  "service": "Unlayered API",
  "version": "0.1.0"
}
```

#### `GET /health`
Detailed health status.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "demucs": "ready"
  }
}
```

### Audio Separation

#### `GET /api/separate/capabilities`
Get system capabilities and recommended Demucs model.

**Response:**
```json
{
  "has_gpu": false,
  "gpu_name": null,
  "gpu_memory_gb": null,
  "system_memory_gb": 32.0,
  "cpu_cores": 8,
  "recommended_model": "htdemucs",
  "max_concurrent_jobs": 1
}
```

#### `POST /api/separate/upload`
Upload an audio file for stem separation.

**Request:**
- `Content-Type: multipart/form-data`
- `file`: Audio file (MP3, WAV, FLAC, OGG, AAC, M4A)
- `quality`: (optional) Quality parameter 1-5, default=1 (1=fastest, 5=best quality)
- `model`: (optional) Model override (htdemucs, htdemucs_ft, htdemucs_6s)

**Example:**
```bash
curl -X POST -F "file=@song.mp3;type=audio/mpeg" -F "quality=1" \
  http://localhost:8000/api/separate/upload
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "song.mp3",
  "status": "queued",
  "progress": 0.0,
  "error": null
}
```

**Status Values:**
- `queued` - Job is waiting to be processed
- `processing` - Job is currently being processed
- `completed` - Job finished successfully
- `failed` - Job failed with error

#### `GET /api/separate/status/{job_id}`
Check the status of a separation job.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "song.mp3",
  "status": "processing",
  "progress": 0.5,
  "error": null
}
```

#### `GET /api/separate/result/{job_id}`
Get the separated audio tracks for a completed job.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "tracks": {
    "vocals": "/api/separate/download/550e8400-e29b-41d4-a716-446655440000/vocals",
    "drums": "/api/separate/download/550e8400-e29b-41d4-a716-446655440000/drums",
    "bass": "/api/separate/download/550e8400-e29b-41d4-a716-446655440000/bass",
    "other": "/api/separate/download/550e8400-e29b-41d4-a716-446655440000/other",
    "guitar": null,
    "piano": null
  },
  "duration": 10.5
}
```

**Notes:**
- `tracks`: Dictionary mapping stem names to download URLs
- `guitar` and `piano` are only available with the 6-stem model (htdemucs_6s)
- For 4-stem models, `guitar` and `piano` will be `null`
- `duration`: Processing time in seconds

#### `GET /api/separate/download/{job_id}/{stem_name}`
Download a specific separated stem.

**Parameters:**
- `job_id`: Job identifier
- `stem_name`: One of: `vocals`, `drums`, `bass`, `other`, `guitar`, `piano`

**Response:**
- `Content-Type: audio/wav`
- WAV file (16-bit stereo, 44.1kHz)

**Example:**
```bash
curl http://localhost:8000/api/separate/download/{job_id}/vocals -o vocals.wav
```

## Frontend Integration Guide

### Basic Workflow

1. **Check System Capabilities** (optional)
```javascript
const capabilities = await fetch('http://localhost:8000/api/separate/capabilities')
  .then(r => r.json());
console.log(`System can handle ${capabilities.max_concurrent_jobs} concurrent jobs`);
```

2. **Upload Audio File**
```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('quality', '1'); // 1-5

const uploadResponse = await fetch('http://localhost:8000/api/separate/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json());

const jobId = uploadResponse.job_id;
```

3. **Poll for Status**
```javascript
const checkStatus = async (jobId) => {
  const status = await fetch(`http://localhost:8000/api/separate/status/${jobId}`)
    .then(r => r.json());

  console.log(`Status: ${status.status}, Progress: ${status.progress}`);

  if (status.status === 'completed') {
    return true;
  } else if (status.status === 'failed') {
    console.error('Error:', status.error);
    return false;
  }

  // Poll again in 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  return checkStatus(jobId);
};

await checkStatus(jobId);
```

4. **Get Results**
```javascript
const result = await fetch(`http://localhost:8000/api/separate/result/${jobId}`)
  .then(r => r.json());

// result.tracks contains download URLs for each stem
Object.entries(result.tracks).forEach(([stemName, url]) => {
  if (url) {
    console.log(`${stemName}: http://localhost:8000${url}`);
  } else {
    console.log(`${stemName}: not available (6-stem model only)`);
  }
});
```

5. **Play or Download Stems**
```javascript
// For audio player
const vocalsUrl = `http://localhost:8000${result.tracks.vocals}`;
audioElement.src = vocalsUrl;

// For download
const downloadStem = (stemName) => {
  const url = result.tracks[stemName];
  if (url) {
    window.location.href = `http://localhost:8000${url}`;
  }
};
```

## Model Information

### 4-Stem Models (htdemucs, htdemucs_ft)
Separates audio into 4 stems:
- **vocals**: Lead and background vocals
- **drums**: Drum kit and percussion
- **bass**: Bass guitar and bass synth
- **other**: All other instruments (guitar, piano, synth, etc.)

### 6-Stem Model (htdemucs_6s)
Separates audio into 6 stems:
- **vocals**: Lead and background vocals
- **drums**: Drum kit and percussion
- **bass**: Bass guitar and bass synth
- **guitar**: Electric and acoustic guitar
- **piano**: Piano and keyboard
- **other**: All other instruments

## Quality Settings

The `quality` parameter controls the number of random shifts used during separation:
- **1**: Fast, good quality (default) - ~10s for 20s audio on CPU
- **2**: Better quality - ~20s for 20s audio on CPU
- **3**: High quality - ~30s for 20s audio on CPU
- **4**: Very high quality - ~40s for 20s audio on CPU
- **5**: Maximum quality - ~50s for 20s audio on CPU

Higher quality settings use ensemble predictions which improve separation accuracy but increase processing time.

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK` - Successful request
- `400 Bad Request` - Invalid input (e.g., wrong file type, invalid quality)
- `404 Not Found` - Job not found
- `500 Internal Server Error` - Processing error

Error responses include a `detail` field:
```json
{
  "detail": "Invalid file type: application/pdf. Must be an audio file."
}
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `tauri://localhost` (Tauri app)

All HTTP methods and headers are allowed for these origins.

## File Size Limits

- Maximum upload size: 100MB
- Supported formats: MP3, WAV, FLAC, OGG, AAC, M4A

## Output Files

Separated stems are saved as:
- Format: WAV
- Sample rate: 44.1kHz
- Bit depth: 16-bit
- Channels: Stereo

Files are stored in `outputs/{job_id}/` with metadata in `metadata.json`.

## Team Responsibilities

**Backend Developer** owns:
- Python FastAPI server
- Demucs model integration
- Audio processing pipeline
- Song structure analysis (Librosa)
- Lyrics fetching
- Performance optimization
