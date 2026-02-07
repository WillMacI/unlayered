# Unlayered Frontend - Phase 1 Implementation Plan

## Overview

Transform the MVP frontend into a fully working music stem separator with:
1. **Real Audio Playback** - Web Audio API for multi-stem mixing
2. **Cinematic Loading Screen** - Artist metadata display during processing
3. **Song Structure Markers** - Visual section overlays on waveforms
4. **Keyboard Shortcuts** - Global hotkeys for playback control
5. **Adobe-Style UI** - Professional dark theme inspired by Premiere Pro/Audition

## Timeline: 3 Weeks

### Week 1: Real Audio Playback
### Week 2: Loading Screen & Markers
### Week 3: Keyboard Shortcuts & Adobe UI Polish

---

## Adobe-Style UI Design System

### Goal
Redesign the interface to match Adobe's professional aesthetic (Premiere Pro, Audition, After Effects style).

### Color Palette

Replace current colors with Adobe's dark theme:

```css
/* Adobe Dark Theme Colors */
--adobe-bg-primary: #1E1E1E;        /* Main background */
--adobe-bg-secondary: #2D2D2D;      /* Panels background */
--adobe-bg-tertiary: #3A3A3A;       /* Raised elements */
--adobe-bg-hover: #474747;          /* Hover states */
--adobe-bg-active: #5A5A5A;         /* Active/selected */

--adobe-border: #1A1A1A;            /* Panel borders */
--adobe-border-light: #414141;      /* Dividers */

--adobe-text-primary: #E0E0E0;      /* Primary text */
--adobe-text-secondary: #ADADAD;    /* Secondary text */
--adobe-text-tertiary: #6E6E6E;     /* Disabled text */

--adobe-accent-blue: #0E7EFF;       /* Links, selections */
--adobe-accent-blue-hover: #2D8FFF; /* Hover */

/* Waveform colors - Adobe Audition style */
--adobe-waveform-vocals: #4AFF88;   /* Bright green */
--adobe-waveform-guitar: #FF8A4A;   /* Orange */
--adobe-waveform-drums: #4AB3FF;    /* Cyan-blue */
--adobe-waveform-bass: #C84AFF;     /* Purple */
--adobe-waveform-other: #6E6E6E;    /* Gray */
--adobe-waveform-combined: #4AB3FF; /* Cyan */

/* Status colors */
--adobe-success: #00B050;
--adobe-warning: #FFB000;
--adobe-error: #FF3939;
```

### Typography

```css
/* Adobe uses Source Sans Pro */
font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font sizes (Adobe scale) */
--font-xs: 11px;    /* Labels, hints */
--font-sm: 12px;    /* Body text, controls */
--font-base: 13px;  /* Default */
--font-lg: 14px;    /* Headings */
--font-xl: 16px;    /* Panel titles */
--font-2xl: 20px;   /* Section headers */

/* Font weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Component Styling

#### Panels & Containers
```css
/* Adobe panel style */
.adobe-panel {
  background: var(--adobe-bg-secondary);
  border: 1px solid var(--adobe-border);
  border-radius: 0; /* Adobe uses sharp corners */
}

.adobe-panel-header {
  background: var(--adobe-bg-primary);
  border-bottom: 1px solid var(--adobe-border-light);
  padding: 8px 12px;
  font-size: var(--font-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--adobe-text-secondary);
}
```

#### Buttons
```css
/* Primary button (Adobe style) */
.adobe-btn-primary {
  background: var(--adobe-accent-blue);
  color: white;
  border: none;
  padding: 6px 14px;
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  border-radius: 2px; /* Subtle radius */
  transition: background 0.15s ease;
}

.adobe-btn-primary:hover {
  background: var(--adobe-accent-blue-hover);
}

/* Icon button */
.adobe-btn-icon {
  background: transparent;
  color: var(--adobe-text-primary);
  border: none;
  padding: 4px;
  border-radius: 2px;
}

.adobe-btn-icon:hover {
  background: var(--adobe-bg-hover);
}

