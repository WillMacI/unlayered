import { Volume2, VolumeX } from 'lucide-react';
import type { Stem } from '../types/audio';
import { WaveformDisplay } from './WaveformDisplay';

interface StemTrackProps {
  stem: Stem;
  currentTime: number;
  duration: number;
  onToggleMute: (stemId: string) => void;
  onToggleSolo: (stemId: string) => void;
  onVolumeChange: (stemId: string, volume: number) => void;
  onPanChange: (stemId: string, pan: number) => void;

  onSeek: (time: number) => void;
  zoom?: number;
}

export const StemTrack = ({
  stem,
  currentTime,
  duration,
  onToggleMute,
  onToggleSolo,
  onVolumeChange,
  onPanChange,

  onSeek,
  zoom = 1,
}: StemTrackProps) => {
  const formatPan = (value: number) => {
    if (value === 0) return 'C';
    return value > 0
      ? `R${Math.abs(Math.round(value * 100))}`
      : `L${Math.abs(Math.round(value * 100))}`;
  };

  return (
    <div
      className={`relative group px-5 py-4 flex items-center gap-6 transition-colors duration-200 border-b ${stem.isMuted || !stem.hasAudio ? 'opacity-50 grayscale' : ''}`}
      style={{
        backgroundColor: stem.isSolo ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
        borderColor: 'var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-4 w-[180px] flex-shrink-0">
        <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center shadow-inner">
          <span className="text-sm font-bold" style={{ color: stem.color }}>{stem.label.charAt(0)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-medium text-white tracking-tight">{stem.label}</span>
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={() => onToggleMute(stem.id)}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${stem.isMuted ? 'bg-neutral-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              {stem.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onToggleSolo(stem.id)}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${stem.isSolo ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              S
            </button>
          </div>
        </div>
      </div>

      {/* 2. Waveform (Center - Flex Grow) */}
      <div className="flex-1 min-w-0 relative h-20 flex items-center">
        <WaveformDisplay
          waveformData={stem.waveformData}
          currentTime={currentTime}
          duration={duration}
          peaks={[]}
          color={stem.color}
          label=""
          onSeek={onSeek}
          height={80} // Increased height for larger tracks
          zoom={zoom}
        />
      </div>

      {/* 3. Controls (Right) */}
      <div className="flex items-center gap-6 w-[200px] flex-shrink-0 justify-end">
        {/* Volume */}
        <div className="flex flex-col w-24 gap-1">
          <div className="flex justify-between items-end">
            <span className="text-[9px] text-neutral-500 font-medium">VOL</span>
            <span className="text-[9px] text-neutral-400 font-mono-time">{Math.round(stem.volume * 100)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={stem.volume}
            onChange={(e) => onVolumeChange(stem.id, parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-700 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
            style={{
              background: `linear-gradient(to right, #D4AF37 ${stem.volume * 100}%, #333 ${stem.volume * 100}%)`
            }}
          />
        </div>

        {/* Pan */}
        <div className="flex flex-col w-16 gap-1">
          <div className="flex justify-between items-end">
            <span className="text-[9px] text-neutral-500 font-medium">PAN</span>
            <span className="text-[9px] text-neutral-400 font-mono-time">{formatPan(stem.pan)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={stem.pan}
            onChange={(e) => onPanChange(stem.id, parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-700 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>
    </div>
  );
};
