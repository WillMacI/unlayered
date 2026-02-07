import type { AudioFile, Stem, AIInsight, WaveformPeak } from '../types/audio';

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
    color: '#4ade80',
    volume: 0.8,
    pan: 0,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 0.8),
    hasAudio: true,
    order: 1,
  },
  {
    id: 'stem-guitar',
    type: 'guitar',
    label: 'Guitar',
    color: '#f97316',
    volume: 0.7,
    pan: 0.2,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 1.2),
    hasAudio: true,
    order: 2,
  },
  {
    id: 'stem-drums',
    type: 'drums',
    label: 'Drums',
    color: '#3b82f6',
    volume: 0.9,
    pan: 0,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 1.5),
    hasAudio: true,
    order: 3,
  },
  {
    id: 'stem-bass',
    type: 'bass',
    label: 'Bass',
    color: '#a855f7',
    volume: 0.75,
    pan: -0.1,
    isMuted: false,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 0.6),
    hasAudio: true,
    order: 4,
  },
  {
    id: 'stem-other',
    type: 'other',
    label: 'Other',
    color: '#64748b',
    volume: 0.5,
    pan: 0,
    isMuted: true,
    isSolo: false,
    isLocked: true,
    waveformData: generateWaveformData(1000, 0.3),
    hasAudio: false,
    order: 5,
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
