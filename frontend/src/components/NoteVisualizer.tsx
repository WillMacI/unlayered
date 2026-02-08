import React, { useEffect, useRef, useState } from 'react';
import type { NoteEvent } from '../types/audio';

interface NoteVisualizerProps {
    notes: NoteEvent[];
    currentTime: number;
    duration: number;
    height: number;
    color?: string;
    className?: string;
}

const NoteVisualizer: React.FC<NoteVisualizerProps> = ({
    notes,
    currentTime,
    duration,
    height,
    color = '#4CAF50',
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Normalize coordinate system to use css pixels
        ctx.scale(dpr, dpr);

        // Set visible size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!notes || notes.length === 0 || duration <= 0) return;

        // --- 1. Draw Background & Grid ---
        // Fill background with a dark color for contrast
        ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        ctx.fillRect(0, 0, width, height);

        // Find pitch range to normalize y-axis
        // Default range if no notes (e.g. C2 to C6)
        let minPitch = 36;
        let maxPitch = 84;

        if (notes.length > 0) {
            const pitches = notes.map(n => n.pitch);
            minPitch = Math.min(...pitches) - 2;
            maxPitch = Math.max(...pitches) + 2;
        }

        const pitchRange = maxPitch - minPitch || 1;
        const noteHeight = height / pitchRange;

        // Draw horizontal grid lines for pitches
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= pitchRange; i++) {
            const y = height - (i * noteHeight);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // --- 2. Draw Notes ---
        notes.forEach(note => {
            // X position based on time
            const x = (note.start_time / duration) * width;
            const w = ((note.end_time - note.start_time) / duration) * width;

            // Y position based on pitch (higher pitch = higher y, so lower canvas coord)
            // Normalize pitch to 0-1 range, then flip for canvas coords
            const normalizedPitch = (note.pitch - minPitch) / pitchRange;
            const y = height - (normalizedPitch * height) - noteHeight;

            // Check if note is currently playing
            const isPlaying = currentTime >= note.start_time && currentTime <= note.end_time;

            // Draw rounded rectangle
            ctx.beginPath();
            ctx.fillStyle = isPlaying ? '#ffffff' : color; // Highlight playing notes

            // Ensure minimum width of 1px for visibility
            const drawW = Math.max(w, 2); // Minimum 2px width
            const drawH = Math.max(noteHeight - 1, 2); // Subtle spacing between rows

            // Safe fallback for environments where roundRect is not available
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x, y + 0.5, drawW, drawH, 2);
            } else {
                ctx.rect(x, y + 0.5, drawW, drawH);
            }
            ctx.fill();

            // Optional: Draw outline for better definition
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.stroke();
        });

        // --- 3. Draw Playhead ---
        const playheadX = (currentTime / duration) * width;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

    }, [notes, currentTime, duration, width, height, color]);

    return (
        <div ref={containerRef} className={`w-full h-full ${className}`}>
            <canvas
                ref={canvasRef}
            />
        </div>
    );
};

export default NoteVisualizer;
