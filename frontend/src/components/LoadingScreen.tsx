/**
 * LoadingScreen - Cinematic loading interface during stem separation
 * Displays artist metadata and processing progress
 */

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  artist: string;
  trackName: string;
  bpm?: number;
  timeSignature?: string;
  artistImage?: string;
  albumArtUrl?: string | null;
  status: string;   // "Uploading...", "Analyzing...", etc.
}

export const LoadingScreen = ({
  artist,
  trackName,
  bpm,
  timeSignature,
  artistImage,
  albumArtUrl,
  status,
}: LoadingScreenProps) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Fade in animation on mount
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate gradient placeholder if no album art
  const placeholderGradient = `linear-gradient(135deg,
    hsl(${artist.length * 37 % 360}, 70%, 50%),
    hsl(${artist.length * 73 % 360}, 70%, 40%))`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'
        }`}
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="relative max-w-4xl w-full px-8 flex flex-col md:flex-row items-center gap-12">
        {/* Album Art */}
        <div className="w-64 h-64 md:w-96 md:h-96 rounded-2xl bg-neutral-900 shadow-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
          {albumArtUrl ? (
            <img
              src={albumArtUrl}
              alt={trackName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-6xl font-bold"
              style={{ background: placeholderGradient }}
            >
              {trackName.charAt(0).toUpperCase()}
            </div>
          )}
          {artistImage && (
            <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full border border-white/20 overflow-hidden shadow-lg">
              <img src={artistImage} alt={artist} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-yellow-500/80 tracking-widest uppercase animate-pulse">
              {status}
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
              {trackName}
            </h1>
            <p className="text-lg text-neutral-400 font-light">
              {artist}
            </p>
          </div>

          {/* Metadata */}
          {(bpm || timeSignature) && (
            <div className="flex items-center justify-center md:justify-start gap-6 text-neutral-300">
              {bpm && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="text-sm font-medium">{bpm} BPM</span>
                </div>
              )}
              {timeSignature && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎹</span>
                  <span className="text-sm font-medium">{timeSignature}</span>
                </div>
              )}
            </div>
          )}

          {/* Loading Animation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <span>{status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]/70 animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]/50 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
