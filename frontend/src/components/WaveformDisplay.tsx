import { useEffect, useRef, useState, useMemo, type MouseEvent } from 'react';
import type { WaveformPeak, SongSection } from '../types/audio';
import { StructureMarkers } from './StructureMarkers';

export interface WaveformDisplayProps {
  waveformData: number[] | { left: number[], right: number[] };
  currentTime: number;
  duration: number;
  peaks: WaveformPeak[];
  color: string;
  label: string;
  onSeek?: (time: number) => void;
  height?: number;
  isCombined?: boolean;
  zoom?: number;
  sections?: SongSection[];
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onInteract?: () => void;
  setScrollRef?: (ref: HTMLDivElement | null) => void;
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
  zoom = 1,
  onScroll,
  onInteract,
  setScrollRef,
}: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [flashingPeak, setFlashingPeak] = useState<number | null>(null);

  // Check if we're near a peak and flash
  useEffect(() => {
    if (!peaks) return;
    const nearbyPeak = peaks.find(
      (peak) => Math.abs(peak.time - currentTime) < 0.5
    );
    if (nearbyPeak) {
      const rafId = requestAnimationFrame(() => {
        setFlashingPeak(nearbyPeak.time);
      });
      const timer = setTimeout(() => setFlashingPeak(null), 300);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timer);
      };
    }
  }, [currentTime, peaks]);

  // Handle auto-scroll when playing
  useEffect(() => {
    if (scrollContainerRef.current && isCombined && zoom > 1) {
      const scrollContainer = scrollContainerRef.current;
      const progress = currentTime / duration;
      const scrollLeft = (scrollContainer.scrollWidth * progress) - (scrollContainer.clientWidth / 2);

      // Only scroll if we aren't manually interacting (simple check)
      // For now, just centering the playhead
      if (Math.abs(scrollContainer.scrollLeft - scrollLeft) > 100) {
        // scrollContainer.scrollLeft = scrollLeft; // Too jittery for now, disabled auto-scroll
      }
    }
  }, [currentTime, duration, isCombined, zoom]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set actual canvas size (resolution)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw waveform with gradient fill - using Path for high resolution
    const totalPoints = Array.isArray(waveformData) ? waveformData.length : waveformData.left.length;
    if (totalPoints === 0) return;
    const pointWidth = rect.width / totalPoints;
    const halfHeight = rect.height / 2;

    const drawChannelPath = (data: number[], isTop: boolean) => {
      const path = new Path2D();
      path.moveTo(0, halfHeight);

      for (let i = 0; i < data.length; i++) {
        const x = i * pointWidth;
        const val = data[i];
        // Ensure strictly positive height for visibility
        const height = Math.max(1, val * halfHeight * 0.95);
        const y = isTop
          ? halfHeight - height
          : halfHeight + height;
        path.lineTo(x, y);
      }

      path.lineTo(rect.width, halfHeight);
      path.closePath();

      // 1. Draw Unplayed (Background) state - Dimmed
      ctx.save();
      const gradientUnplayed = ctx.createLinearGradient(0, isTop ? 0 : halfHeight, 0, isTop ? halfHeight : rect.height);
      gradientUnplayed.addColorStop(0, color + '66'); // 40%
      gradientUnplayed.addColorStop(1, color + '1A'); // 10%
      ctx.fillStyle = gradientUnplayed;
      ctx.fill(path);
      ctx.restore();

      // 2. Draw Played (Foreground) state - Bright & Clipped
      ctx.save();
      const progressX = duration > 0 ? (currentTime / duration) * rect.width : 0;

      // Create clip region for played part
      ctx.beginPath();
      ctx.rect(0, 0, progressX, rect.height);
      ctx.clip();

      const gradientPlayed = ctx.createLinearGradient(0, isTop ? 0 : halfHeight, 0, isTop ? halfHeight : rect.height);
      gradientPlayed.addColorStop(0, color + 'FF'); // 100%
      gradientPlayed.addColorStop(1, color + '66'); // 40%
      ctx.fillStyle = gradientPlayed;
      ctx.fill(path); // Fill the SAME path again

      // Add heavy glow to played part for "neon" look
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.6;
      ctx.fill(path);

      ctx.restore();
    };

    if (Array.isArray(waveformData)) {
      // Mono rendering (mirrored)
      drawChannelPath(waveformData, true);
      drawChannelPath(waveformData, false);
    } else {
      // Stereo rendering
      drawChannelPath(waveformData.left, true);
      drawChannelPath(waveformData.right, false);
    }

    // Draw professional playhead cursor (red)
    const playheadX = duration > 0 ? (currentTime / duration) * rect.width : 0;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, rect.height);
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [waveformData, currentTime, duration, color, zoom]);

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * duration;

    onSeek(time);
  };

  // Generate timeline markers
  const timelineMarkers = useMemo(() => {
    const markers = [];
    if (duration <= 0) return markers;
    const interval = 30; // 30 second intervals
    for (let i = 0; i <= duration; i += interval) {
      const minutes = Math.floor(i / 60);
      const seconds = Math.floor(i % 60);
      const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const position = (i / duration) * 100;
      markers.push({ time: i, label, position });
    }
    return markers;
  }, [duration]);

  return (
    <div
      ref={(el) => {
        scrollContainerRef.current = el;
        if (setScrollRef) setScrollRef(el);
      }}
      onScroll={onScroll}
      onMouseDown={onInteract}
      className={`relative group ${zoom > 1 ? 'overflow-x-auto' : 'overflow-hidden'}`}
      style={{ width: '100%' }}
    >
      <div
        className="relative"
        style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
      >
        {/* Timeline Ruler (for combined waveform only) */}
        {isCombined && (
          <div className="absolute top-0 left-0 right-0 h-6 flex items-end px-2 pointer-events-none z-20">
            {timelineMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="absolute flex flex-col items-center"
                style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-[9px] font-mono-time" style={{ color: '#606265' }}>
                  {marker.label}
                </span>
                <div className="w-px h-1.5 bg-gray-600/50" />
              </div>
            ))}
          </div>
        )}

        {/* Label */}
        {label && (
          <div className="absolute left-2 top-2 px-2 py-1 rounded text-[11px] font-medium z-10 sticky left-2"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {label}
          </div>
        )}

        {/* Flash indicator */}
        {flashingPeak !== null && (
          <div className="absolute inset-0 bg-[#D4AF37]/20 animate-pulse pointer-events-none" />
        )}

        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full waveform-enter ${onSeek ? 'cursor-pointer hover:opacity-90' : ''}`}
          style={{ height: `${height}px`, backgroundColor: 'rgba(0,0,0,0.2)', transition: 'opacity 150ms ease-in-out' }}
          onClick={handleCanvasClick}
        />

        {/* Structure Markers */}
        {sections && sections.length > 0 && (
          <StructureMarkers
            sections={sections}
            duration={duration}
            currentTime={currentTime}
            onSectionClick={(section) => onSeek?.(section.startTime)}
          />
        )}

        {/* Hover instruction */}
        {onSeek && (
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none sticky left-0 right-0">
            <span className="text-sm text-white sticky left-1/2 -translate-x-1/2">Click to traverse song</span>
          </div>
        )}
      </div>
    </div>
  );
};
