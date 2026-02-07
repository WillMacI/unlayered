/**
 * useAudioEngine - React hook wrapper for AudioEngine
 * Manages lifecycle, loading states, and real-time updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioEngine } from '../services/audioEngine';
import type { Stem } from '../types/audio';

interface UseAudioEngineReturn {
  loadStems: (stems: Stem[]) => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (stemId: string, volume: number) => void;
  setPan: (stemId: string, pan: number) => void;
  setMute: (stemId: string, muted: boolean) => void;
  setMasterVolume: (volume: number) => void;
  getWaveformData: (stemId: string, samples?: number) => number[];
  getStereoWaveformData: (stemId: string, samples?: number) => { left: number[], right: number[] };
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAudioEngine = (): UseAudioEngineReturn => {
  const engineRef = useRef<AudioEngine | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize engine on mount
  useEffect(() => {
    const initEngine = async () => {
      try {
        engineRef.current = new AudioEngine();
        await engineRef.current.init();
      } catch (err) {
        setError('Failed to initialize audio engine');
        console.error('Audio engine init error:', err);
      }
    };

    initEngine();

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, []);

  // Update current time with requestAnimationFrame
  useEffect(() => {
    const updateTime = () => {
      if (engineRef.current) {
        const time = engineRef.current.getCurrentTime();
        setCurrentTime(time);

        // Continue updating if playing
        if (engineRef.current.getIsPlaying()) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        } else if (isPlaying) {
          setIsPlaying(false);
        }
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  /**
   * Load audio stems
   */
  const loadStems = useCallback(async (stems: Stem[]) => {
    if (!engineRef.current) {
      setError('Audio engine not initialized');
      throw new Error('Audio engine not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load all stems in parallel
      const loadPromises = stems
        .filter((stem) => stem.audioUrl) // Only load stems with audio URLs
        .map((stem) =>
          engineRef.current!.loadStem(stem.id, stem.audioUrl!)
        );

      await Promise.all(loadPromises);

      // Update duration
      const loadedDuration = engineRef.current.getDuration();
      setDuration(loadedDuration);

      // Apply initial stem settings
      stems.forEach((stem) => {
        engineRef.current!.setVolume(stem.id, stem.volume);
        engineRef.current!.setMute(stem.id, stem.isMuted);
        engineRef.current!.setPan(stem.id, stem.pan);
      });

      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        setError('Audio playback blocked. Please interact with the page first.');
      } else if (error.name === 'NotSupportedError') {
        setError('Audio format not supported by your browser.');
      } else {
        setError('Failed to load audio files. Please try again.');
      }
      setIsLoading(false);
      console.error('Stem loading error:', err);
      throw err;
    }
  }, []);

  /**
   * Play audio
   */
  const play = useCallback(() => {
    if (!engineRef.current) return;

    try {
      engineRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to start playback');
      console.error('Play error:', err);
    }
  }, []);

  /**
   * Pause audio
   */
  const pause = useCallback(() => {
    if (!engineRef.current) return;

    try {
      engineRef.current.pause();
      setIsPlaying(false);
    } catch (err) {
      setError('Failed to pause playback');
      console.error('Pause error:', err);
    }
  }, []);

  /**
   * Seek to time
   */
  const seek = useCallback((time: number) => {
    if (!engineRef.current) return;

    try {
      engineRef.current.seek(time);
      setCurrentTime(time);
    } catch (err) {
      setError('Failed to seek');
      console.error('Seek error:', err);
    }
  }, []);

  /**
   * Set stem volume
   */
  const setVolume = useCallback((stemId: string, volume: number) => {
    if (!engineRef.current) return;
    engineRef.current.setVolume(stemId, volume);
  }, []);

  /**
   * Set stem pan
   */
  const setPan = useCallback((stemId: string, pan: number) => {
    if (!engineRef.current) return;
    engineRef.current.setPan(stemId, pan);
  }, []);

  /**
   * Set stem mute
   */
  const setMute = useCallback((stemId: string, muted: boolean) => {
    if (!engineRef.current) return;
    engineRef.current.setMute(stemId, muted);
  }, []);

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume: number) => {
    if (!engineRef.current) return;
    engineRef.current.setMasterVolume(volume);
  }, []);

  return {
    loadStems,
    play,
    pause,
    seek,
    setVolume,
    setPan,
    setMute,
    setMasterVolume,
    getWaveformData: (stemId: string, samples?: number) => engineRef.current?.getWaveformData(stemId, samples) || [],
    getStereoWaveformData: (stemId: string, samples?: number) => engineRef.current?.getStereoWaveformData(stemId, samples) || { left: [], right: [] },
    currentTime,
    duration,
    isPlaying,
    isLoading,
    error,
  };
};
