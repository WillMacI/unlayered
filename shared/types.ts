/**
 * Shared TypeScript types between frontend and backend
 */

export enum JobStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface SeparationJob {
  job_id: string;
  filename: string;
  status: JobStatus;
  progress?: number;
  error?: string;
}

export interface SeparatedTracks {
  vocals: string;
  drums: string;
  bass: string;
  other: string;
}

export interface SeparationResult {
  job_id: string;
  status: JobStatus;
  tracks: SeparatedTracks;
  notes?: SeparatedNotes;
  duration?: number;
}

export interface SongStructure {
  sections: Section[];
  tempo: number;
  key?: string;
}

export interface Section {
  start: number; // seconds
  end: number;
  type: "intro" | "verse" | "chorus" | "bridge" | "outro" | "instrumental";
  confidence: number;
}

export interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration: number;
  sampleRate: number;
}

export interface NoteEvent {
  start_time: number;
  end_time: number;
  pitch: number;
  velocity: number;
  confidence: number;
}

export interface SeparatedNotes {
  [stemName: string]: NoteEvent[];
}