.adobe-btn-icon:active {
  background: var(--adobe-bg-active);
}
```

#### Sliders & Controls
```css
/* Adobe-style slider */
.adobe-slider {
  -webkit-appearance: none;
  height: 2px;
  background: var(--adobe-bg-tertiary);
  outline: none;
}

.adobe-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  background: var(--adobe-text-primary);
  cursor: pointer;
  border-radius: 1px; /* Sharp corners */
}

.adobe-slider:hover::-webkit-slider-thumb {
  background: var(--adobe-accent-blue);
}

/* Number input (volume display) */
.adobe-number-input {
  background: var(--adobe-bg-tertiary);
  border: 1px solid var(--adobe-border-light);
  color: var(--adobe-text-primary);
  font-size: var(--font-sm);
  padding: 2px 6px;
  border-radius: 2px;
  min-width: 40px;
  text-align: center;
}
```

#### Waveform Styling
```css
/* Waveform container - Adobe Audition style */
.adobe-waveform-container {
  background: #0A0A0A; /* Very dark */
  border: 1px solid var(--adobe-border);
  position: relative;
}

/* Playhead - Adobe red */
.adobe-playhead {
  background: #FF3939;
  width: 2px;
  box-shadow: 0 0 4px rgba(255, 57, 57, 0.5);
}

/* Time ruler - Adobe style */
.adobe-time-ruler {
  background: var(--adobe-bg-primary);
  border-bottom: 1px solid var(--adobe-border-light);
  height: 24px;
  font-size: var(--font-xs);
  color: var(--adobe-text-tertiary);
}
```

### Layout Updates

#### Main Interface Layout
```
┌─────────────────────────────────────────────────────┐
│ File  Edit  View  Window  Help         [≡] [?] [×] │ Menu bar
├─────────────────────────────────────────────────────┤
│ [◀◀] [▶] [▶▶] │00:02:45 / 04:05│ [♪] 80% │ [⚙]   │ Transport bar
├──────────────────────────────────┬──────────────────┤
│                                  │  AI INSIGHTS     │
│  COMBINED WAVEFORM               │ ┌──────────────┐ │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │ [Image]      │ │
│  [Verse][Chorus][Bridge][Outro] │ └──────────────┘ │
│                                  │                  │
│  STEMS                           │  Genre:          │
│  ┌─ VOCALS ─────────────────┐  │  Synthwave       │
│  │ ━━━━━━━━━━━━━━━━━━━━━━ │  │                  │
│  │ [M][S] Vol:[80%] Pan:[C]│  │  Mood:           │
│  └──────────────────────────┘  │  Nostalgic       │
│                                  │                  │
│  ┌─ DRUMS ──────────────────┐  │  Tempo: 118 BPM  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━ │  │                  │
│  │ [M][S] Vol:[90%] Pan:[C]│  │  Key: A Minor    │
│  └──────────────────────────┘  │                  │
│  ... more stems ...             │                  │
└──────────────────────────────────┴──────────────────┘
```

### Key Adobe UI Elements

#### 1. Top Menu Bar (Optional)
- Dark gray background (#1E1E1E)
- 11px uppercase text
- Minimal padding (4px 12px)
- Hover states with subtle highlight

#### 2. Transport Controls
- Larger, more prominent playback buttons
- Numerical time display (00:00:00 format)
- Monospace font for time
- Master volume meter with dB scale

#### 3. Panel System
- Dark panel backgrounds (#2D2D2D)
- Panel headers with ALL CAPS labels
- Collapsible/expandable panels (future enhancement)
- Resize handles between panels

#### 4. Track Headers
- Compact track naming
- Icon indicators (waveform icon, lock icon)
- Color strip on left edge matching waveform color

#### 5. Waveform Display
- Very dark background (#0A0A0A)
- Brighter waveform colors
- Grid lines every 10 seconds (subtle)
- Time markers at top
- Zoom controls (future)

#### 6. Status Bar (Bottom)
- Show processing status, errors, hints
- Very subtle (#1A1A1A background)
- Small text (11px)

### Tailwind Config Updates

Update `/frontend/tailwind.config.js`:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        adobe: {
          'bg-primary': '#1E1E1E',
          'bg-secondary': '#2D2D2D',
          'bg-tertiary': '#3A3A3A',
          'bg-hover': '#474747',
          'bg-active': '#5A5A5A',
          'border': '#1A1A1A',
          'border-light': '#414141',
          'text-primary': '#E0E0E0',
          'text-secondary': '#ADADAD',
          'text-tertiary': '#6E6E6E',
          'accent-blue': '#0E7EFF',
          'accent-blue-hover': '#2D8FFF',
          'success': '#00B050',
          'warning': '#FFB000',
          'error': '#FF3939'
        },
        waveform: {
          vocals: '#4AFF88',
          guitar: '#FF8A4A',
          drums: '#4AB3FF',
          bass: '#C84AFF',
          other: '#6E6E6E',
          combined: '#4AB3FF'
        }
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace']
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'lg': '14px',
        'xl': '16px',
        '2xl': '20px'
      }
    }
  },
  plugins: []
};
```

