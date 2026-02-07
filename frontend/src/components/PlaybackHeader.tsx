import { Play, Pause, SkipBack, SkipForward, Square, Repeat } from 'lucide-react';
import type { AudioFile, PlaybackState } from '../types/audio';
import { formatTime } from '../utils/formatTime';

interface PlaybackHeaderProps {
  audioFile: AudioFile | null;
  playbackState: PlaybackState;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const PlaybackHeader = ({
  audioFile,
  playbackState,
  onPlayPause,
  onPrevious,
  onNext,
}: PlaybackHeaderProps) => {
  const handleStop = () => {
    // Stop and return to beginning (will be implemented)
    console.log('Stop clicked');
  };

  const handleLoop = () => {
    // Toggle loop mode (will be implemented)
    console.log('Loop clicked');
  };

  return (
    <div
      className="border-b px-6 py-3 flex items-center justify-between"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrevious}
          className="p-2 rounded hover:bg-black/30 transition-all duration-150 hover:scale-105"
          style={{ color: 'var(--text-secondary)' }}
          title="Previous Section"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handleStop}
          className="p-2 rounded hover:bg-black/30 transition-all duration-150 hover:scale-105"
          style={{ color: 'var(--text-secondary)' }}
          title="Stop (Return to Start)"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 rounded-md shadow-pro hover:shadow-pro-lg transition-all duration-150 hover:scale-105"
          style={{
            backgroundColor: 'var(--accent-gold)',
            color: '#000',
          }}
          title={playbackState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {playbackState.isPlaying ? (
            <Pause className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5" fill="currentColor" />
          )}
        </button>

        <button
          onClick={handleLoop}
          className="p-2 rounded hover:bg-black/30 transition-all duration-150 hover:scale-105"
          style={{ color: 'var(--text-secondary)' }}
          title="Toggle Loop"
        >
          <Repeat className="w-4 h-4" />
        </button>

        <button
          onClick={onNext}
          className="p-2 rounded hover:bg-black/30 transition-all duration-150 hover:scale-105"
          style={{ color: 'var(--text-secondary)' }}
          title="Next Section"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Song Info */}
      <div className="flex-1 text-center px-8">
        {audioFile ? (
          <div>
            <h2
              className="text-sm font-semibold tracking-wide"
              style={{
                color: 'var(--text-primary)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {audioFile.name}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {audioFile.artist}
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No audio file loaded
          </p>
        )}
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2">
        <div
          className="px-4 py-2 rounded-md font-mono-time text-sm font-semibold shadow-pro"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'var(--accent-gold)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {formatTime(playbackState.currentTime)}
        </div>
        <span className="text-[11px] font-mono-time" style={{ color: 'var(--text-tertiary)' }}>
          /
        </span>
        <div
          className="px-4 py-2 rounded-md font-mono-time text-sm font-medium"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: 'var(--text-secondary)',
          }}
        >
          {formatTime(playbackState.duration)}
        </div>
      </div>
    </div>
  );
};
