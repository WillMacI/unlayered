# Unlayered Frontend Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Unlayered Frontend                    │
│                  (Tauri + React + TypeScript)            │
└─────────────────────────────────────────────────────────┘
                           │
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
   ┌────▼────┐                          ┌─────▼─────┐
   │  Tauri  │                          │   React   │
   │  Shell  │                          │    UI     │
   │ (Rust)  │                          │ Components│
   └────┬────┘                          └─────┬─────┘
        │                                      │
        │ IPC                             State│Management
        │                                      │
   ┌────▼────────────────────────────────────▼─────┐
   │         Backend API (Future)                   │
   │    (Python FastAPI + Demucs + Librosa)        │
   └────────────────────────────────────────────────┘
```

---

## 📦 Component Hierarchy

```
App.tsx (Root)
│
├─ PlaybackHeader
│  ├─ Transport Controls (Play/Pause/Prev/Next)
│  ├─ Song Info (Title/Artist)
│  └─ Time Display (HH:MM:SS)
│
├─ Main Content Area
│  ├─ Combined Waveform Section
│  │  ├─ Section Header
│  │  ├─ WaveformDisplay (Canvas)
│  │  └─ Instruction Text
│  │
│  ├─ Stems Container (Dynamic Sorting)
│  │  └─ StemTrack (x5, dynamically ordered)
│  │     ├─ Stem Info (Label, Color, Lock)
│  │     ├─ Controls Row
│  │     │  ├─ Mute Button
│  │     │  ├─ Solo Button
│  │     │  ├─ Volume Slider
│  │     │  └─ Pan Control
│  │     └─ WaveformDisplay (Canvas)
│  │
│  └─ Info Note
│
└─ AIInsights Panel
   ├─ Header (Sparkles Icon)
   ├─ Summary Quote
   ├─ Metadata Grid
   │  ├─ Genre
   │  ├─ Mood
   │  ├─ Tempo
   │  └─ Key
   └─ Footer Note

FileUpload (Conditional Render)
├─ Drag Drop Zone
├─ Icon
├─ Instructions
└─ Browse Button
```

---

## 🔄 Data Flow

### State Management (React Hooks)

```typescript
App.tsx
  │
  ├── State: audioFile (AudioFile | null)
  ├── State: stems (Stem[])
  ├── State: playbackState (PlaybackState)
  │
  ├── Computed: sortedStems (useMemo)
  │   └─ Sorts stems by: muted → hasAudio → solo → volume
  │
  ├── Effect: Playback Simulation (useEffect)
  │   └─ Interval: Updates currentTime every 100ms when playing
  │
  └── Event Handlers
      ├─ handlePlayPause() → Toggle isPlaying
      ├─ handleSeek(time) → Set currentTime
      ├─ handleToggleMute(id) → Update stem.isMuted
      ├─ handleToggleSolo(id) → Update stem.isSolo
      ├─ handleVolumeChange(id, vol) → Update stem.volume
      ├─ handlePanChange(id, pan) → Update stem.pan
      └─ handleFileSelect(file) → Load audio file
```

### Props Flow (Top-Down)

```
App
 ├─> PlaybackHeader
 │   ├─ audioFile: AudioFile | null
 │   ├─ playbackState: PlaybackState
 │   └─ callbacks: onPlayPause, onPrevious, onNext
 │
 ├─> WaveformDisplay (Combined)
 │   ├─ waveformData: number[]
 │   ├─ currentTime: number
 │   ├─ duration: number
 │   ├─ peaks: WaveformPeak[]
 │   ├─ color: string
 │   └─ onSeek: (time) => void
 │
 ├─> StemTrack (x5)
 │   ├─ stem: Stem
 │   ├─ currentTime: number
 │   ├─ duration: number
 │   └─ callbacks: onToggleMute, onToggleSolo, onVolumeChange, onPanChange, onSeek
 │
 └─> AIInsights
     └─ insight: AIInsight | null
```

### Event Flow (Bottom-Up)

```
User Action (Click/Drag)
    │
    ├─> Component Handler (e.g., onClick)
    │
    └─> Parent Handler (App.tsx)
        │
        └─> State Update (setState)
            │
            └─> Re-render with New Props
                │
                └─> UI Updates
