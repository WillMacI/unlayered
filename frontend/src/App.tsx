import { useState, useEffect, useMemo, useRef, useCallback, type UIEvent } from 'react';
import { PlaybackHeader } from './components/PlaybackHeader';
import { WaveformDisplay } from './components/WaveformDisplay';
import { StemTrack } from './components/StemTrack';
import { AIInsights } from './components/AIInsights';
import { FileUpload } from './components/FileUpload';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { LoadingScreen } from './components/LoadingScreen';
import { Toast } from './components/Toast';

import { SongIntro } from './components/SongIntro';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useSeparation } from './hooks/useSeparation';
import { useKeyboardShortcuts, type KeyboardShortcut } from './hooks/useKeyboardShortcuts';
import { getStemDownloadUrl } from './services/apiClient';
import type { AudioFile, Stem, PlaybackState } from './types/audio';
import { mapBackendStemToType } from './types/audio';
import {
  mockAudioFile,
  mockStems,
  mockAIInsight,
  mockCombinedWaveform,
  mockPeaks,
  mockSongStructure,
  generateWaveformData,
} from './utils/mockData';

// Stem color and label configuration
const STEM_CONFIG: Record<string, { color: string; label: string; order: number }> = {
  vocals: { color: '#D4AF37', label: 'Vocals', order: 1 },
  guitar: { color: '#D4AF37', label: 'Guitar', order: 2 },
  drums: { color: '#D4AF37', label: 'Drums', order: 3 },
  bass: { color: '#D4AF37', label: 'Bass', order: 4 },
  other: { color: '#D4AF37', label: 'Other', order: 5 },
  piano: { color: '#D4AF37', label: 'Piano', order: 6 },
};

