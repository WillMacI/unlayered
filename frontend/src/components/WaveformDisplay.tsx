import { useEffect, useRef, useState } from 'react';
import type { WaveformPeak, SongSection } from '../types/audio';
import { StructureMarkers } from './StructureMarkers';

interface WaveformDisplayProps {
  waveformData: number[];
  currentTime: number;
  duration: number;
  peaks: WaveformPeak[];
  color: string;
  label: string;
  onSeek?: (time: number) => void;
  height?: number;
  isCombined?: boolean;
  sections?: SongSection[];
}

export const WaveformDisplay = ({
  waveformData,
  currentTime,
  duration,
  peaks,
  color,
  label,
  onSeek,
  height = 80,
  isCombined = false,
  sections,
}: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [flashingPeak, setFlashingPeak] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Check if we're near a peak and flash
  useEffect(() => {
    const nearbyPeak = peaks.find(
      (peak) => Math.abs(peak.time - currentTime) < 0.5
    );
    if (nearbyPeak) {
      setFlashingPeak(nearbyPeak.time);
      const timer = setTimeout(() => setFlashingPeak(null), 300);
      return () => clearTimeout(timer);
    }
  }, [currentTime, peaks]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw waveform
    const barWidth = rect.width / waveformData.length;
    const halfHeight = rect.height / 2;

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * halfHeight * 0.9;

      // Determine color based on playback position
      const progress = currentTime / duration;
      const isPlayed = index / waveformData.length < progress;

      ctx.fillStyle = isPlayed ? color : color + '40';

      // Draw top half
      ctx.fillRect(x, halfHeight - barHeight, barWidth - 0.5, barHeight);
      // Draw bottom half (mirror)
      ctx.fillRect(x, halfHeight, barWidth - 0.5, barHeight);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * rect.width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, rect.height);
    ctx.stroke();

  }, [waveformData, currentTime, duration, color]);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * duration;

    onSeek(time);
  };

  return (
    <div ref={containerRef} className="relative group">
      {/* Label */}
      {label && (
        <div className="absolute left-2 top-2 bg-slate-900/80 px-2 py-1 rounded text-xs font-semibold z-10"
             style={{ color }}>
          {label}
        </div>
      )}

      {/* Flash indicator */}
      {flashingPeak !== null && (
        <div className="absolute inset-0 bg-yellow-500/20 animate-pulse pointer-events-none" />
      )}

      {/* Combined label */}
      {isCombined && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
          Combined
        </div>
      )}

      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full bg-slate-800/50 ${onSeek ? 'cursor-pointer' : ''}`}
        style={{ height: `${height}px` }}
        onClick={handleCanvasClick}
      />

      {/* Structure Markers */}
      {sections && sections.length > 0 && (
        <StructureMarkers
          sections={sections}
          duration={duration}
          currentTime={currentTime}
          onSectionClick={(section) => onSeek?.(section.startTime)}
          containerWidth={containerWidth}
        />
      )}

      {/* Hover instruction */}
      {onSeek && (
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-sm text-white">Click to traverse song</span>
        </div>
      )}
    </div>
  );
};
