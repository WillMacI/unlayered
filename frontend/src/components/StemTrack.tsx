import { useState } from 'react';
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
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [showPanTooltip, setShowPanTooltip] = useState(false);

  const formatVolume = (value: number) => {
    if (value === 0) return '-∞ dB';
    const db = 20 * Math.log10(value);
    return db >= 0 ? `+${db.toFixed(1)} dB` : `${db.toFixed(1)} dB`;
  };

  const formatPan = (value: number) => {
    if (value === 0) return 'C';
    return value > 0
      ? `R${Math.abs(Math.round(value * 100))}`
      : `L${Math.abs(Math.round(value * 100))}`;
  };

  return (
    <div
      className={`relative rounded-md overflow-hidden group hover:shadow-pro ${stem.isMuted || !stem.hasAudio ? 'opacity-60' : ''
        }`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        transition: 'all var(--transition-medium)',
      }}
    >
      {/* Gold accent line on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-150 group-hover:opacity-100"
        style={{
          backgroundColor: 'var(--accent-gold)',
          opacity: stem.isSolo || stem.isLocked ? 1 : 0, // Only show if significant
        }}
      />

      <div className="flex items-center gap-3 px-4 py-2.5 pl-5">
        {/* Stem Label */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <div
            className="w-2 h-2 rounded-full shadow-sm"
            style={{ backgroundColor: stem.color, boxShadow: `0 0 4px ${stem.color}60` }}
          />
          <span
            className="text-[11px] font-medium tracking-wide"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {stem.label}
          </span>
          {stem.isLocked && (
            <Lock className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
          )}
        </div>

        {/* Mute Button */}
        <button
          onClick={() => onToggleMute(stem.id)}
          className={`p-1.5 rounded transition-all duration-150 ${stem.isMuted
            ? 'bg-neutral-700 text-white shadow-pro'
            : 'bg-transparent hover:bg-neutral-800'
            } hover:scale-105`}
          style={{
            color: stem.isMuted ? '#fff' : 'var(--text-secondary)',
            border: stem.isMuted ? '1px solid transparent' : '1px solid var(--border-subtle)',
          }}
          title="Mute (M)"
        >
          {stem.isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Solo Button */}
        <button
          onClick={() => onToggleSolo(stem.id)}
          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all duration-150 ${stem.isSolo
            ? 'bg-[#D4AF37] text-black shadow-pro'
            : 'bg-transparent hover:bg-neutral-800'
            } hover:scale-105`}
          style={{
            color: stem.isSolo ? '#000' : 'var(--text-secondary)',
            border: stem.isSolo ? 'none' : '1px solid var(--border-subtle)',
          }}
          title="Solo (S)"
        >
          S
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[180px] relative">
          <span className="text-[10px] font-medium w-8" style={{ color: 'var(--text-tertiary)' }}>
            VOL
          </span>
          <div className="relative flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={stem.volume}
              onChange={(e) => onVolumeChange(stem.id, parseFloat(e.target.value))}
              onMouseEnter={() => setShowVolumeTooltip(true)}
              onMouseLeave={() => setShowVolumeTooltip(false)}
              className="w-full h-1 appearance-none cursor-pointer rounded-full transition-all duration-150"
              style={{
                background: `linear-gradient(to right,
                  #D4AF37 0%,
                  #D4AF37 ${stem.volume * 100}%,
                  rgba(255,255,255,0.1) ${stem.volume * 100}%,
                  rgba(255,255,255,0.1) 100%)`,
                opacity: stem.isMuted ? 0.4 : 1,
              }}
              disabled={stem.isMuted}
            />
            {/* Volume tooltip */}
            {showVolumeTooltip && (
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[9px] font-mono-time whitespace-nowrap shadow-pro-lg z-50"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  color: 'var(--text-primary)',
                }}
              >
                {formatVolume(stem.volume)}
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono-time w-6 text-right" style={{ color: 'var(--text-tertiary)' }}>
            {Math.round(stem.volume * 100)}
          </span>
        </div>

        {/* Pan Control */}
        <div className="flex items-center gap-2 max-w-[150px] relative">
          <span className="text-[10px] font-medium w-8" style={{ color: 'var(--text-tertiary)' }}>
            PAN
          </span>
          <div className="relative flex-1">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={stem.pan}
              onChange={(e) => onPanChange(stem.id, parseFloat(e.target.value))}
              onMouseEnter={() => setShowPanTooltip(true)}
              onMouseLeave={() => setShowPanTooltip(false)}
              className="w-full h-1 appearance-none cursor-pointer rounded-full"
              style={{
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.1) 0%,
                  #D4AF37 50%,
                  rgba(255,255,255,0.1) 100%)`,
              }}
            />
            {/* Center tick mark */}
            <div
              className="absolute top-1/2 left-1/2 w-px h-2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
            />
            {/* Pan tooltip */}
            {showPanTooltip && (
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[9px] font-mono-time whitespace-nowrap shadow-pro-lg z-50"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  color: 'var(--text-primary)',
                }}
              >
                {formatPan(stem.pan)}
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono-time w-8 text-right" style={{ color: 'var(--text-tertiary)' }}>
            {formatPan(stem.pan)}
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
