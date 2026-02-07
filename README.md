# Unlayered

**A new way to listen to music** - Desktop application for audio track separation with real-time playback controls and song structure visualization.

## Features

- 🎵 Local ML-powered audio track separation using Demucs
- 🎚️ Real-time playback controls (solo, mute, volume per track)
- 📊 Song structure visualization (chorus, verse, bridge detection)
- 📝 Synchronized lyrics display
- 💻 Cross-platform desktop app (Mac, Windows, Linux)
- 🔒 Fully offline - all processing happens locally

## Tech Stack

### Frontend
- **Tauri** - Lightweight desktop framework
- **React + TypeScript** - UI components
- **Web Audio API** - Real-time audio playback and mixing
- **WaveSurfer.js** - Waveform visualization
- **Vite** - Fast build tool

### Backend
- **Python + FastAPI** - Local API server
- **Demucs** - State-of-the-art audio separation
- **Librosa** - Song structure analysis
- **PyTorch** - ML model inference

## Monorepo Structure

```
unlayered/
├── frontend/           # Tauri + React desktop app
│   ├── src/           # React components
│   ├── src-tauri/     # Tauri Rust backend
│   └── package.json
├── backend/           # Python FastAPI service
│   ├── app/          # API and services
│   ├── requirements.txt
│   └── run.py
├── shared/           # Shared types and constants
└── package.json      # Root workspace config
```

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- Python 3.10+
- Rust (for Tauri)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/unlayered.git
cd unlayered
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Set up Python backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Development

Run both frontend and backend:
```bash
npm run dev:all
```

Or run them separately:

**Frontend (Tauri + React):**
```bash
npm run tauri:dev
```

**Backend (FastAPI):**
```bash
npm run dev:backend
# or: cd backend && python run.py
```

### Building

Build the desktop application:
```bash
npm run tauri:build
```

## Team Responsibilities

### Frontend Developer
- Tauri desktop app shell
- React UI components (player, controls, visualizations)
- Visual design and UX
- Waveform display
- Lyrics and song structure components

### Fullstack Developer (Audio Bridge)
- Web Audio API implementation
- Real-time audio mixing engine
- Tauri ↔ Python communication layer
- Playback controls logic
- File import/export workflows

### Backend Developer
- Python FastAPI server
- Demucs model integration
- Audio separation pipeline
- Song structure analysis (Librosa)
- Lyrics fetching
- Performance optimization

## API Documentation

Backend API docs available at: http://localhost:8000/docs

## License

MIT

## Contributing

See individual README files in `frontend/` and `backend/` directories for detailed development guides.
