# Contributing to Unlayered

## Team Structure

We have 3 developers working on this project:

1. **Frontend Developer** - UI/UX, React components, Tauri app
2. **Fullstack Developer** - Audio engine, Web Audio API, Frontend/Backend integration
3. **Backend Developer** - Python API, Demucs integration, audio processing

## Getting Started

### First Time Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/unlayered.git
cd unlayered
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up Python backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

4. **Install Rust** (for Tauri)
- Visit https://rustup.rs/ and follow instructions

### Development Workflow

#### Running Both Services Together
```bash
npm run dev:all
```

#### Or Run Individually

**Frontend only:**
```bash
npm run dev
# Frontend will be at http://localhost:5173
```

**Tauri desktop app:**
```bash
npm run tauri:dev
```

**Backend only:**
```bash
npm run dev:backend
# API will be at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## Project Areas of Responsibility

### Frontend Developer (`frontend/`)

**Your area:** Everything in the `frontend/` directory

**Key files:**
- `frontend/src/` - React components
- `frontend/src/App.tsx` - Main app component
- `frontend/src-tauri/` - Tauri configuration (mostly hands-off)

**Your responsibilities:**
- Build UI components for the music player
- Implement waveform visualization
- Design and implement the layout
- Display lyrics and song structure
- Handle user interactions

**Getting started:**
1. Familiarize yourself with Tauri: https://tauri.app/
2. Look at `frontend/src/App.tsx` to see the starter code
3. Check out WaveSurfer.js docs: https://wavesurfer.xyz/

### Fullstack Developer (Bridge between `frontend/` and `backend/`)

**Your area:** Audio playback in `frontend/` + integration with `backend/`

**Key files:**
- Create `frontend/src/services/audioEngine.ts` - Web Audio API implementation
- Create `frontend/src/services/api.ts` - Backend communication
- `frontend/src/hooks/useAudioPlayback.ts` - Playback state management

**Your responsibilities:**
- Implement Web Audio API for real-time mixing
- Create the bridge between Tauri frontend and Python backend
- Handle audio file loading and playback
- Manage state for play/pause/seek/volume controls
- Stream separated tracks from backend to frontend

**Getting started:**
1. Learn Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
2. Review Tauri IPC: https://tauri.app/v1/guides/features/command
3. Check `backend/app/api/separation.py` for API endpoints

### Backend Developer (`backend/`)

**Your area:** Everything in the `backend/` directory

**Key files:**
- `backend/app/services/demucs_service.py` - Audio separation
- `backend/app/api/separation.py` - API endpoints
- `backend/app/services/` - Create new services as needed

**Your responsibilities:**
- Integrate Demucs for audio separation
- Implement audio processing pipeline
- Add song structure analysis with Librosa
- Fetch and sync lyrics
- Optimize processing performance (GPU usage, caching)

**Getting started:**
1. Read Demucs docs: https://github.com/facebookresearch/demucs
2. Check Librosa for analysis: https://librosa.org/
3. Review FastAPI docs: https://fastapi.tiangolo.com/

## Communication Points

### Weekly Sync Topics
- Architecture decisions
- API contract changes
- Blocking issues
- Feature priorities

### Critical Integration Points

1. **Frontend ↔ Fullstack**: UI component props and audio state management
2. **Fullstack ↔ Backend**: API endpoints and data formats (see `shared/types.ts`)
3. **All three**: Testing end-to-end workflows

## Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Commit with clear messages: `git commit -m "Add audio playback controls"`
4. Push: `git push origin feature/your-feature-name`
5. Create a Pull Request on GitHub
6. Request review from teammates

## Need Help?

- Check the README in your area (`frontend/README.md`, `backend/README.md`)
- Review `shared/types.ts` for API contracts
- Ask in team chat or schedule a sync

## Shared Types

All shared types are in `shared/types.ts`. If you need to change the API contract:

1. Update `shared/types.ts` first
2. Update Python models in `backend/app/models/schemas.py`
3. Update frontend code to use new types
4. Notify the team of breaking changes
