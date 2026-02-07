# Unlayered Backend

Python FastAPI backend for audio track separation using Demucs.

## For Evan (Backend Developer)

👋 **Hey Evan!** This is your workspace. You **only** need Python installed - no Node.js, no Rust, no Tauri!

**What you need:**
- Python 3.10+
- That's it!

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

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/separate/upload` - Upload audio for separation
- `GET /api/separate/status/{job_id}` - Check job status
- `GET /api/separate/result/{job_id}` - Get separated tracks

## Team Responsibilities

**Backend Developer** owns:
- Python FastAPI server
- Demucs model integration
- Audio processing pipeline
- Song structure analysis (Librosa)
- Lyrics fetching
- Performance optimization
