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
  progress: number; // 0-100
  status: string;   // "Uploading...", "Analyzing...", etc.
}

export const LoadingScreen = ({
  artist,
  trackName,
  bpm,
  timeSignature,
  artistImage,
  progress,
  status,
}: LoadingScreenProps) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Fade in animation on mount
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate gradient placeholder if no artist image
  const placeholderGradient = `linear-gradient(135deg,
    hsl(${artist.length * 37 % 360}, 70%, 50%),
    hsl(${artist.length * 73 % 360}, 70%, 40%))`;

  return (
    <div
      className={`min-h-screen bg-slate-900 flex items-center justify-center transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-2xl w-full px-8">
        {/* Artist Image / Placeholder */}
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
          {artistImage ? (
            <img
              src={artistImage}
              alt={artist}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div
              className="w-full h-96 flex items-center justify-center text-white text-6xl font-bold"
              style={{ background: placeholderGradient }}
            >
              {artist.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>

        {/* Track Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
            {trackName}
          </h1>
          <p className="text-xl text-slate-400">{artist}</p>
        </div>

        {/* Metadata */}
        {(bpm || timeSignature) && (
          <div className="flex items-center justify-center gap-8 mb-8 text-slate-300">
            {bpm && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-lg font-medium">{bpm} BPM</span>
              </div>
            )}
            {timeSignature && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎹</span>
                <span className="text-lg font-medium">{timeSignature}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-2">{status}</p>
          <p className="text-slate-500 text-sm">{Math.round(progress)}% complete</p>
        </div>

        {/* Shimmer animation overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
