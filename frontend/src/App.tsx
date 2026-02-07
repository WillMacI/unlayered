import { useState, useEffect, useMemo } from 'react';
import { PlaybackHeader } from './components/PlaybackHeader';
import { WaveformDisplay } from './components/WaveformDisplay';
import { StemTrack } from './components/StemTrack';
import { AIInsights } from './components/AIInsights';
import { FileUpload } from './components/FileUpload';
import type { AudioFile, Stem, PlaybackState } from './types/audio';
import {
  mockAudioFile,
  mockStems,
  mockAIInsight,
  mockCombinedWaveform,
  mockPeaks,
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

  // Simulate playback
  useEffect(() => {
    if (!playbackState.isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackState((prev) => {
        if (prev.currentTime >= prev.duration) {
          return { ...prev, isPlaying: false, currentTime: 0 };
        }
        return { ...prev, currentTime: prev.currentTime + 0.1 };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playbackState.isPlaying]);

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
    setPlaybackState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSeek = (time: number) => {
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
  };

  const handleToggleMute = (stemId: string) => {
    setStems((prev) =>
      prev.map((stem) =>
        stem.id === stemId ? { ...stem, isMuted: !stem.isMuted } : stem
      )
    );
  };

  const handleToggleSolo = (stemId: string) => {
    setStems((prev) => {
      const clickedStem = prev.find((s) => s.id === stemId);
      if (!clickedStem) return prev;

      // If toggling solo off
      if (clickedStem.isSolo) {
        return prev.map((stem) => ({ ...stem, isSolo: false }));
      }

      // Toggle solo on
      return prev.map((stem) => ({
        ...stem,
        isSolo: stem.id === stemId,
      }));
    });
  };

  const handleVolumeChange = (stemId: string, volume: number) => {
    setStems((prev) =>
      prev.map((stem) =>
        stem.id === stemId ? { ...stem, volume } : stem
      )
    );
  };

  const handlePanChange = (stemId: string, pan: number) => {
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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <PlaybackHeader
        audioFile={audioFile}
        playbackState={playbackState}
        onPlayPause={handlePlayPause}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Left: Waveforms */}
        <div className="flex-1 space-y-4">
          {/* Combined Waveform */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Combined / Stereo Mix
                </h3>
                <span className="text-xs text-slate-500">
                  Both mixes in one waveform
                </span>
              </div>
            </div>
            <WaveformDisplay
              waveformData={mockCombinedWaveform}
              currentTime={playbackState.currentTime}
              duration={playbackState.duration}
              peaks={mockPeaks}
              color="#06b6d4"
              label=""
              onSeek={handleSeek}
              height={100}
              isCombined
            />
            <div className="px-4 py-2 bg-slate-800/50 text-center text-xs text-slate-500">
              Click to traverse song
            </div>
          </div>

          {/* Individual Stems */}
          <div className="space-y-3">
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
              />
            ))}
          </div>

          {/* Info Note */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 text-center">
              <span className="font-semibold text-slate-300">Note:</span> Tracks
              are locked and automatically reorder based on audio presence,
              volume, and mute state. Muted or silent tracks move to the bottom.
            </p>
          </div>
        </div>

        {/* Right: AI Insights */}
        <div className="w-80">
          <AIInsights insight={mockAIInsight} />
        </div>
      </div>
    </div>
  );
}

export default App;
