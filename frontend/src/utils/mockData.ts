import type { AudioFile, Stem, AIInsight, WaveformPeak, SongSection } from '../types/audio';

// Generate mock waveform data
export const generateWaveformData = (length: number = 1000, complexity: number = 1): number[] => {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    const value = Math.sin(i / 20) * 0.5 +
      Math.sin(i / 10) * 0.3 * complexity +
      Math.random() * 0.2;
    data.push(Math.abs(value));
  }
  return data;
};

// Generate peaks (for visual flash indicators)
export const generatePeaks = (duration: number): WaveformPeak[] => {
  const peaks: WaveformPeak[] = [];
  const numPeaks = Math.floor(duration / 30); // Peak every ~30 seconds

  for (let i = 0; i < numPeaks; i++) {
    peaks.push({
      time: (i + 1) * 30 + Math.random() * 10,
      amplitude: 0.8 + Math.random() * 0.2,
    });
  }

  return peaks;
};

export const mockAudioFile: AudioFile = {
  id: 'audio-1',
  name: 'Midnight Dreams',
  artist: 'The Synthwave Collective',
  duration: 245, // 4:05 in seconds
  format: 'MP3',
};

export const mockStems: Stem[] = [
  {
    id: 'stem-vocals',
    type: 'vocals',
    label: 'Vocals',
    color: '#D4AF37',
    volume: 0.8,
    pan: 0,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 0.8),
    hasAudio: true,
    order: 1,
    audioUrl: '/test-audio/vocals.wav',
  },
  {
    id: 'stem-guitar',
    type: 'guitar',
    label: 'Guitar',
    color: '#D4AF37',
    volume: 0.7,
    pan: 0.2,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 1.2),
    hasAudio: true,
    order: 2,
    audioUrl: '/test-audio/guitar.wav',
  },
  {
    id: 'stem-drums',
    type: 'drums',
    label: 'Drums',
    color: '#D4AF37',
    volume: 0.9,
    pan: 0,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 1.5),
    hasAudio: true,
    order: 3,
    audioUrl: '/test-audio/drums.wav',
  },
  {
    id: 'stem-bass',
    type: 'bass',
    label: 'Bass',
    color: '#D4AF37',
    volume: 0.75,
    pan: -0.1,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 0.6),
    hasAudio: true,
    order: 4,
    audioUrl: '/test-audio/bass.wav',
  },
  {
    id: 'stem-other',
    type: 'other',
    label: 'Other',
    color: '#D4AF37',
    volume: 0.5,
    pan: 0,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 0.3),
    hasAudio: true,
    order: 5,
    audioUrl: '/test-audio/other.wav',
  },
];

export const mockAIInsight: AIInsight = {
  summary: 'A dreamy synthwave track with lush atmospheric pads, driving basslines, and ethereal vocals. The production features classic 80s-inspired sounds with modern polish. Strong emphasis on melody and nostalgic vibes.',
  genre: 'Synthwave / Electronic',
  mood: 'Nostalgic, Dreamy',
  tempo: 118,
  key: 'A Minor',
};

export const mockCombinedWaveform = generateWaveformData(1000, 2);
export const mockPeaks = generatePeaks(245);

// Mock song structure
export const mockSongStructure: SongSection[] = [
  { type: 'intro', startTime: 0, endTime: 15, label: 'Intro' },
  { type: 'verse', startTime: 15, endTime: 45, label: 'Verse 1' },
  { type: 'chorus', startTime: 45, endTime: 75, label: 'Chorus' },
  { type: 'verse', startTime: 75, endTime: 105, label: 'Verse 2' },
  { type: 'chorus', startTime: 105, endTime: 135, label: 'Chorus' },
  { type: 'bridge', startTime: 135, endTime: 165, label: 'Bridge' },
  { type: 'chorus', startTime: 165, endTime: 195, label: 'Chorus' },
  { type: 'outro', startTime: 195, endTime: 245, label: 'Outro' },
];