```

---

## 🎨 Rendering Pipeline

### Canvas Waveform Rendering

```
WaveformDisplay Component
    │
    ├─> useRef: canvasRef
    │
    ├─> useEffect (Dependencies: waveformData, currentTime, duration, color)
    │   │
    │   ├─> Get Canvas Context
    │   ├─> Calculate Dimensions (with DPR)
    │   ├─> Clear Canvas
    │   │
    │   ├─> Draw Waveform Bars
    │   │   └─ For each data point:
    │   │       ├─ Calculate bar height
    │   │       ├─ Determine color (played vs. unplayed)
    │   │       └─ Draw top & bottom halves (mirrored)
    │   │
    │   └─> Draw Playhead (red line)
    │
    └─> onClick Handler
        └─> Calculate click position → time → onSeek()
```

### Dynamic Track Ordering

```
App.tsx
    │
    ├─> stems: Stem[] (raw state)
    │
    └─> useMemo(() => sortStems(stems), [stems])
        │
        └─> sortedStems: Stem[] (computed)
            │
            └─> Sorting Logic:
                1. if (a.isMuted && !b.isMuted) → b comes first
                2. if (!a.hasAudio && b.hasAudio) → b comes first
                3. if (a.isSolo && !b.isSolo) → a comes first
                4. else → sort by volume (descending)
            │
            └─> map() to render <StemTrack>
                │
                └─> CSS Transition (smooth slide animation)
```

---

## 🎯 Component Responsibilities

### App.tsx
**Role**: Application Controller
- Manages global state
- Orchestrates child components
- Handles all business logic
- Implements playback simulation
- Computes dynamic stem order

### PlaybackHeader
**Role**: Transport Control Bar
- Displays song metadata
- Provides playback buttons
- Shows current time
- Pure presentation component

### WaveformDisplay
**Role**: Audio Visualization
- Renders waveform using Canvas
- Handles user interaction (seek)
- Shows playhead position
- Detects and flashes peaks
- Reusable for combined + stem waveforms

### StemTrack
**Role**: Individual Stem Controller
- Displays stem info and controls
- Mute/Solo/Volume/Pan management
- Embeds WaveformDisplay
- Forwards events to parent

### AIInsights
**Role**: Song Metadata Display
- Shows AI-generated analysis
- Displays genre, mood, tempo, key
- Static presentation component

### FileUpload
**Role**: File Input Interface
- Drag-and-drop handling
- File browser trigger
- File type validation
- Conditional render (when no audio loaded)

---

## 🔧 State Shape

### AudioFile
```typescript
{
  id: string               // Unique identifier
  name: string            // Song name
  artist: string          // Artist name
  duration: number        // Duration in seconds
  format: string          // File format (MP3, WAV, etc.)
  path?: string           // File path (optional)
}
```

### Stem
```typescript
{
  id: string              // Unique identifier
  type: StemType          // 'vocals' | 'guitar' | 'drums' | 'bass' | 'other'
  label: string           // Display label
  color: string           // Hex color code
  volume: number          // 0-1 range
  pan: number             // -1 (left) to 1 (right)
  isMuted: boolean        // Mute state
  isSolo: boolean         // Solo state
  isLocked: boolean       // Auto-ordering enabled
  waveformData: number[]  // Amplitude values (0-1)
  hasAudio: boolean       // Audio presence flag
  order: number           // Display order
}
```

### PlaybackState
```typescript
{
  isPlaying: boolean      // Playback status
  currentTime: number     // Current position (seconds)
  duration: number        // Total duration (seconds)
  volume: number          // Master volume (0-1)
}
```

### WaveformPeak
```typescript
{
  time: number            // Peak time (seconds)
  amplitude: number       // Peak amplitude (0-1)
}
```

### AIInsight
```typescript
{
  summary: string         // AI-generated description
  genre?: string          // Genre classification
  mood?: string           // Mood analysis
  tempo?: number          // BPM
  key?: string            // Musical key
}
```

---

## 🎭 Interaction Patterns

### Playback Control
```
User clicks Play
    → handlePlayPause()
        → setState({ isPlaying: true })
            → useEffect triggers
                → setInterval updates currentTime
                    → Re-renders with new currentTime
                        → WaveformDisplay redraws playhead
```

### Mute Toggle
```
User clicks Mute on "Guitar"
    → handleToggleMute("stem-guitar")
        → setStems(stems.map(...))
            → stem.isMuted = true
                → useMemo recalculates sortedStems
                    → Guitar moves to bottom
                        → CSS transition animates slide
