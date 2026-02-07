import { Volume2, VolumeX, Lock } from 'lucide-react';
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
}: StemTrackProps) => {
  return (
    <div
      className={`border border-slate-700 rounded-lg overflow-hidden transition-all duration-300 ${
        stem.isMuted || !stem.hasAudio ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 p-3 bg-slate-800/50">
        {/* Stem Label */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stem.color }}
          />
          <span className="font-medium text-white">{stem.label}</span>
          {stem.isLocked && (
            <Lock className="w-3 h-3 text-slate-500" />
          )}
        </div>

        {/* Mute Button */}
        <button
          onClick={() => onToggleMute(stem.id)}
          className={`px-3 py-1.5 rounded transition-colors text-xs font-semibold ${
            stem.isMuted
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Mute"
        >
          {stem.isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Solo Button */}
        <button
          onClick={() => onToggleSolo(stem.id)}
          className={`px-3 py-1.5 rounded transition-colors text-xs font-semibold ${
            stem.isSolo
              ? 'bg-yellow-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Solo"
        >
          S
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <span className="text-xs text-slate-400 w-12">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={stem.volume}
            onChange={(e) => onVolumeChange(stem.id, parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={stem.isMuted}
          />
          <span className="text-xs text-slate-400 w-8 text-right">
            {Math.round(stem.volume * 100)}
          </span>
        </div>

        {/* Pan Control */}
        <div className="flex items-center gap-2 max-w-[180px]">
          <span className="text-xs text-slate-400 w-12">Pan</span>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={stem.pan}
            onChange={(e) => onPanChange(stem.id, parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <span className="text-xs text-slate-400 w-8 text-right">
            {stem.pan === 0 ? 'C' : stem.pan > 0 ? `R${Math.abs(Math.round(stem.pan * 10))}` : `L${Math.abs(Math.round(stem.pan * 10))}`}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <WaveformDisplay
        waveformData={stem.waveformData}
        currentTime={currentTime}
        duration={duration}
        peaks={[]}
        color={stem.color}
        label=""
        onSeek={onSeek}
        height={60}
      />
    </div>
  );
};
