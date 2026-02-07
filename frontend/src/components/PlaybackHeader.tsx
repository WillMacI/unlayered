import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
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
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Previous"
        >
          <SkipBack className="w-5 h-5 text-slate-300" />
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title={playbackState.isPlaying ? 'Pause' : 'Play'}
        >
          {playbackState.isPlaying ? (
            <Pause className="w-6 h-6 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 text-white" fill="white" />
          )}
        </button>

        <button
          onClick={onNext}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Next"
        >
          <SkipForward className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Song Info */}
      <div className="flex-1 text-center px-8">
        {audioFile ? (
          <div>
            <h2 className="text-lg font-semibold text-white">
              {audioFile.name}
            </h2>
            <p className="text-sm text-slate-400">{audioFile.artist}</p>
          </div>
        ) : (
          <p className="text-slate-500">No audio file loaded</p>
        )}
      </div>

      {/* Time Display */}
      <div className="bg-green-500 text-slate-900 px-4 py-2 rounded-lg font-mono font-bold text-lg min-w-[120px] text-center">
        {formatTime(playbackState.currentTime)}
      </div>
    </div>
  );
};
