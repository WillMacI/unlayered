import { useState, useEffect, useMemo } from 'react';
import { PlaybackHeader } from './components/PlaybackHeader';
import { WaveformDisplay } from './components/WaveformDisplay';
import { StemTrack } from './components/StemTrack';
import { AIInsights } from './components/AIInsights';
import { FileUpload } from './components/FileUpload';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

import { useAudioEngine } from './hooks/useAudioEngine';
import { useKeyboardShortcuts, type KeyboardShortcut } from './hooks/useKeyboardShortcuts';
import type { AudioFile, Stem, PlaybackState } from './types/audio';
import {
  mockAudioFile,
  mockStems,
  mockAIInsight,
  mockCombinedWaveform,
  mockPeaks,
  mockSongStructure,
} from './utils/mockData';

function App() {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(mockAudioFile);
  const [stems, setStems] = useState<Stem[]>(mockStems);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: mockAudioFile.duration,
    volume: 0.8,
  });
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [stemsLoaded, setStemsLoaded] = useState(false);
  const [combinedWaveform, setCombinedWaveform] = useState<number[]>(mockCombinedWaveform);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(10, prev * 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(1, prev / 1.5));

  // Initialize audio engine
  const {
    loadStems: loadAudioStems,
    play: playAudio,
    pause: pauseAudio,
    seek: seekAudio,
    setVolume: setAudioVolume,
    setPan: setAudioPan,
    setMute: setAudioMute,
    setMasterVolume,
    currentTime: audioCurrentTime,
    duration: audioDuration,
    isLoading: audioLoading,
    error: audioError,
    getWaveformData,
  } = useAudioEngine();

  // Sync audio time to UI
  useEffect(() => {
    setPlaybackState((prev) => ({ ...prev, currentTime: audioCurrentTime }));
  }, [audioCurrentTime]);

  // Sync audio duration to UI
  useEffect(() => {
    if (audioDuration > 0) {
      setPlaybackState((prev) => ({ ...prev, duration: audioDuration }));
    }
  }, [audioDuration]);

  // Load stems when audio file is set (only once)
  useEffect(() => {
    if (audioFile && !stemsLoaded && stems.length > 0) {
      // Check if any stems have audio URLs (for real audio)
      const stemsWithAudio = stems.filter((s) => s.audioUrl);
      if (stemsWithAudio.length > 0) {
        loadAudioStems(stems).then(() => {
          setStemsLoaded(true);

          // Generate real waveforms from loaded buffers
          setStems(prevStems => {
            const updatedStems = prevStems.map(stem => {
              if (stem.audioUrl) {
                // Generate 1000 points for accurate visualization
                const realWaveform = getWaveformData(stem.id, 1000);
                if (realWaveform.length > 0 && realWaveform.some(v => v > 0)) {
                  return { ...stem, waveformData: realWaveform };
                }
              }
              return stem;
            });

            // Calculate combined waveform (average of all active stems)
            const length = 1000;
            const combined = new Array(length).fill(0);
            let activeCount = 0;

            updatedStems.forEach(stem => {
              if (stem.waveformData && stem.waveformData.length === length) {
                activeCount++;
                for (let i = 0; i < length; i++) {
                  combined[i] += stem.waveformData[i];
                }
              }
            });

            if (activeCount > 0) {
              // Normalize combined waveform
              const max = Math.max(...combined) || 1;
              const normalizedCombined = combined.map(v => Math.min(1, (v / max) * 1.2));
              setCombinedWaveform(normalizedCombined);
            }

            return updatedStems;
          });
        });
      }
    }
  }, [audioFile, stemsLoaded, loadAudioStems, getWaveformData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Note: stems is intentionally not in dependencies to prevent reloading on volume/mute changes

  // Dynamic track ordering: sort stems by activity
  const sortedStems = useMemo(() => {
    return [...stems].sort((a, b) => {
      // Muted or no audio goes to bottom
      if (a.isMuted && !b.isMuted) return 1;
      if (!a.isMuted && b.isMuted) return -1;
      if (!a.hasAudio && b.hasAudio) return 1;
      if (a.hasAudio && !b.hasAudio) return -1;

      // Solo stems go to top
      if (a.isSolo && !b.isSolo) return -1;
      if (!a.isSolo && b.isSolo) return 1;

      // Then by volume
      return b.volume - a.volume;
    });
  }, [stems]);

  const handlePlayPause = () => {
    if (playbackState.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
    setPlaybackState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSeek = (time: number) => {
    seekAudio(time);
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
  };

  const handleToggleMute = (stemId: string) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          const newMuted = !stem.isMuted;
          setAudioMute(stemId, newMuted);
          return { ...stem, isMuted: newMuted };
        }
        return stem;
      })
    );
  };

  const handleToggleSolo = (stemId: string) => {
    setStems((prev) => {
      const clickedStem = prev.find((s) => s.id === stemId);
      if (!clickedStem) return prev;

      // If toggling solo off - restore original mute states
      if (clickedStem.isSolo) {
        const updated = prev.map((stem) => ({ ...stem, isSolo: false }));

        // Restore original mute states in audio engine
        updated.forEach((stem) => {
          setAudioMute(stem.id, stem.isMuted);
        });

        return updated;
      }

      // Toggle solo on - mute all except the soloed stem
      const updated = prev.map((stem) => ({
        ...stem,
        isSolo: stem.id === stemId,
      }));

      // Update audio engine: mute all except soloed stem
      updated.forEach((stem) => {
        if (stem.id === stemId) {
          // Unmute the soloed stem
          setAudioMute(stem.id, false);
        } else {
          // Mute all other stems
          setAudioMute(stem.id, true);
        }
      });

      return updated;
    });
  };

  const handleVolumeChange = (stemId: string, volume: number) => {
    setAudioVolume(stemId, volume);
    setStems((prev) =>
      prev.map((stem) =>
        stem.id === stemId ? { ...stem, volume } : stem
      )
    );
  };

  const handlePanChange = (stemId: string, pan: number) => {
    setAudioPan(stemId, pan);
    setStems((prev) =>
      prev.map((stem) =>
        stem.id === stemId ? { ...stem, pan } : stem
      )
    );
  };

  const handleFileSelect = (file: File) => {
    // In a real app, this would trigger backend processing
    console.log('File selected:', file);
    // For now, just use mock data
    setAudioFile(mockAudioFile);
  };

  const handlePrevious = () => {
    console.log('Previous track');
  };

  const handleNext = () => {
    console.log('Next track');
  };

  // Keyboard shortcut helpers
  const handleToggleMuteByIndex = (index: number) => {
    const stem = sortedStems[index];
    if (stem) handleToggleMute(stem.id);
  };

  const handleMuteAll = () => {
    const allMuted = stems.every((s) => s.isMuted);
    setStems((prev) =>
      prev.map((s) => {
        const newMuted = !allMuted;
        setAudioMute(s.id, newMuted);
        return { ...s, isMuted: newMuted };
      })
    );
  };

  const handleSoloActive = () => {
    const activeStem = stems.find((s) => !s.isMuted);
    if (activeStem) handleToggleSolo(activeStem.id);
  };

  const adjustMasterVolume = (delta: number) => {
    setPlaybackState((prev) => {
      const newVolume = Math.max(0, Math.min(1, prev.volume + delta));
      setMasterVolume(newVolume);
      return { ...prev, volume: newVolume };
    });
  };

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    { key: ' ', action: handlePlayPause, description: 'Play/Pause' },
    {
      key: 'ArrowLeft',
      action: () => handleSeek(Math.max(0, playbackState.currentTime - 5)),
      description: 'Seek -5s',
    },
    {
      key: 'ArrowRight',
      action: () => handleSeek(Math.min(playbackState.duration, playbackState.currentTime + 5)),
      description: 'Seek +5s',
    },
    { key: '1', action: () => handleToggleMuteByIndex(0), description: 'Toggle vocals' },
    { key: '2', action: () => handleToggleMuteByIndex(1), description: 'Toggle guitar' },
    { key: '3', action: () => handleToggleMuteByIndex(2), description: 'Toggle drums' },
    { key: '4', action: () => handleToggleMuteByIndex(3), description: 'Toggle bass' },
    { key: '5', action: () => handleToggleMuteByIndex(4), description: 'Toggle other' },
    { key: 'm', action: handleMuteAll, description: 'Mute all' },
    { key: 's', action: handleSoloActive, description: 'Solo active stem' },
    { key: '=', action: () => adjustMasterVolume(0.1), description: 'Volume up' },
    { key: '-', action: () => adjustMasterVolume(-0.1), description: 'Volume down' },
    {
      key: '?',
      shift: true,
      action: () => setShowShortcutsModal((prev) => !prev),
      description: 'Show shortcuts',
    },
  ];

  // Enable keyboard shortcuts when audio file is loaded
  useKeyboardShortcuts(shortcuts, { enabled: !!audioFile });

  // Show loading screen if processing
  /* Removed demo loading screen logic */

  // If no audio file, show upload screen
  if (!audioFile) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Unlayered</h1>
            <p className="text-slate-400">
              A new way to listen to music
            </p>
          </div>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-white select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        shortcuts={shortcuts}
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Error Display */}
      {audioError && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-200 px-4 py-3 mx-4 mt-4 rounded-lg backdrop-blur-md">
          <p className="text-sm font-medium">Audio Error: {audioError}</p>
        </div>
      )}

      {/* Loading Display */}
      {audioLoading && (
        <div className="bg-white/5 border border-white/10 text-neutral-300 px-4 py-3 mx-4 mt-4 rounded-lg backdrop-blur-md">
          <p className="text-sm font-medium">Loading audio files...</p>
        </div>
      )}

      {/* Header */}
      <PlaybackHeader
        audioFile={audioFile}
        playbackState={playbackState}
        onPlayPause={handlePlayPause}
        onPrevious={() => { }}
        onNext={() => { }}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        zoomLevel={zoomLevel}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* Main Content */}
      <div className="flex-1 flex gap-6 px-8 py-6 overflow-hidden">
        {/* Left: Waveforms - Main "Page" feel */}
        <div className="flex-1 flex flex-col space-y-6">

          {/* Combined Waveform Card */}
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Stereo / Master
                  </h3>
                  <p className="text-xs text-neutral-500">Original Mix</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <WaveformDisplay
                waveformData={combinedWaveform}
                currentTime={playbackState.currentTime}
                duration={playbackState.duration}
                peaks={mockPeaks}
                color="#D4AF37" // Metallic Gold
                label=""
                onSeek={handleSeek}
                height={120}
                isCombined
                sections={mockSongStructure}
                zoom={zoomLevel}
              />
            </div>
          </div>

          {/* Individual Stems List */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold px-1" style={{ color: 'var(--text-primary)' }}>Stems</h3>
            <div className="space-y-px rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {sortedStems.map((stem) => (
                <StemTrack
                  key={stem.id}
                  stem={stem}
                  currentTime={playbackState.currentTime}
                  duration={playbackState.duration}
                  onToggleMute={handleToggleMute}
                  onToggleSolo={handleToggleSolo}
                  onVolumeChange={handleVolumeChange}
                  onPanChange={handlePanChange}
                  onSeek={handleSeek}
                  zoom={zoomLevel}
                />
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="px-2 mt-4">
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              Press <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 font-medium text-[10px]">Shift+?</kbd> for keyboard shortcuts
            </p>
          </div>
        </div>

        {/* Right: AI Insights (Sidebar) */}
        {showSidebar && (
          <div className="w-[340px] flex-shrink-0 transition-all duration-300">
            <AIInsights insight={mockAIInsight} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
