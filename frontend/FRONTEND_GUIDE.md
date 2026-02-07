# Unlayered Frontend - Development Guide

## Overview

The Unlayered frontend is built with **Tauri + React + TypeScript + Tailwind CSS**. This MVP focuses on the UI/UX for a music stem separation application, with mock data simulating the backend integration.

## Project Structure

```
frontend/src/
├── components/          # React components
│   ├── PlaybackHeader.tsx       # Top bar with play controls
│   ├── WaveformDisplay.tsx      # Canvas-based waveform visualization
│   ├── StemTrack.tsx            # Individual stem with controls
│   ├── AIInsights.tsx           # AI-generated song insights panel
│   ├── FileUpload.tsx           # Drag-and-drop file upload
│   └── index.ts                 # Component exports
├── types/
│   └── audio.ts                 # TypeScript interfaces
├── utils/
│   ├── mockData.ts              # Mock audio data for development
│   └── formatTime.ts            # Time formatting utilities
├── App.tsx                      # Main application component
├── main.tsx                     # Entry point
└── index.css                    # Tailwind + global styles
```

## Key Features Implemented

### ✅ Audio File Upload
- Drag-and-drop zone
- File picker
- Currently loads mock data (backend integration pending)

### ✅ Waveform Visualization
- **Combined waveform** at top showing full stereo mix
- **Individual stem waveforms** for vocals, guitar, drums, bass, other
- Color-coded waveforms matching stem type
- Canvas-based rendering for performance
- Timeline scrubbing (click to seek)
- Visual playhead indicator

### ✅ Playback Controls
- Play/Pause button
- Previous/Next track buttons (prepared for multi-file support)
- Current time display (HH:MM:SS format)
- Simulated playback (increments currentTime while playing)

### ✅ Stem Management
Each stem track includes:
- **Mute button** - Toggle audio muting
- **Solo button** - Isolate single stem
- **Volume slider** - Adjust stem volume (0-100%)
- **Pan control** - Stereo positioning (L/C/R)
- **Lock indicator** - Shows tracks are auto-managed
- **Color-coded visual identity**

### ✅ Dynamic Track Ordering
Stems automatically reorder based on:
1. Muted status (muted tracks sink to bottom)
2. Audio presence (tracks with no audio go to bottom)
3. Solo status (soloed tracks rise to top)
4. Volume level (higher volume = higher position)

This uses React's `useMemo` for efficient re-sorting.

### ✅ Visual Feedback
- **Peak flashing** - Yellow flash on waveform during loud sections
- **Playhead visualization** - Red line across all waveforms
- **Hover states** - Interactive feedback on clickable elements
- **Smooth animations** - Tracks slide smoothly when reordering

### ✅ AI Insights Panel
Displays mock AI-generated information:
- Song summary/description
- Genre classification
- Mood analysis
- Tempo (BPM)
- Musical key

Placeholder for backend integration: "Evan gets to figure this out"

## Component Architecture

### `App.tsx`
Main application container managing:
- Global state (audio file, stems, playback)
- Event handlers (play/pause, mute, solo, volume, pan)
- Dynamic stem sorting logic
- Conditional rendering (upload vs. player view)

### `PlaybackHeader`
Top navigation bar with:
- Transport controls (previous, play/pause, next)
- Song title and artist
- Current time display

### `WaveformDisplay`
Canvas-based waveform renderer:
- Draws stereo waveform from data array
- Highlights played vs. unplayed sections
- Renders playhead indicator
- Detects peaks for flash effects
- Handles click-to-seek

### `StemTrack`
Individual stem row combining:
- Stem label and color indicator
- Control buttons (mute, solo)
- Volume and pan sliders
- Embedded waveform display
- Lock icon (for auto-managed ordering)

### `AIInsights`
Right sidebar panel showing:
- AI-generated song analysis
- Metadata (genre, mood, tempo, key)
- Placeholder text for backend integration