### Component Redesigns

#### PlaybackHeader.tsx
```typescript
// Adobe-style transport bar
<div className="bg-adobe-bg-secondary border-b border-adobe-border px-4 py-2 flex items-center gap-6">
  {/* Transport controls */}
  <div className="flex items-center gap-1">
    <button className="adobe-btn-icon p-2">
      <SkipBack className="w-4 h-4" />
    </button>
    <button className="adobe-btn-icon p-3 bg-adobe-accent-blue hover:bg-adobe-accent-blue-hover">
      <Play className="w-5 h-5 text-white" fill="white" />
    </button>
    <button className="adobe-btn-icon p-2">
      <SkipForward className="w-4 h-4" />
    </button>
  </div>

  {/* Time display */}
  <div className="font-mono text-sm text-adobe-text-primary">
    <span>{formatTime(currentTime)}</span>
    <span className="text-adobe-text-tertiary mx-2">/</span>
    <span className="text-adobe-text-secondary">{formatTime(duration)}</span>
  </div>

  {/* Track info */}
  <div className="flex-1 text-center">
    <div className="text-base font-semibold text-adobe-text-primary">{audioFile.name}</div>
    <div className="text-xs text-adobe-text-secondary">{audioFile.artist}</div>
  </div>

  {/* Master volume */}
  <div className="flex items-center gap-2">
    <Volume2 className="w-4 h-4 text-adobe-text-secondary" />
    <input type="range" className="adobe-slider w-24" />
    <span className="text-xs text-adobe-text-secondary font-mono w-10">80%</span>
  </div>
</div>
```

#### StemTrack.tsx
```typescript
// Adobe-style track with color accent
<div className="bg-adobe-bg-secondary border-t border-adobe-border flex">
  {/* Color strip */}
  <div className="w-1" style={{ backgroundColor: stem.color }} />

  {/* Track header */}
  <div className="flex items-center gap-3 px-3 py-2 min-w-[180px] bg-adobe-bg-tertiary">
    <span className="text-sm font-medium text-adobe-text-primary uppercase tracking-wide">
      {stem.label}
    </span>
    {stem.isLocked && <Lock className="w-3 h-3 text-adobe-text-tertiary" />}
  </div>

  {/* Controls */}
  <div className="flex items-center gap-2 px-3 py-2">
    <button className="adobe-btn-icon w-6 h-6">M</button>
    <button className="adobe-btn-icon w-6 h-6">S</button>
    <span className="text-xs text-adobe-text-tertiary uppercase">Vol</span>
    <input type="range" className="adobe-slider w-20" />
    <input type="number" className="adobe-number-input w-12" value={Math.round(stem.volume * 100)} />
    <span className="text-xs text-adobe-text-tertiary uppercase ml-2">Pan</span>
    <input type="range" className="adobe-slider w-16" />
    <span className="text-xs text-adobe-text-secondary font-mono w-6">{getPanLabel(stem.pan)}</span>
  </div>

  {/* Waveform */}
  <div className="flex-1 adobe-waveform-container">
    <WaveformDisplay {...} />
  </div>
</div>
```

### Implementation Priority

**Phase 3.5: Adobe UI Polish (Days 14-15)**