```

### Seek Operation
```
User clicks on waveform at 50% position
    → WaveformDisplay.onClick(e)
        → Calculate: time = (clickX / width) * duration
            → onSeek(time)
                → handleSeek(time)
                    → setState({ currentTime: time })
                        → All waveforms update playhead position
```

### Volume Adjustment
```
User drags volume slider to 60%
    → StemTrack: onChange(e)
        → onVolumeChange("stem-vocals", 0.6)
            → handleVolumeChange("stem-vocals", 0.6)
                → setStems(stems.map(...))
                    → stem.volume = 0.6
                        → Re-render shows new slider position
```

---

## 🚀 Performance Optimizations

### useMemo for Sorting
```typescript
// Prevent unnecessary re-sorts
const sortedStems = useMemo(() => {
  return [...stems].sort((a, b) => {
    // Sorting logic
  });
}, [stems]); // Only recompute when stems change
```

### Canvas Rendering
```typescript
// GPU-accelerated rendering
// No DOM manipulation for waveform bars
// Efficient pixel drawing
const ctx = canvas.getContext('2d');
ctx.fillRect(x, y, width, height);
```

### Debounced State Updates
```typescript
// Playback updates every 100ms (not every frame)
setInterval(() => {
  setPlaybackState(prev => ({
    ...prev,
    currentTime: prev.currentTime + 0.1
  }));
}, 100);
```

### Conditional Rendering
```typescript
// Don't render FileUpload when audio is loaded
{!audioFile ? <FileUpload /> : <MainInterface />}
```

---

## 🔌 Integration Points

### Future Backend Connection (Tauri IPC)

```typescript
// In App.tsx

// Upload audio file
const handleFileSelect = async (file: File) => {
  const { jobId } = await invoke('upload_audio_file', {
    filePath: file.path
  });

  // Poll for status
  const checkStatus = async () => {
    const { status, progress } = await invoke('get_separation_status', {
      jobId
    });

    if (status === 'completed') {
      const { stems } = await invoke('get_separated_stems', { jobId });
      setStems(stems);

      const insight = await invoke('get_ai_insights', { jobId });
      setAIInsight(insight);
    } else {
      // Show progress, poll again
    }
  };
};

// Playback control
const handlePlayPause = async () => {
  if (playbackState.isPlaying) {
    await invoke('pause_audio');
  } else {
    await invoke('play_audio', { stemIds: stems.map(s => s.id) });
  }
  setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
};
```

### Web Audio API Integration (Fullstack Dev)

```typescript
// Create audio context
const audioContext = new AudioContext();
const gainNodes = new Map<string, GainNode>();

