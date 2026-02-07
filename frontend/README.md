# Unlayered Frontend

Tauri + React desktop application for Unlayered music track splitter.

## Tech Stack

- **Tauri** - Desktop app framework (Rust backend, web frontend)
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **WaveSurfer.js** - Waveform visualization
- **Web Audio API** - Real-time audio playback (via fullstack dev)

## Development

### Running the App

**Web development mode** (faster iteration):
```bash
npm run dev
```
Visit http://localhost:5173

**Tauri desktop mode** (full app):
```bash
npm run tauri:dev
```

### Building

```bash
npm run tauri:build
```

Build artifacts will be in `src-tauri/target/release/`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── services/       # API and audio services
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── src-tauri/         # Tauri Rust code
│   ├── src/          # Rust source
│   ├── icons/        # App icons
│   └── tauri.conf.json  # Tauri config
└── public/           # Static assets
```

## Frontend Developer Responsibilities

You own the **visual layer** of Unlayered:

### Core Tasks
- [ ] Design and implement the main player UI layout
- [ ] Create track list component (vocals, drums, bass, other)
- [ ] Build playback control buttons (play, pause, seek)
- [ ] Implement volume sliders for each track
- [ ] Display waveform visualization using WaveSurfer.js
- [ ] Show song timeline and current position
- [ ] Display lyrics panel
- [ ] Visualize song structure (chorus, verse, bridge markers)
- [ ] Add file import UI (drag & drop)
- [ ] Design settings/preferences panel

### Example Components to Build

```typescript
// src/components/TrackList.tsx
// Displays list of separated tracks with controls

// src/components/Waveform.tsx
// WaveSurfer.js integration for visualization

// src/components/LyricsPanel.tsx
// Synchronized lyrics display

// src/components/SongStructure.tsx
// Visual markers for song sections

// src/components/PlayerControls.tsx
// Play/pause/seek controls
```

### Integration Points

**With Fullstack Developer:**
- You provide UI components and state
- They handle actual audio playback logic
- Use shared hooks: `useAudioPlayback()`, `useSeparation()`

Example:
```typescript
// You create the UI
function VolumeSlider({ track, value, onChange }) {
  return <input type="range" value={value} onChange={onChange} />
}

// Fullstack dev connects it to Web Audio API
function TrackControl({ track }) {
  const { volume, setVolume } = useAudioPlayback(track)
  return <VolumeSlider track={track} value={volume} onChange={setVolume} />
}
```

**With Backend Developer:**
- Backend provides REST API at http://localhost:8000
- Fullstack dev handles API calls
- You display the data they provide

### UI Design Guidelines

- Keep it clean and focused on the music
- Large, touch-friendly controls
- Clear visual feedback for track states (solo, muted)
- Responsive layout that works on different screen sizes
- Dark mode friendly

### Getting Started

1. **Check out the starter code:**
```bash
npm run dev
```

2. **Explore key libraries:**
- React docs: https://react.dev/
- Tauri docs: https://tauri.app/
- WaveSurfer.js: https://wavesurfer.xyz/
- Lucide icons: https://lucide.dev/

3. **Start building components:**
Create your first component in `src/components/PlayerLayout.tsx`

4. **Review shared types:**
Check `../shared/types.ts` for data structures

## Useful Commands

```bash
npm run dev           # Start Vite dev server
npm run tauri:dev     # Start Tauri desktop app
npm run build         # Build for production
npm run lint          # Run ESLint
```

## Need Help?

- Questions about audio playback logic? Ask the **Fullstack Developer**
- Questions about API data? Ask the **Backend Developer**
- UI/UX decisions? You own this!

## Tips

- Use `@tauri-apps/api` for desktop features (file dialogs, etc.)
- The fullstack dev will create audio service hooks - consume them in your components
- Focus on making it beautiful and intuitive
- Don't worry about audio processing details - that's handled elsewhere

Happy coding!