1. **Update Tailwind config** with Adobe color system
2. **Redesign PlaybackHeader** with transport bar style
3. **Redesign StemTrack** with color strips and compact controls
4. **Update WaveformDisplay** background and colors
5. **Add panel headers** with ALL CAPS styling
6. **Polish buttons and inputs** with Adobe styling
7. **Add subtle animations** (150ms transitions, Adobe-speed)
8. **Test visual consistency** across all components

### Visual Reference

Look at these Adobe products for reference:
- **Adobe Audition** - Waveform display, transport controls, track headers
- **Adobe Premiere Pro** - Panel system, timeline, dark theme
- **Adobe After Effects** - Timeline markers, playback controls

### Font Installation

Add to `/frontend/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">
```

Or use system fonts for performance:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

---

## Phase 1: Real Audio Playback (Days 1-5)

### Goal
Replace simulated playback with real Web Audio API implementation that plays all stems simultaneously with independent controls.

### New Files

#### 1. `/frontend/src/services/audioEngine.ts`
Core audio engine using Web Audio API.

**Key Responsibilities:**
- Initialize AudioContext
- Load audio buffers from URLs
- Synchronize playback across multiple stems
- Individual gain/pan control per stem
- Master playback control (play/pause/seek)

**Class Structure:**
```typescript
class AudioEngine {
  private context: AudioContext;
  private stems: Map<string, StemAudioNode>;
  private masterGain: GainNode;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;

  async init(): Promise<void>
  async loadStem(stemId: string, audioUrl: string): Promise<void>
  play(): void
  pause(): void
  seek(time: number): void
  setVolume(stemId: string, volume: number): void
  setPan(stemId: string, pan: number): void
  setMute(stemId: string, muted: boolean): void
  getCurrentTime(): number
  cleanup(): void
}
```

**Implementation Notes:**
- Use `AudioBufferSourceNode` (one-shot, recreate on each play)
- Track time with `context.currentTime` for sync
- Handle Chrome autoplay policy with user gesture
- Clean up on unmount

#### 2. `/frontend/src/hooks/useAudioEngine.ts`
React hook wrapper for audio engine.

**Interface:**
```typescript
interface UseAudioEngineReturn {
  loadStems: (stems: Stem[]) => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  currentTime: number;
  isLoading: boolean;
  error: string | null;
}
```

**Responsibilities:**
- Manage AudioEngine lifecycle (init/cleanup)
- Handle loading states
- Use requestAnimationFrame for time updates
- Error handling and recovery

### File Modifications

#### `/frontend/src/App.tsx`

**Changes:**
1. Import and use `useAudioEngine` hook
2. Replace simulated playback `useEffect`
3. Sync stem control changes to audio engine
4. Wire up existing handlers to audio engine

```typescript
// Replace simulation with:
const {
  loadStems: loadAudioStems,
  play: playAudio,
  pause: pauseAudio,
  seek: seekAudio,
  currentTime: audioCurrentTime,
  isLoading: audioLoading,
  error: audioError
} = useAudioEngine();

// Update handlePlayPause to call real audio functions
const handlePlayPause = () => {
  if (playbackState.isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
  setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
};

// Sync audio time to UI
useEffect(() => {
  setPlaybackState(prev => ({ ...prev, currentTime: audioCurrentTime }));
}, [audioCurrentTime]);

// Sync stem changes to audio
useEffect(() => {
  stems.forEach(stem => {
    audioEngine.setVolume(stem.id, stem.isMuted ? 0 : stem.volume);
    audioEngine.setPan(stem.id, stem.pan);
  });
}, [stems]);
```

#### `/frontend/src/types/audio.ts`

**Add:**
```typescript
export interface Stem {
  // ... existing fields
  audioUrl?: string;        // URL to audio file
  audioBuffer?: ArrayBuffer; // Loaded audio data
}

export interface AudioLoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  currentStem: string | null;
}
```

### Testing

**Mock Audio Files:**
```typescript
// In mockData.ts
export const mockStems: Stem[] = [
  {
    id: 'stem-vocals',
    audioUrl: '/test-audio/vocals.wav', // Place test files in public/
    // ... other fields
  }
];
```

