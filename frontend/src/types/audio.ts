export type StemType = 'vocals' | 'guitar' | 'drums' | 'bass' | 'other';

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
  audioUrl?: string;        // URL to audio file
  audioBuffer?: ArrayBuffer; // Loaded audio data
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

export interface AudioLoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  currentStem: string | null;
}

export type ProcessingStage = 'uploading' | 'analyzing' | 'separating' | 'finalizing' | 'complete';

export interface ProcessingStatus {
  stage: ProcessingStage;
  progress: number;
  message: string;
  metadata?: {
    artist: string;
    trackName: string;
    bpm?: number;
    timeSignature?: string;
    artistImage?: string;
  };
}

export type SectionType =
  | 'intro' | 'verse' | 'chorus' | 'bridge'
  | 'outro' | 'drop' | 'solo' | 'pre-chorus' | 'post-chorus';

export interface SongSection {
  type: SectionType;
  startTime: number;
  endTime: number;
  label: string;
  confidence?: number;
}

export interface AudioFile {
  id: string;
  name: string;
  artist: string;
  duration: number;
  format: string;
  path?: string;
  structure?: SongSection[];
}