### `FileUpload`
Upload interface with:
- Drag-and-drop zone
- File browser button
- Visual feedback for drag state
- Accepts audio/* file types

## State Management

Uses React's built-in hooks:
- `useState` for component state
- `useEffect` for playback simulation
- `useMemo` for efficient stem sorting
- `useRef` for canvas DOM access

### Key State Objects

**AudioFile:**
```typescript
{
  id: string;
  name: string;
  artist: string;
  duration: number;  // seconds
  format: string;    // "MP3", "WAV", etc.
}
```

**Stem:**
```typescript
{
  id: string;
  type: 'vocals' | 'guitar' | 'drums' | 'bass' | 'other';
  volume: number;      // 0-1
  pan: number;         // -1 (left) to 1 (right)
  isMuted: boolean;
  isSolo: boolean;
  isLocked: boolean;   // auto-ordering enabled
  waveformData: number[];  // amplitude values
  hasAudio: boolean;
  order: number;
}
```

**PlaybackState:**
```typescript
{
  isPlaying: boolean;
  currentTime: number;  // seconds
  duration: number;     // seconds
  volume: number;       // 0-1
}
```

## Mock Data

Located in `src/utils/mockData.ts`:
- **mockAudioFile** - Sample song "Midnight Dreams"
- **mockStems** - 5 stems with generated waveforms
- **mockCombinedWaveform** - Combined audio visualization
- **mockPeaks** - Peak detection points for flash effects
- **mockAIInsight** - AI-generated song analysis

### Waveform Generation
`generateWaveformData()` creates realistic-looking waveforms using:
- Sine waves for base pattern
- Random noise for variation
- Complexity parameter for different stem characteristics

## Styling

### Tailwind CSS Configuration
Custom colors defined in `tailwind.config.js`:
```javascript
waveform: {
  vocals: '#4ade80',    // Green
  guitar: '#f97316',    // Orange
  drums: '#3b82f6',     // Blue
  bass: '#a855f7',      // Purple
  other: '#64748b',     // Gray
  combined: '#06b6d4',  // Cyan
}
```

### Dark Theme
Default color scheme uses:
- Slate backgrounds (#0f172a, #1e293b, #334155)
- White/light text
- Color-coded accents for stems
- Custom scrollbars

## Future Backend Integration

### Planned IPC Handlers (Tauri)

**Audio Processing:**
```typescript
// Upload audio file for separation
invoke('upload_audio_file', { filePath: string })
  -> Promise<{ jobId: string }>

// Get separation status
invoke('get_separation_status', { jobId: string })
  -> Promise<{ status: 'queued' | 'processing' | 'completed', progress: number }>

// Get separated stems
invoke('get_separated_stems', { jobId: string })
  -> Promise<{ stems: Stem[] }>
```

**AI Analysis:**
```typescript
// Get AI-generated insights
invoke('get_ai_insights', { jobId: string })
  -> Promise<AIInsight>
```

**Playback:**
```typescript
// Load audio for playback
invoke('load_audio', { stemId: string, audioPath: string })
  -> Promise<void>

// Control playback
invoke('play_audio', { stems: string[] })
invoke('pause_audio')
invoke('seek_audio', { time: number })
```

### Integration Points

Replace these mock implementations:

1. **FileUpload.tsx** - Call Tauri file picker:
   ```typescript
   import { open } from '@tauri-apps/plugin-dialog';
   const selected = await open({ filters: [{ name: 'Audio', extensions: ['mp3', 'wav'] }] });
   ```

2. **App.tsx:handleFileSelect** - Send file to backend for processing

3. **App.tsx:handlePlayPause** - Control actual audio playback via Tauri

4. **WaveformDisplay** - Replace mock waveform data with real audio analysis

5. **AIInsights** - Fetch real AI-generated insights from backend

## Running the App

### Development Mode (Web)
Fastest for UI development:
```bash
npm run dev
```
Open http://localhost:5173

### Tauri Desktop Mode
Full desktop app:
```bash
npm run tauri:dev
```

### Building for Production
```bash
npm run tauri:build
```

## Testing Mock Features

1. **Upload Screen**: Set `audioFile` to `null` in App.tsx to see file upload UI
2. **Playback**: Click play button - time advances and playhead moves
3. **Mute/Solo**: Click buttons - tracks reorder automatically
4. **Volume/Pan**: Adjust sliders - no audio but UI updates
5. **Seek**: Click on waveforms to jump to different times
6. **Peak Flash**: Watch for yellow flash during peaks (every ~30 seconds)

## Known Limitations (MVP)

- No actual audio playback (HTML5 Audio or Web Audio API needed)
- No real file processing (backend integration pending)
- Waveforms are simulated, not derived from real audio
- Single audio file only (multi-track support planned)
- No export functionality yet
- No settings/preferences panel

## Next Steps for Integration

1. **Backend Communication**: Set up Tauri IPC handlers
2. **Audio Playback**: Implement Web Audio API for real-time mixing
3. **Real Waveforms**: Generate waveforms from actual audio files
4. **Processing Status**: Show progress bar during stem separation
5. **Error Handling**: Add error states for failed processing
6. **File Management**: Add recent files, playlists, etc.

## Component Customization

### Changing Stem Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  waveform: {
    vocals: '#yourcolor',
  }
}
```

### Adjusting Waveform Height
Pass `height` prop to `WaveformDisplay`:
```typescript
<WaveformDisplay height={120} ... />
```

### Modifying Time Format
Edit `src/utils/formatTime.ts` to change display format

## Performance Notes

- Canvas rendering is GPU-accelerated
- useMemo prevents unnecessary re-sorts
- Waveform data is kept simple (1000 points max)
- No React re-renders during playback (state batched every 100ms)

## Browser Compatibility

Requires:
- ES2020+ support
- Canvas API
- CSS Grid & Flexbox
- Modern JavaScript features (optional chaining, nullish coalescing)

Tested on:
- Chrome 100+
- Safari 15+
- Firefox 100+

## Questions?

- UI/UX decisions: Frontend developer
- Audio playback logic: Fullstack developer
- Backend integration: Backend developer (Evan)

Happy coding! 🎵
