import { Play, Pause, Repeat, ZoomIn, ZoomOut, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { AudioFile, PlaybackState } from '../types/audio';
import { formatTime } from '../utils/formatTime';

interface PlaybackHeaderProps {
  audioFile: AudioFile | null;
  playbackState: PlaybackState;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

export const PlaybackHeader = ({
  onPlayPause,
  onToggleSidebar,
  onZoomIn,
  onZoomOut,
  zoomLevel,
  showSidebar,
  audioFile,
  playbackState,
}: PlaybackHeaderProps) => {
  return (
    <div className="h-20 flex-shrink-0 px-8 flex items-center justify-between z-30 relative"
      style={{
        backgroundColor: 'rgba(28, 28, 30, 0.8)', // Semi-transparent Apple Dark
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* Left: Branding */}
      <div className="flex flex-col justify-center w-1/3 truncate">
        <h1 className="text-lg font-bold text-white tracking-tight leading-none">
          Unlayered Studio
        </h1>
        {audioFile && (
          <span className="text-xs text-neutral-400 font-medium truncate opacity-80 mt-0.5">
            {audioFile.name.replace(/\.[^/.]+$/, "")}
          </span>
        )}
      </div>

      {/* Center: Playback Controls (Apple Style) */}
      <div className="flex flex-col items-center justify-center gap-1 w-1/3">
        <div className="flex items-center gap-6">
          <button
            onClick={onPlayPause}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            aria-label={playbackState.isPlaying ? 'Pause' : 'Play'}
            title={playbackState.isPlaying ? 'Pause' : 'Play'}
          >
            {playbackState.isPlaying ? (
              <Pause className="w-5 h-5 text-black fill-current" />
            ) : (
              <Play className="w-5 h-5 text-black fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Right: Tools & Time */}
      <div className="flex items-center justify-end gap-4 w-1/3">
        {/* Zoom Controls (Pill shape) */}
        <div className="flex items-center bg-white/10 rounded-lg p-0.5">
          <button
            onClick={onZoomOut}
            disabled={zoomLevel <= 1}
            className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-neutral-300" />
          </button>
          <span className="text-[10px] font-medium w-10 text-center text-neutral-400 select-none">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={zoomLevel >= 10}
            className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Time Display */}
        <div className="text-xs font-medium tabular-nums text-neutral-400 tracking-tight">
          <span className="text-white">{formatTime(playbackState.currentTime)}</span>
          <span className="mx-1 opacity-50">/</span>
          <span>{formatTime(playbackState.duration)}</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-neutral-400 hover:text-white'}`}
          title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          aria-label={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        >
          {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        <button
          className="p-2 rounded-lg transition-colors text-neutral-600 cursor-not-allowed"
          disabled
          aria-disabled="true"
          title="Repeat not available yet"
          aria-label="Repeat (not available)"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