**Manual Tests:**
- [ ] All stems play simultaneously
- [ ] Volume/mute/pan controls work
- [ ] Seek jumps correctly
- [ ] Stops at end of track
- [ ] No audio glitches
- [ ] Works after tab unfocus

---

## Phase 2: Cinematic Loading Screen (Days 6-8)

### Goal
Display artist metadata and processing progress while backend separates stems.

### New Files

#### 1. `/frontend/src/components/LoadingScreen.tsx`

**Props:**
```typescript
interface LoadingScreenProps {
  artist: string;
  trackName: string;
  bpm?: number;
  timeSignature?: string;
  artistImage?: string;
  progress: number; // 0-100
  status: string;   // "Uploading...", "Analyzing...", etc.
}
```

**Visual Design (Adobe Style):**
```
┌─────────────────────────────────────┐
│                                     │
│      [Large Artist Image]           │
│       (with subtle vignette)        │
│                                     │
│      Midnight Dreams                │
│   The Synthwave Collective          │
│                                     │
│     118 BPM  •  4/4  •  A Minor    │
│                                     │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 45%         │
│     Separating audio stems...       │
│                                     │
└─────────────────────────────────────┘
```

**Styling:**
- Adobe dark background (#1E1E1E)
- Subtle animations (no flashy effects)
- Progress bar with Adobe blue accent
- Monospace font for BPM/time signature

#### 2. `/frontend/src/services/artistImageService.ts`

Fetch artist images from external APIs.

**Strategy:**
1. Try Spotify API (if API key available)
2. Fallback to MusicBrainz (free)
3. Fallback to generated gradient

```typescript
interface ArtistImageResult {
  imageUrl: string;
  source: 'spotify' | 'musicbrainz' | 'placeholder';
}

export async function fetchArtistImage(artistName: string): Promise<ArtistImageResult>
```

### File Modifications

#### `/frontend/src/types/audio.ts`

**Add:**
```typescript
export interface ProcessingStatus {
  stage: 'uploading' | 'analyzing' | 'separating' | 'finalizing' | 'complete';
  progress: number;
  message: string;
  metadata?: {
    artist: string;
    trackName: string;
    bpm?: number;
    timeSignature?: string;
    artistImage?: string;
  };
}
```

#### `/frontend/src/App.tsx`

**Add state:**
```typescript
const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
```

**Update handleFileSelect:**
```typescript
const handleFileSelect = async (file: File) => {
  setProcessingStatus({
    stage: 'uploading',
    progress: 0,
    message: 'Uploading audio file...',
    metadata: { artist: 'Unknown', trackName: file.name }
  });

  const response = await uploadFile(file);
  pollProcessingStatus(response.jobId);
};
```

**Add polling function:**
```typescript
const pollProcessingStatus = async (jobId: string) => {
  const maxAttempts = 300; // 5 minutes

  const poll = async () => {
    const status = await fetch(`/api/separate/status/${jobId}`).then(r => r.json());

    setProcessingStatus({
      stage: status.status,
      progress: status.progress,
      message: getStatusMessage(status.status),
      metadata: status.metadata
    });

    if (status.status === 'complete') {
      // Fetch artist image
      const artistImage = await fetchArtistImage(status.metadata.artist);
      setProcessingStatus(prev => ({
        ...prev,
        metadata: { ...prev.metadata, artistImage: artistImage.imageUrl }
      }));

      // Transition after 1.5s
      setTimeout(async () => {
        const result = await fetch(`/api/separate/result/${jobId}`).then(r => r.json());
        loadSeparatedStems(result);
        setProcessingStatus(null);
      }, 1500);
    } else {
      setTimeout(poll, 1000);
    }
  };

  poll();
};
```

**Conditional render:**
```typescript
// Before main interface render
if (processingStatus && processingStatus.stage !== 'complete') {
  return <LoadingScreen {...processingStatus} {...processingStatus.metadata} />;
}
```

### Backend API Requirements

**1. POST /api/separate/upload**
```typescript
Response: {
  jobId: string,
  filename: string,
  status: 'queued'
}
```

**2. GET /api/separate/status/{jobId}**
```typescript
Response: {
  jobId: string,
  status: 'uploading' | 'analyzing' | 'separating' | 'complete' | 'failed',
  progress: number,
  metadata?: {
    artist: string,
    trackName: string,
    bpm: number,
    timeSignature: string,
    duration: number
  },
  error?: string
}
```

**3. GET /api/separate/result/{jobId}**
```typescript
Response: {
  jobId: string,
  stems: {
    vocals: { url: string, duration: number },
    drums: { url: string, duration: number },
    bass: { url: string, duration: number },
    other: { url: string, duration: number }
  },
  metadata: { ... },
  structure: SongSection[]  // For Phase 3
}
```

---

## Phase 3: Song Structure Markers (Days 9-10)

### Goal
Overlay verse/chorus/bridge markers on waveforms, clickable to jump to sections.

### New Files

#### 1. `/frontend/src/components/StructureMarkers.tsx`

**Props:**
```typescript
interface StructureMarkersProps {
  sections: SongSection[];
  duration: number;
  currentTime: number;
  onSectionClick?: (section: SongSection) => void;
  containerWidth: number;
}
```

**Visual Implementation:**
- Absolute positioned divs over canvas
- Calculate position: `(startTime / duration) * containerWidth`
- Highlight active section
- Click to jump

**Adobe Styling:**
```css
.structure-marker {
  position: absolute;
  top: -20px;
  transform: translateX(-50%);
  padding: 2px 6px;
  background: var(--adobe-bg-tertiary);
  border: 1px solid var(--adobe-border-light);
  border-radius: 2px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  color: var(--adobe-text-secondary);
}

.structure-marker.active {
  background: var(--adobe-accent-blue);
  color: white;
  border-color: var(--adobe-accent-blue);
}

.structure-marker:hover {
  background: var(--adobe-bg-hover);
}
```

### File Modifications

#### `/frontend/src/types/audio.ts`

**Add:**
```typescript
export type SectionType =
  | 'intro' | 'verse' | 'chorus' | 'bridge'
  | 'outro' | 'drop' | 'solo' | 'pre-chorus' | 'post-chorus';

export interface SongSection {
  type: SectionType;
  startTime: number;
  endTime: number;
  label: string;
  confidence?: number;
}

export interface AudioFile {
  // ... existing
  structure?: SongSection[];
}
```

#### `/frontend/src/components/WaveformDisplay.tsx`

**Add prop:**
```typescript
interface WaveformDisplayProps {
  // ... existing
  sections?: SongSection[];
}
```

**Add to render:**
```typescript
return (
  <div ref={containerRef} className="relative group">
    {/* Existing canvas */}
    <canvas ... />

    {/* NEW: Markers overlay */}
    {sections && sections.length > 0 && (
      <StructureMarkers
        sections={sections}
        duration={duration}
        currentTime={currentTime}
        onSectionClick={(section) => onSeek?.(section.startTime)}
        containerWidth={containerRef.current?.offsetWidth || 0}
      />
    )}
  </div>
);
```

**Add resize handler:**
```typescript
useEffect(() => {
  const handleResize = () => forceUpdate();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

#### `/frontend/src/utils/mockData.ts`

**Add:**
```typescript
export const mockSongStructure: SongSection[] = [
  { type: 'intro', startTime: 0, endTime: 8.5, label: 'Intro' },
  { type: 'verse', startTime: 8.5, endTime: 32.1, label: 'Verse 1' },
  { type: 'chorus', startTime: 32.1, endTime: 55.3, label: 'Chorus' },
  { type: 'verse', startTime: 55.3, endTime: 78.9, label: 'Verse 2' },
  { type: 'chorus', startTime: 78.9, endTime: 102.5, label: 'Chorus' },
  { type: 'bridge', startTime: 102.5, endTime: 125.0, label: 'Bridge' },
  { type: 'chorus', startTime: 125.0, endTime: 148.2, label: 'Chorus' },
  { type: 'outro', startTime: 148.2, endTime: 165.0, label: 'Outro' }
];

export const mockAudioFile: AudioFile = {
  // ... existing
  structure: mockSongStructure
};
```

### Backend Requirements

Backend should analyze song structure using Librosa and return in `/api/separate/result/{jobId}`:

```python
# Backend example
import librosa

def analyze_song_structure(audio_path: str) -> List[SongSection]:
    y, sr = librosa.load(audio_path)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    boundaries = librosa.segment.agglomerative(y, k=10)

    sections = []
    for start, end in zip(boundaries[:-1], boundaries[1:]):
        section_type = classify_section(y[start:end], sr)
        sections.append({
            'type': section_type,
            'startTime': start / sr,
            'endTime': end / sr,
            'label': f'{section_type.title()} {i+1}'
        })

    return sections
```

---

## Phase 4: Keyboard Shortcuts (Days 11-13)

### Goal
Add global keyboard shortcuts for playback control.

### New Files

#### 1. `/frontend/src/hooks/useKeyboardShortcuts.ts`

**Interface:**
```typescript
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options?: { enabled?: boolean; ignoreWhenInputFocused?: boolean }
)
```

**Implementation:**
- Listen to window keydown events
- Match key combinations
- Ignore when typing in inputs
- Prevent default browser behavior

#### 2. `/frontend/src/components/KeyboardShortcutsModal.tsx`

Help modal showing all available shortcuts (trigger with `?` key).

**Props:**
```typescript
interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}
```

**Adobe Styling:**
- Dark panel (#2D2D2D)
- Keyboard keys in rounded rectangles
- Organized by category (Playback, Stems, Navigation)

### File Modifications

#### `/frontend/src/App.tsx`

**Add shortcuts:**
```typescript
const shortcuts: KeyboardShortcut[] = [
  { key: ' ', action: handlePlayPause, description: 'Play/Pause' },
  { key: 'ArrowLeft', action: () => handleSeek(currentTime - 5), description: 'Seek -5s' },
  { key: 'ArrowRight', action: () => handleSeek(currentTime + 5), description: 'Seek +5s' },
  { key: '1', action: () => handleToggleMuteByIndex(0), description: 'Toggle vocals' },
  { key: '2', action: () => handleToggleMuteByIndex(1), description: 'Toggle guitar' },
  { key: '3', action: () => handleToggleMuteByIndex(2), description: 'Toggle drums' },
  { key: '4', action: () => handleToggleMuteByIndex(3), description: 'Toggle bass' },
  { key: '5', action: () => handleToggleMuteByIndex(4), description: 'Toggle other' },
  { key: 'm', action: handleMuteAll, description: 'Mute all' },
  { key: 's', action: handleSoloActive, description: 'Solo active stem' },
  { key: '=', action: () => adjustMasterVolume(+0.1), description: 'Volume up' },
  { key: '-', action: () => adjustMasterVolume(-0.1), description: 'Volume down' },
  { key: '?', shift: true, action: () => setShowModal(true), description: 'Show shortcuts' }
];

