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

**Everyone needs:**
- Git

**Frontend & Fullstack Developers need:**
- Node.js 20+ and npm
- **Rust** (for Tauri desktop app)

**Backend Developer (Evan) needs:**
- Python 3.10+
- *Note: You don't need Node.js or Rust to work on the backend!*

### Installation

**Step 1: Clone the repository**
```bash
git clone https://github.com/yourusername/unlayered.git
cd unlayered
```

**Step 2a: Frontend/Fullstack Setup**

Install Node.js dependencies:
```bash
npm install
```

Install Rust (required for Tauri):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -y
source "$HOME/.cargo/env"  # Load Rust into your shell
```

Verify Rust installation:
```bash
cargo --version  # Should show: cargo 1.93.0 or higher
```

**Step 2b: Backend Setup (Evan starts here)**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Development

**For Backend Developer (Evan):**
You only need to run the Python backend:
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python run.py
```
API will be at: http://localhost:8000
API docs at: http://localhost:8000/docs

**For Frontend Developer:**
Quick web development (fast, no Rust compilation):
```bash
cd frontend
npm run dev
```
Open http://localhost:5173 in your browser

Full desktop app (slower first run):
```bash
npm run tauri:dev
```

**For Fullstack Developer:**
Run both services together:
```bash
npm run dev:all
```

Or run them separately as shown above.

### Troubleshooting

**Error: "cargo: command not found" or "No such file or directory" when running `npm run tauri:dev`**

This means Rust is not installed. Install it:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -y
source "$HOME/.cargo/env"
```

Then try again. Note: First Tauri build takes 5-10 minutes.

**First Tauri run is slow?**

The first `npm run tauri:dev` compiles Rust dependencies (5-10 minutes). Subsequent runs are much faster (10-30 seconds).

**Backend developer doesn't need Rust**

Evan (backend dev): You can ignore all Tauri/Rust stuff. Just run the Python backend!

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