function App() {
  // const [audioFile, setAudioFile] = useState<AudioFile | null>(mockAudioFile); // Start with mock
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null); // Start with Upload Screen
  const [showIntro, setShowIntro] = useState(false); // Intro screen state
  const [stems, setStems] = useState<Stem[]>([]);
  const stemsRef = useRef(stems);
  const prevStemsRef = useRef<Stem[]>([]);
  const prevAnySoloRef = useRef(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: mockAudioFile.duration,
    volume: 0.8,
  });
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [stemsLoaded, setStemsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; variant: 'error' | 'success' | 'info' } | null>(null);

  // Separation hook for backend integration
  const {
    stage: separationStage,
    progress: separationProgress,
    error: separationError,
    result: separationResult,
    capabilities,
    recommendedQuality,
    startSeparation,
    reset: resetSeparation,
  } = useSeparation();

  // Ref to hold current playback state for stable keyboard shortcut callbacks
  const playbackStateRef = useRef(playbackState);
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);
  useEffect(() => {
    stemsRef.current = stems;
  }, [stems]);
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
    isPlaying: audioIsPlaying,
    isLoading: audioLoading,
    error: audioError,
    getStereoWaveformData,
  } = useAudioEngine();

  useEffect(() => {
    const prevStems = prevStemsRef.current;
    if (prevStems.length === 0) {
      prevStemsRef.current = stems;
      return;
    }

    const prevMutedById = new Map(prevStems.map((stem) => [stem.id, stem.isMuted]));
    const anySolo = stems.some((stem) => stem.isSolo);
    const soloChanged = anySolo !== prevAnySoloRef.current;
    stems.forEach((stem) => {
      const prevMuted = prevMutedById.get(stem.id);
      const targetMuted = anySolo ? !stem.isSolo : stem.isMuted;
      if (prevMuted === undefined || prevMuted !== stem.isMuted || anySolo || soloChanged) {
        setAudioMute(stem.id, targetMuted);
      }
    });

    prevStemsRef.current = stems;
    prevAnySoloRef.current = anySolo;
  }, [stems, setAudioMute]);

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

  // Sync playing state to UI (also handles end-of-track updates)
  useEffect(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: audioIsPlaying }));
  }, [audioIsPlaying]);

  // Sync master volume to audio engine
  useEffect(() => {
    setMasterVolume(playbackState.volume);
  }, [playbackState.volume, setMasterVolume]);

  // Handle separation completion
  useEffect(() => {
    if (separationStage === 'completed' && separationResult) {
      // Convert backend result to Stem[] format, filtering out null tracks
      const newStems: Stem[] = Object.entries(separationResult.tracks)
        .filter(([_stemName, path]) => path !== null) // Only include stems that exist
        .map(([stemName, _path]) => {
          // mapBackendStemToType safely handles unknown stem names by returning 'other'
          const stemType = mapBackendStemToType(stemName);
          const config = STEM_CONFIG[stemName] || STEM_CONFIG.other;

          return {
            id: `stem-${stemName}`,
            type: stemType,
            label: config.label,
            color: config.color,
            volume: 0.8,
            pan: 0,
            isMuted: false,
            isSolo: false,
            isLocked: true,
            waveformData: generateWaveformData(1000, 0.8),
            hasAudio: true,
            order: config.order,
            audioUrl: getStemDownloadUrl(separationResult.job_id, stemName),
          };
        });

      // Sort by order
      newStems.sort((a, b) => a.order - b.order);

      // Create audio file metadata
      // Note: Backend doesn't provide audio duration, so we use a default
      // The actual duration will be set once stems are loaded
      const newAudioFile: AudioFile = {
        id: separationResult.job_id,
        name: 'Separated Track',
        artist: 'Unknown Artist',
        duration: 180, // Will be updated when audio loads
        format: 'WAV',
      };

      setStems(newStems);
      setStemsLoaded(false);
      setCombinedWaveform([]);
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        duration: newAudioFile.duration,
      }));
      setAudioFile(newAudioFile);
      setShowIntro(true);
    }
  }, [separationStage, separationResult]);

  // Handle separation failure
  useEffect(() => {
    if (separationStage === 'failed' && separationError) {
      setToastMessage({ message: separationError, variant: 'error' });
      resetSeparation();
    }
  }, [separationStage, separationError, resetSeparation]);

  // Load stems when audio file is set (only once)
  useEffect(() => {
    if (!audioFile || stemsLoaded || stems.length === 0) return;

    // Check if any stems have audio URLs (for real audio)
    const stemsWithAudio = stems.filter((s) => s.audioUrl);
    if (stemsWithAudio.length === 0) return;

    let cancelled = false;

    const load = async () => {
      try {
        await loadAudioStems(stems);
        if (cancelled) return;

        setStemsLoaded(true);

        // Generate real waveforms from loaded buffers
        setStems(prevStems => {
          const updatedStems = prevStems.map(stem => {
            if (stem.audioUrl) {
              // Generate 2000 points for detailed stereo visualization
              const realWaveform = getStereoWaveformData(stem.id, 2000);
              // Real waveform comes back as { left: [], right: [] } always from our new method helper
              // Check if it has data
              if (realWaveform.left.length > 0 && realWaveform.left.some(v => v > 0)) {
                return { ...stem, waveformData: realWaveform };
              }
            }
            return stem;
          });

          // Calculate combined waveform (average of all active stems)
          const length = 2000;
          const combined = new Array(length).fill(0);
          let activeCount = 0;

          updatedStems.forEach(stem => {
            // Handle both mono and stereo structures for the combined view logic
            let dataToAdd: number[] = [];
            if (Array.isArray(stem.waveformData)) {
              if (stem.waveformData.length === length) dataToAdd = stem.waveformData;
            } else {
              // If stereo, just mix the left channel for the "master" visual for now, or mix L+R
              const stereoData = stem.waveformData as { left: number[], right: number[] };
              if (stereoData.left.length === length) {
                // Simple mono mixdown for visualization
                dataToAdd = stereoData.left.map((v, i) => (v + stereoData.right[i]) / 2);
              }
            }

            if (dataToAdd.length === length) {
              activeCount++;
              for (let i = 0; i < length; i++) {
                combined[i] += dataToAdd[i];
              }
            }
          });

          if (activeCount > 0) {
            // Normalize combined waveform - compute max iteratively
            let max = 0;
            for (let i = 0; i < combined.length; i++) {
              if (combined[i] > max) max = combined[i];
            }
            if (max === 0) max = 1;
            const normalizedCombined = combined.map(v => Math.min(1, (v / max) * 1.2));
            setCombinedWaveform(normalizedCombined);
          }

          return updatedStems;
        });
      } catch (err) {
        if (!cancelled) {
          console.warn('Stem loading failed; will allow retry on next attempt.', err);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [audioFile, stemsLoaded, loadAudioStems, getStereoWaveformData, stems]);

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

  const handlePlayPause = useCallback(() => {
    if (playbackStateRef.current.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [pauseAudio, playAudio]);

  const handleSeek = useCallback((time: number) => {
    seekAudio(time);
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
    userHasScrolled.current = false; // Snap back to playhead on seek
  }, [seekAudio]);

  const handleToggleMute = useCallback((stemId: string) => {
    setStems((prev) => {
      const nextStems = prev.map((stem) =>
        stem.id === stemId ? { ...stem, isMuted: !stem.isMuted } : stem
      );
      return nextStems;
    });
  }, []);

  const handleToggleSolo = useCallback((stemId: string) => {
    setStems((prev) => {
      const clickedStem = prev.find((s) => s.id === stemId);
      if (!clickedStem) return prev;

      // If toggling solo off - restore original mute states
      if (clickedStem.isSolo) {
        return prev.map((stem) => ({ ...stem, isSolo: false }));
      }

      // Toggle solo on - mute all except the soloed stem
      return prev.map((stem) => ({
        ...stem,
        isSolo: stem.id === stemId,
      }));
    });
  }, []);

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

  const handleFileSelect = async (file: File, quality: number) => {
    // Start real backend separation
    await startSeparation(file, quality);
  };

  // Fallback for development/testing with mock data
  const handleFileSelectMock = (file: File, _quality: number) => {
    console.log('File selected (mock mode):', file);

    setAudioFile(mockAudioFile);
    setStemsLoaded(false);
    setCombinedWaveform([]);
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      duration: mockAudioFile.duration,
    }));
    setStems(mockStems);
    setShowIntro(true);
  };

  // Use mock handler if backend is not responding (for development)
  const handleFileSelectWithFallback = async (file: File, quality: number) => {
    try {
      await handleFileSelect(file, quality);
    } catch (err) {
      console.warn('Backend not available, using mock data:', err);
      handleFileSelectMock(file, quality);
    }
  };

  // Keyboard shortcut helpers - wrapped in useCallback to stabilize shortcuts memoization
  const handleToggleMuteByIndex = useCallback((index: number) => {
    const shortcutOrder = ['vocals', 'guitar', 'drums', 'bass', 'other'];
    const targetType = shortcutOrder[index];
    if (!targetType) return;

    const stem = stemsRef.current.find((s) => s.type === targetType);
    if (stem) handleToggleMute(stem.id);
  }, [handleToggleMute]);

  const handleMuteAll = useCallback(() => {
    setStems((prevStems) => {
      const allMuted = prevStems.every((s) => s.isMuted);
      const newMuted = !allMuted;
      const nextStems = prevStems.map((stem) => ({
        ...stem,
        isMuted: newMuted,
      }));
      return nextStems;
    });
  }, []);

  const handleSoloActive = useCallback(() => {
    setStems((prev) => {
      const activeStem = prev.find((s) => !s.isMuted);
      if (activeStem) {
        // Trigger solo toggle via the callback pattern
        const clickedStem = prev.find((s) => s.id === activeStem.id);
        if (!clickedStem) return prev;

        if (clickedStem.isSolo) {
          return prev.map((stem) => ({ ...stem, isSolo: false }));
        }

        return prev.map((stem) => ({
          ...stem,
          isSolo: stem.id === activeStem.id,
        }));
      }
      return prev;
    });
  }, []);

  const adjustMasterVolume = useCallback((delta: number) => {
    const currentVolume = playbackStateRef.current.volume;
    const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
    setMasterVolume(newVolume);
    setPlaybackState((prev) => ({ ...prev, volume: newVolume }));
  }, [setMasterVolume]);



  // Define keyboard shortcuts - memoized to prevent listener churn
  // Uses playbackStateRef for fresh values without adding to dependency array
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: ' ', action: handlePlayPause, description: 'Play/Pause', category: 'playback' },
    {
      key: 'ArrowLeft',
      action: () => handleSeek(Math.max(0, playbackStateRef.current.currentTime - 5)),
      description: 'Seek -5s',
      category: 'playback',
    },
    {
      key: 'ArrowRight',
      action: () => handleSeek(Math.min(playbackStateRef.current.duration, playbackStateRef.current.currentTime + 5)),
      description: 'Seek +5s',
      category: 'playback',
    },
    { key: '1', action: () => handleToggleMuteByIndex(0), description: 'Toggle vocals', category: 'stem' },
    { key: '2', action: () => handleToggleMuteByIndex(1), description: 'Toggle guitar', category: 'stem' },
    { key: '3', action: () => handleToggleMuteByIndex(2), description: 'Toggle drums', category: 'stem' },
    { key: '4', action: () => handleToggleMuteByIndex(3), description: 'Toggle bass', category: 'stem' },
    { key: '5', action: () => handleToggleMuteByIndex(4), description: 'Toggle other', category: 'stem' },
    { key: 'm', action: handleMuteAll, description: 'Mute all', category: 'stem' },
    { key: 's', action: handleSoloActive, description: 'Solo active stem', category: 'stem' },
    { key: '=', action: () => adjustMasterVolume(0.1), description: 'Volume up', category: 'volume' },
    { key: '+', shift: true, action: () => adjustMasterVolume(0.1), description: 'Volume up', category: 'volume' },
    { key: '-', action: () => adjustMasterVolume(-0.1), description: 'Volume down', category: 'volume' },
    {
      key: '?',
      shift: true,
      action: () => setShowShortcutsModal((prev) => !prev),
      description: 'Show shortcuts',
      category: 'general',
    },
  ], [handlePlayPause, handleSeek, handleToggleMuteByIndex, handleMuteAll, handleSoloActive, adjustMasterVolume]);

  // Enable keyboard shortcuts only when audio file is loaded and intro is not shown
  useKeyboardShortcuts(shortcuts, { enabled: !!audioFile && !showIntro });

  // Scroll Sync Logic
  const scrollContainers = useRef<Set<HTMLDivElement>>(new Set());
  const isAutoScrolling = useRef(false);
  const userHasScrolled = useRef(false);

  const registerScrollRef = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      scrollContainers.current.add(ref);
    } else {
      // Clean up any containers that are no longer connected
      scrollContainers.current.forEach((container) => {
        if (!container.isConnected) {
          scrollContainers.current.delete(container);
        }
      });
    }
  }, []);

  const handleGlobalScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isAutoScrolling.current) return;

    // User is scrolling manually
    userHasScrolled.current = true;
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;

    isAutoScrolling.current = true;
    scrollContainers.current.forEach((container) => {
      if (container !== target && container.isConnected) {
        container.scrollLeft = scrollLeft;
      }
    });
    // Small timeout to allow the scroll events to settle before unflagging
    requestAnimationFrame(() => {
      isAutoScrolling.current = false;
    });
  }, []);

  const handleUserInteract = useCallback(() => {
    // If user clicks seeking, we can re-enable auto-scroll or keep it as is
    // For now, let's say seeking DOES NOT disable auto-scroll (it "resets" userHasScrolled)
    // userHasScrolled.current = false;
    // Actually, usually seeking jumps the playhead, so we SHOULD snap to it.
    userHasScrolled.current = false;
  }, []);

  // Update scroll based on playhead
  useEffect(() => {
    const { duration, currentTime } = playbackState;
    // Always follow playhead if user hasn't scrolled, even if paused.
    if (!userHasScrolled.current && duration > 0 && zoomLevel > 1) {
      const containers = Array.from(scrollContainers.current);
      if (containers.length > 0 && containers[0].isConnected) {
        const container = containers[0]; // Use first as reference for dimensions
        const totalWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;

        const progress = currentTime / duration;
        const targetScroll = (totalWidth * progress) - (clientWidth / 2); // Center playhead

        if (Math.abs(container.scrollLeft - targetScroll) > 5) { // Only scroll if difference is significant
          isAutoScrolling.current = true;
          containers.forEach(c => {
            if (c.isConnected) c.scrollLeft = targetScroll;
          });
          requestAnimationFrame(() => {
            isAutoScrolling.current = false;
          });
        }
      }
    }
  }, [playbackState, zoomLevel]);

  // Reset user scroll flag on play start
  useEffect(() => {
    if (playbackState.isPlaying) {
      userHasScrolled.current = false;
    }
  }, [playbackState.isPlaying]);

  // Show loading screen during separation processing
  const isProcessing = separationStage === 'uploading' || separationStage === 'queued' || separationStage === 'processing';

  if (isProcessing) {
    const statusMessages: Record<string, string> = {
      uploading: 'Uploading audio file...',
      queued: 'Queued for processing...',
      processing: 'Separating audio stems...',
    };

    return (
      <>
        <LoadingScreen
          artist="Processing"
          trackName="Audio Separation"
          progress={separationProgress}
          status={statusMessages[separationStage] || 'Processing...'}
        />
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            variant={toastMessage.variant}
            onClose={() => setToastMessage(null)}
          />
        )}
      </>
    );
  }

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
          <FileUpload
            onFileSelect={handleFileSelectWithFallback}
            capabilities={capabilities}
            recommendedQuality={recommendedQuality}
            disabled={isProcessing}
          />
        </div>
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            variant={toastMessage.variant}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    );
  }

  // Show Intro Screen if active
  if (showIntro) {
    return (
      <SongIntro
        audioFile={audioFile}
        onStart={() => setShowIntro(false)}
      />
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

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}

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
                onScroll={handleGlobalScroll}
                onInteract={handleUserInteract}
                setScrollRef={registerScrollRef}
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
                  anySolo={stems.some((s) => s.isSolo)}
                  currentTime={playbackState.currentTime}
                  duration={playbackState.duration}
                  onToggleMute={handleToggleMute}
                  onToggleSolo={handleToggleSolo}
                  onVolumeChange={handleVolumeChange}
                  onPanChange={handlePanChange}
                  onSeek={handleSeek}
                  zoom={zoomLevel}
                  onScroll={handleGlobalScroll}
                  onInteract={handleUserInteract}
                  setScrollRef={registerScrollRef}
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
