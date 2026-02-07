export type StemType = 'vocals' | 'guitar' | 'drums' | 'bass' | 'other';

export interface AudioFile {
  id: string;
  name: string;
  artist: string;
  duration: number;
  format: string;
  path?: string;
}

export interface Stem {
  id: string;
  type: StemType;
  label: string;
  color: string;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  isLocked: boolean;
  waveformData: number[];
  hasAudio: boolean;
  order: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface WaveformPeak {
  time: number;
  amplitude: number;
}

export interface AIInsight {
  summary: string;
  genre?: string;
  mood?: string;
  tempo?: number;
  key?: string;
}
