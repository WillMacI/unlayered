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

    // Draw waveform with gradient fill
    const barWidth = rect.width / waveformData.length;
    const halfHeight = rect.height / 2;

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * halfHeight * 0.9;

      // Determine color based on playback position
      const progress = currentTime / duration;
      const isPlayed = index / waveformData.length < progress;

      // Create gradient for depth (Adobe Audition style)
      const gradientTop = ctx.createLinearGradient(0, halfHeight - barHeight, 0, halfHeight);
      const gradientBottom = ctx.createLinearGradient(0, halfHeight, 0, halfHeight + barHeight);

      if (isPlayed) {
        // Played section: full color with gradient
        gradientTop.addColorStop(0, color + 'CC'); // 80% opacity
        gradientTop.addColorStop(1, color + '33'); // 20% opacity
        gradientBottom.addColorStop(0, color + '33');
        gradientBottom.addColorStop(1, color + 'CC');
      } else {
        // Unplayed section: dimmed with gradient
        gradientTop.addColorStop(0, color + '66'); // 40% opacity
        gradientTop.addColorStop(1, color + '1A'); // 10% opacity
        gradientBottom.addColorStop(0, color + '1A');
        gradientBottom.addColorStop(1, color + '66');
      }

      // Draw top half with gradient
      ctx.fillStyle = gradientTop;
      ctx.fillRect(x, halfHeight - barHeight, barWidth - 0.5, barHeight);

      // Draw bottom half (mirror) with gradient
      ctx.fillStyle = gradientBottom;
      ctx.fillRect(x, halfHeight, barWidth - 0.5, barHeight);

      // Add subtle glow on peaks (1-2px blur)
      if (value > 0.7 && isPlayed) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = color;
        ctx.fillRect(x, halfHeight - barHeight, barWidth - 0.5, barHeight);
        ctx.fillRect(x, halfHeight, barWidth - 0.5, barHeight);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    });

    // Draw professional playhead cursor (red)
    const playheadX = (currentTime / duration) * rect.width;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, rect.height);
    ctx.stroke();
    ctx.shadowBlur = 0;

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

  // Generate timeline markers
  const generateTimelineMarkers = () => {
    const markers = [];
    const interval = 30; // 30 second intervals
    for (let i = 0; i <= duration; i += interval) {
      const minutes = Math.floor(i / 60);
      const seconds = Math.floor(i % 60);
      const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const position = (i / duration) * 100;
      markers.push({ time: i, label, position });
    }
    return markers;
  };

  const timelineMarkers = generateTimelineMarkers();

  return (
    <div ref={containerRef} className="relative group">
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
        <div className="absolute left-2 top-2 px-2 py-1 rounded text-[11px] font-medium z-10"
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
        className={`w-full waveform-enter ${onSeek ? 'cursor-pointer hover:opacity-90' : ''}`}
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
