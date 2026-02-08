import { useState, type UIEvent } from 'react';
import { Volume2, VolumeX, Mic2, Music2, Guitar, Drum } from 'lucide-react';
import type { Stem } from '../types/audio';
import { WaveformDisplay } from './WaveformDisplay';
import type { WaveformDisplayProps } from './WaveformDisplay';
import { LyricsOverlay } from './LyricsOverlay';

interface StemTrackProps {
  stem: Stem;
  anySolo: boolean;
  currentTime: number;
  duration: number;
  onLyricClick?: (payload: { index: number; line: string; prevLine?: string | null; nextLine?: string | null }) => void;
  onToggleMute: (stemId: string) => void;
  onToggleSolo: (stemId: string) => void;
  onVolumeChange: (stemId: string, volume: number) => void;
  onPanChange: (stemId: string, pan: number) => void;

  onSeek?: (time: number) => void;
  zoom?: number;
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
  onInteract?: () => void;
  setScrollRef?: (ref: HTMLDivElement | null) => void;
}

const getStemIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('vocal')) return Mic2;
  if (l.includes('drum')) return Drum;
  if (l.includes('bass')) return Guitar; // Using guitar for bass as closest approx
  if (l.includes('other')) return Music2;
  return Music2;
};

const getWaveformDataForView = (
  data: WaveformDisplayProps['waveformData'],
  viewMode: 'mono' | 'stereo'
): WaveformDisplayProps['waveformData'] => {
  if (viewMode === 'stereo') {
    if (Array.isArray(data)) {
      return data;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return data.left;
};

export const StemTrack = ({
  stem,
  anySolo,
  currentTime,
  duration,
  onLyricClick,
  onToggleMute,
  onToggleSolo,
  onVolumeChange,
  onPanChange,

  onSeek,
  zoom = 1,
  onScroll,
  onInteract,
  setScrollRef
}: StemTrackProps) => {
  /* Tooltip logic removed for cleaner UI */
  const [viewMode, setViewMode] = useState<'mono' | 'stereo'>('mono');
  const effectiveMuted = stem.isMuted || (anySolo && !stem.isSolo);

  const formatPan = (value: number) => {
    if (value === 0) return 'C';
    return value > 0
      ? `R${Math.abs(Math.round(value * 100))}`
      : `L${Math.abs(Math.round(value * 100))}`;
  };

  return (
    <div
      className={`relative group px-5 py-4 flex items-center gap-6 transition-colors duration-200 border-b ${effectiveMuted || !stem.hasAudio ? 'opacity-50 grayscale' : ''}`}
      style={{
        backgroundColor: stem.isSolo ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
        borderColor: 'var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-4 w-[180px] flex-shrink-0">
        <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center shadow-inner">
          {(() => {
            const Icon = getStemIcon(stem.label);
            return <Icon className="w-5 h-5" style={{ color: stem.color }} />;
          })()}
        </div>
        <div className="flex flex-col">
          <span className="text-base font-medium text-white tracking-tight">{stem.label}</span>
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={() => onToggleMute(stem.id)}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${effectiveMuted ? 'bg-neutral-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
              title="Mute"
              aria-label={effectiveMuted ? 'Unmute stem' : 'Mute stem'}
            >
              {effectiveMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onToggleSolo(stem.id)}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${stem.isSolo ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
              title="Solo"
              aria-label={stem.isSolo ? 'Disable solo' : 'Solo stem'}
            >
              S
            </button>
            <button
              onClick={() => setViewMode(prev => prev === 'mono' ? 'stereo' : 'mono')}
              className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-colors ${viewMode === 'stereo' ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
              title="Toggle Mono/Stereo View"
              aria-label={viewMode === 'stereo' ? 'Switch to mono view' : 'Switch to stereo view'}
            >
              {viewMode === 'stereo' ? 'LR' : 'M'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Waveform (Center - Flex Grow) */}
      <div className="flex-1 min-w-0 relative h-20 flex items-center">
        {stem.lyrics && (
          <LyricsOverlay
            lyrics={stem.lyrics}
            currentTime={currentTime}
            onLineClick={onLyricClick}
          />
        )}
        <WaveformDisplay
          waveformData={getWaveformDataForView(stem.waveformData || [], viewMode)}
          currentTime={currentTime}
          duration={duration}
          peaks={[]}
          color={stem.color}
          label=""
          onSeek={onSeek}
          height={96}
          onScroll={onScroll}
          onInteract={onInteract}
          setScrollRef={setScrollRef}
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