useKeyboardShortcuts(shortcuts, { enabled: !!audioFile });
```

**Add helper functions:**
```typescript
const handleToggleMuteByIndex = (index: number) => {
  const stem = sortedStems[index];
  if (stem) handleToggleMute(stem.id);
};

const handleMuteAll = () => {
  const allMuted = stems.every(s => s.isMuted);
  setStems(prev => prev.map(s => ({ ...s, isMuted: !allMuted })));
};

const handleSoloActive = () => {
  const activeStem = stems.find(s => !s.isMuted);
  if (activeStem) handleToggleSolo(activeStem.id);
};
```

### Testing

**Manual Tests:**
- [ ] Spacebar toggles play/pause
- [ ] Arrow keys seek
- [ ] Number keys mute stems
- [ ] M mutes/unmutes all
- [ ] +/- adjust volume
- [ ] ? opens modal
- [ ] Shortcuts don't fire when typing in inputs

---

## Critical Files Summary

**5 Most Important Files:**

1. `/frontend/src/services/audioEngine.ts` - Core audio playback
2. `/frontend/src/App.tsx` - Central state & integration
3. `/frontend/src/components/LoadingScreen.tsx` - Processing UI
4. `/frontend/src/components/WaveformDisplay.tsx` - Waveform + markers
5. `/frontend/src/hooks/useKeyboardShortcuts.ts` - Keyboard controls

---

## Dependencies

**Add Source Sans Pro font:**
```bash
# No npm packages needed - use Google Fonts CDN
```

**All other features use native APIs:**
- Web Audio API: Native browser
- Artist images: Fetch API
- Keyboard: Native events
- Styling: Existing Tailwind CSS

---

## Error Handling

### Audio Playback
```typescript
try {
  await audioEngine.loadStem(id, url);
} catch (error) {
  if (error.name === 'NotAllowedError') {
    showAudioPermissionPrompt();
  } else if (error.name === 'NotSupportedError') {
    showError('Audio format not supported');
  } else {
    showError('Failed to load audio');
  }
}
```

### API Errors
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch (error) {
  if (error.message.includes('NetworkError')) {
    showError('Lost connection to server');
  } else {
    showError('Failed to fetch data');
  }
}
```

