import type { SongMetadata, TimedLyricAnnotation } from '../types/audio';
import { API_CONFIG } from '../config/api';

export interface LyricsSearchResult {
  id: number;
  title: string;
  artist: string;
  album_name?: string | null;
  song_art_image_url?: string | null;
  header_image_url?: string | null;
}

export interface LyricsResolveResponse {
  song: SongMetadata;
  lyrics: string | null;
  lrc: string | null;
  timed_lyrics: TimedLyricAnnotation[];
}

interface RawTimedLyricAnnotation {
  line: string;
  start_time?: number | null;
  end_time?: number | null;
  startTime?: number | null;
  endTime?: number | null;
  annotations?: string[];
  annotation?: string;
}

interface RawLyricsResolveResponse {
  song: SongMetadata;
  lyrics: string | null;
  lrc: string | null;
  timed_lyrics: RawTimedLyricAnnotation[];
}

export async function searchLyricsSongs(query: string): Promise<LyricsSearchResult[]> {
  const resp = await fetch(`${API_CONFIG.baseUrl}/api/lyrics/search?q=${encodeURIComponent(query)}`);
  if (!resp.ok) {
    throw new Error(`Search failed: ${resp.status}`);
  }
  return resp.json();
}

export async function resolveLyricsSong(songId: number): Promise<LyricsResolveResponse> {
  const resp = await fetch(`${API_CONFIG.baseUrl}/api/lyrics/song/${songId}`);
  if (!resp.ok) {
    throw new Error(`Resolve failed: ${resp.status}`);
  }
  const raw: RawLyricsResolveResponse = await resp.json();
  const normalizedTimedLyrics = Array.isArray(raw.timed_lyrics)
    ? raw.timed_lyrics.map((entry: RawTimedLyricAnnotation): TimedLyricAnnotation => {
        const startTime = entry.start_time ?? entry.startTime ?? null;
        const endTime = entry.end_time ?? entry.endTime ?? null;
        const annotations = entry.annotations ?? (entry.annotation ? entry.annotation.split('\n\n') : []);

        return {
          ...entry,
          startTime,
          endTime,
          annotations,
          annotation: entry.annotation ?? annotations.join('\n\n'),
        };
      })
    : [];
  return {
    ...raw,
    timed_lyrics: normalizedTimedLyrics,
  };
}