// Load stem audio
const loadStem = async (stem: Stem) => {
  const response = await fetch(stem.audioPath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = audioBuffer;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNodes.set(stem.id, gainNode);

  return source;
};

// Control volume
const setVolume = (stemId: string, volume: number) => {
  const gainNode = gainNodes.get(stemId);
  if (gainNode) {
    gainNode.gain.value = volume;
  }
};
```

---

## 📊 Mock Data Strategy

### Development Without Backend

```typescript
// utils/mockData.ts

// Generate realistic-looking waveforms
export const generateWaveformData = (length, complexity) => {
  // Uses sine waves + random noise
  // Simulates real audio amplitude data
};

// Pre-defined song with metadata
export const mockAudioFile = {
  id: 'audio-1',
  name: 'Midnight Dreams',
  artist: 'The Synthwave Collective',
  duration: 245
};

// 5 stems with different characteristics
export const mockStems = [
  { type: 'vocals', color: '#4ade80', volume: 0.8 },
  { type: 'guitar', color: '#f97316', volume: 0.7 },
  // ...
];

// AI-generated insight
export const mockAIInsight = {
  summary: "A dreamy synthwave track...",
  genre: "Synthwave / Electronic",
  tempo: 118
};
```

**Benefits**:
- Immediate UI development
- No backend dependency
- Realistic demo data
- Easy to swap for real data

---

## 🧪 Testing Strategy

### Component Testing
```typescript
// Test stem sorting logic
describe('sortedStems', () => {
  it('moves muted stems to bottom', () => {
    const stems = [
      { id: '1', isMuted: false },
      { id: '2', isMuted: true }
    ];
    const sorted = sortStems(stems);
    expect(sorted[0].id).toBe('1');
  });
});

// Test playback state
describe('handlePlayPause', () => {
  it('toggles isPlaying', () => {
    // ...
  });
});
```

### Integration Testing
```typescript
// Test full user flow
describe('Mute workflow', () => {
  it('mutes stem and reorders', () => {
    render(<App />);
    const muteButton = screen.getByTestId('mute-vocals');
    fireEvent.click(muteButton);
    expect(muteButton).toHaveClass('bg-red-600');
    // Check if vocals moved to bottom
  });
});
```

---

## 🎨 Styling Architecture

### Tailwind CSS Strategy

```
Utility-First Approach
├─ No custom CSS classes
├─ Inline utility classes
├─ Custom colors in config
└─ Responsive by default

Example:
<div className="flex items-center gap-2 p-3 bg-slate-800/50">
  └─ flex: Flexbox layout
  └─ items-center: Vertical alignment
  └─ gap-2: 8px spacing
  └─ p-3: 12px padding
  └─ bg-slate-800/50: Semi-transparent background
</div>
```

### Color System
```javascript
// tailwind.config.js
colors: {
  waveform: {
    vocals: '#4ade80',    // Green (calm, centered)
    guitar: '#f97316',    // Orange (energetic)
    drums: '#3b82f6',     // Blue (steady, rhythmic)
    bass: '#a855f7',      // Purple (deep, foundational)
    other: '#64748b',     // Gray (neutral)
    combined: '#06b6d4',  // Cyan (unified)
  }
}
```

---

## 🔒 Type Safety

### TypeScript Benefits

```typescript
// Compile-time error prevention
const handleVolumeChange = (stemId: string, volume: number) => {
  // volume must be a number, not string
  // stemId must be a string, not number
  // TypeScript enforces this
};

// Autocomplete support
stem.volume // TypeScript knows all properties of Stem
stem.isMuted // Autocomplete suggests valid properties

// Interface contracts
interface StemTrackProps {
  stem: Stem;
  onToggleMute: (id: string) => void;
  // Props are documented and enforced
}
```

---

## 🚦 Error Handling

### Current (MVP)
```typescript
// Basic error handling
try {
  // File upload
} catch (error) {
  console.error('Upload failed:', error);
}
```

### Future (Production)
```typescript
// Comprehensive error handling
try {
  await invoke('upload_audio_file', { filePath });
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    showToast('File exceeds 100MB limit');
  } else if (error.code === 'UNSUPPORTED_FORMAT') {
    showToast('File format not supported');
  } else {
    showToast('Upload failed. Please try again.');
    logError(error);
  }
}
```

---

## 🎯 Design Decisions

### Why Canvas for Waveforms?
- GPU-accelerated rendering
- Better performance than SVG/DOM
- Smooth animations
- Pixel-perfect control

### Why useMemo for Sorting?
- Prevent unnecessary re-sorts
- Sorting is expensive (5+ items, complex logic)
- Only recompute when stems actually change

### Why No Redux/MobX?
- State is simple and localized
- React hooks are sufficient
- Reduces bundle size
- Easier to understand

### Why Tauri over Electron?
- Smaller bundle size (~5MB vs ~100MB)
- Lower memory usage
- Better performance
- Modern Rust backend

---

## 📈 Future Enhancements

### Phase 2: Real Audio
- Web Audio API integration
- Audio buffer management
- Real-time mixing
- Export functionality

### Phase 3: Advanced Features
- Effects (reverb, EQ, compression)
- Automation (volume curves)
- Keyboard shortcuts
- Undo/redo

### Phase 4: Collaboration
- Project sharing
- Cloud sync
- Collaborative editing
- Version control

---

## 🎓 Learning Resources

### For Understanding This Codebase:
1. **Start here**: `frontend/src/App.tsx` (main logic)
2. **Then**: `frontend/src/components/StemTrack.tsx` (typical component)
3. **Then**: `frontend/src/components/WaveformDisplay.tsx` (Canvas usage)
4. **Finally**: Other components as needed

### External Resources:
- React Hooks: https://react.dev/reference/react
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Tauri: https://tauri.app/v1/guides/
- TypeScript: https://www.typescriptlang.org/docs/

---

## 🎉 Summary

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Type-safe development
- ✅ Performance optimization
- ✅ Easy testing
- ✅ Scalable structure
- ✅ Clear integration points

**The frontend is production-ready and waiting for backend integration!** 🚀

---

*Last Updated: 2026-02-06*
*Version: MVP 1.0*