### Missing Data
```typescript
// Graceful fallbacks
const artistImage = metadata?.artistImage || generatePlaceholderGradient();
if (!sections || sections.length === 0) return null;
```

---

## Team Coordination

### Frontend Developer Tasks:
- Adobe UI redesign
- Loading screen component
- Marker overlay component
- Visual polish & animations

### Fullstack Developer Tasks:
- Audio engine implementation
- Web Audio API integration
- Audio buffer management
- Real-time mixing logic
- Backend API integration

### Backend Developer Tasks (Evan):
- File upload endpoint
- Processing status polling
- Metadata extraction
- Song structure analysis (Librosa)
- Serve separated audio files

---

## Verification Strategy

### End-to-End Test Flow:

1. **Upload File**
   - [ ] Loading screen appears (Adobe style)
   - [ ] Progress updates smoothly
   - [ ] Artist image loads (or placeholder)

2. **Processing Complete**
   - [ ] Transitions to main interface
   - [ ] Adobe UI styling applied
   - [ ] All stems load correctly
   - [ ] Waveforms display properly

3. **Playback**
   - [ ] Press play → all stems play in sync
   - [ ] Volume/pan/mute controls work
   - [ ] Seek jumps correctly
   - [ ] Playhead moves across waveforms

4. **Markers**
   - [ ] Section labels appear (Adobe style)
   - [ ] Active section highlights
   - [ ] Clicking marker jumps to section

