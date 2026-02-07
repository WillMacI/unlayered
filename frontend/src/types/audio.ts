export type StemType = 'vocals' | 'guitar' | 'drums' | 'bass' | 'other';

// Backend stem names from Demucs
export type BackendStemName = 'vocals' | 'drums' | 'bass' | 'other' | 'guitar' | 'piano';

export function mapBackendStemToType(backendName: BackendStemName): StemType {
  switch (backendName) {
    case 'vocals':
      return 'vocals';
    case 'drums':
      return 'drums';
    case 'bass':
      return 'bass';
    case 'guitar':
      return 'guitar';
    case 'piano':
    case 'other':
    default:
      return 'other';
  }
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
  waveformData: number[] | { left: number[], right: number[] };
  hasAudio: boolean;
  order: number;
  audioUrl?: string;        // URL to audio file
  audioBuffer?: ArrayBuffer; // Loaded audio data
  lyrics?: { text: string; startTime: number; endTime: number }[]; // Synced lyrics
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