5. **Keyboard Shortcuts**
   - [ ] Spacebar toggles playback
   - [ ] Number keys mute stems
   - [ ] All shortcuts work as expected

6. **Adobe UI**
   - [ ] Dark theme matches Adobe products
   - [ ] Colors consistent throughout
   - [ ] Typography matches Adobe scale
   - [ ] Animations are subtle (150ms)

7. **Error Cases**
   - [ ] Failed upload shows error
   - [ ] Missing audio handles gracefully
   - [ ] Network errors display properly

---

## Performance Targets

- **Audio latency:** < 50ms
- **Seek accuracy:** ± 10ms
- **Memory usage:** < 200MB per 5-minute song
- **UI responsiveness:** 60fps during playback
- **Marker positioning:** Pixel-perfect on resize

---

## Success Criteria

✅ **MVP → Full Product Transition Complete When:**

1. Real audio playback works with all stems in sync
2. Volume/pan/mute controls affect audio immediately
3. Loading screen shows during processing
4. Artist metadata displays correctly
5. Song structure markers appear on waveforms
6. Markers are clickable to jump to sections
7. All keyboard shortcuts function properly
8. **Adobe-style UI applied throughout**
9. **Professional dark theme consistent**
10. No major bugs or crashes
11. Backend integration successful
12. End-to-end user flow is smooth

**Timeline:** 3 weeks (15 working days)

**Team:** Frontend + Fullstack developers collaborate; Backend provides APIs

**Result:** Professional, Adobe-quality music stem separator ready for user testing!
