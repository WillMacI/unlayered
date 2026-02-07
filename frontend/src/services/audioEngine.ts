/**
 * AudioEngine - Core audio playback system using Web Audio API
 * Handles multi-stem synchronization, individual controls, and master playback
 */

interface StemAudioNode {
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  url: string;
  volume: number; // Track user's volume setting separately from mute state
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private stems: Map<string, StemAudioNode> = new Map();
  private masterGain: GainNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private duration: number = 0;

  /**
   * Initialize the audio context and master gain
   */
  async init(): Promise<void> {
    if (this.context) return;

    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    // Resume context if suspended (Chrome autoplay policy)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Load an audio stem from URL
   */
  async loadStem(stemId: string, audioUrl: string): Promise<void> {
    if (!this.context || !this.masterGain) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      // Fetch audio file
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch ${audioUrl}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

      // Create audio nodes
      const gainNode = this.context.createGain();
      const panNode = this.context.createStereoPanner();

      // Connect: pan -> gain -> master
      panNode.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Store stem
      this.stems.set(stemId, {
        buffer: audioBuffer,
        source: null,
        gainNode,
        panNode,
        url: audioUrl,
        volume: 1, // Default volume
      });

      // Update duration (use longest stem)
      if (audioBuffer.duration > this.duration) {
        this.duration = audioBuffer.duration;
      }
    } catch (error) {
      console.error(`Failed to load stem ${stemId}:`, error);
      throw error;
    }
  }

  /**
   * Play all stems synchronously
   */
  play(): void {
    if (!this.context) return;

    // Prevent multiple play calls
    if (this.isPlaying) {
      console.warn('Already playing');
      return;
    }

    // Set playing state immediately to prevent race conditions
    this.isPlaying = true;

    // Resume context if needed
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // Calculate start offset
    const offset = this.pauseTime;

    // Stop any existing sources first (cleanup)
    this.stems.forEach((stem) => {
      if (stem.source) {
        try {
          stem.source.stop();
          stem.source.disconnect();
        } catch {
          // Ignore errors if already stopped
        }
        stem.source = null;
      }
    });

    // Create and start sources for all stems
    this.stems.forEach((stem) => {
      if (!stem.buffer) return;

      // Create new source (AudioBufferSourceNode is one-shot)
      const source = this.context!.createBufferSource();
      source.buffer = stem.buffer;

      // Connect to existing gain/pan chain
      source.connect(stem.panNode);

      // Start playback from offset
      source.start(0, offset);

      // Handle end of playback
      source.onended = () => {
        if (this.isPlaying && this.getCurrentTime() >= this.duration) {
          this.pause();
          this.seek(0);
        }
      };

      stem.source = source;
    });

    this.startTime = this.context.currentTime - offset;
  }

  /**
   * Pause all stems
   */
  pause(): void {
    if (!this.context) return;

    // Prevent multiple pause calls
    if (!this.isPlaying) {
      console.warn('Already paused');
      return;
    }

    // Store current time BEFORE setting isPlaying to false
    // (getCurrentTime() checks isPlaying to determine which time to return)
    this.pauseTime = this.context.currentTime - this.startTime;

    // Set paused state after capturing time
    this.isPlaying = false;

    // Stop and disconnect all sources
    this.stems.forEach((stem) => {
      if (stem.source) {
        try {
          stem.source.stop();
          stem.source.disconnect();
        } catch (error) {
          // Ignore if already stopped
          console.warn('Error stopping source:', error);
        }
        stem.source = null;
      }
    });
  }

  /**
   * Seek to specific time
   */
  seek(time: number): void {
    const wasPlaying = this.isPlaying;

    // Stop playback if playing
    if (this.isPlaying) {
      // Stop all sources
      this.stems.forEach((stem) => {
        if (stem.source) {
          try {
            stem.source.stop();
            stem.source.disconnect();
          } catch {
            // Ignore
          }
          stem.source = null;
        }
      });

      // Set to false after stopping sources
      this.isPlaying = false;
    }

    // Update pause time to the new seek position
    this.pauseTime = Math.max(0, Math.min(time, this.duration));

    // Resume if was playing
    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Set volume for a specific stem (0-1)
   */
  setVolume(stemId: string, volume: number): void {
    const stem = this.stems.get(stemId);
    if (stem) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      stem.volume = clampedVolume;
      stem.gainNode.gain.value = clampedVolume;
    }
  }

  /**
   * Set pan for a specific stem (-1 to 1)
   */
  setPan(stemId: string, pan: number): void {
    const stem = this.stems.get(stemId);
    if (stem) {
      stem.panNode.pan.value = Math.max(-1, Math.min(1, pan));
    }
  }

  /**
   * Mute/unmute a specific stem
   */
  setMute(stemId: string, muted: boolean): void {
    const stem = this.stems.get(stemId);
    if (stem) {
      // When unmuting, restore the user's saved volume instead of resetting to 1
      stem.gainNode.gain.value = muted ? 0 : stem.volume;
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (!this.context) return 0;

    if (this.isPlaying) {
      return this.context.currentTime - this.startTime;
    }

    return this.pauseTime;
  }

  /**
   * Get total duration
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * Check if playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up all resources
   */
  /**
   * Get waveform data for a specific stem
   * Returns normalized array of peaks (0-1)
   */
  getWaveformData(stemId: string, samples: number = 200): number[] {
    const stem = this.stems.get(stemId);
    if (!stem || !stem.buffer) {
      return new Array(samples).fill(0);
    }

    const channelData = stem.buffer.getChannelData(0); // Use first channel
    if (samples <= 0) return [];
    if (channelData.length === 0) return new Array(samples).fill(0);
    // Use fractional step so we don't read past the buffer for short data
    const step = channelData.length / samples;
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = Math.floor(i * step);
      if (start >= channelData.length) {
        waveform.push(0);
        continue;
      }
      let end = Math.floor((i + 1) * step);
      if (end <= start) end = start + 1;
      if (end > channelData.length) end = channelData.length;
      const segmentLength = end - start;
      let sum = 0;

      // Calculate RMS for this chunk
      for (let j = start; j < end; j++) {
        sum += channelData[j] * channelData[j];
      }

      const rms = Math.sqrt(sum / segmentLength);
      waveform.push(rms);
    }

    // Normalize to 0-1 range (amplified slightly for visibility)
    const max = Math.max(...waveform) || 1;
    return waveform.map(val => Math.min(1, (val / max) * 1.5));
  }

  /**
   * Get stereo waveform data (left and right channels)
   */
  getStereoWaveformData(stemId: string, samples: number = 200): { left: number[], right: number[] } {
    const stem = this.stems.get(stemId);
    if (!stem || !stem.buffer) {
      return { left: new Array(samples).fill(0), right: new Array(samples).fill(0) };
    }

    const processChannel = (channelIndex: number): number[] => {
      // If buffer is mono, use channel 0 for both
      const idx = Math.min(channelIndex, stem.buffer!.numberOfChannels - 1);
      const channelData = stem.buffer!.getChannelData(idx);
      if (samples <= 0) return [];
      if (channelData.length === 0) return new Array(samples).fill(0);
      // Use fractional step so we don't read past the buffer for short data
      const step = channelData.length / samples;
      const waveform: number[] = [];

      for (let i = 0; i < samples; i++) {
        const start = Math.floor(i * step);
        if (start >= channelData.length) {
          waveform.push(0);
          continue;
        }
        let end = Math.floor((i + 1) * step);
        if (end <= start) end = start + 1;
        if (end > channelData.length) end = channelData.length;
        const segmentLength = end - start;
        let sum = 0;

        for (let j = start; j < end; j++) {
          sum += channelData[j] * channelData[j];
        }

        waveform.push(Math.sqrt(sum / segmentLength));
      }

      const max = Math.max(...waveform) || 1;
      return waveform.map(val => Math.min(1, (val / max) * 1.5));
    };

    return {
      left: processChannel(0),
      right: processChannel(1)
    };
  }

  cleanup(): void {
    // Stop playback first
    if (this.isPlaying) {
      this.isPlaying = false;

      // Stop all sources
      this.stems.forEach((stem) => {
        if (stem.source) {
          try {
            stem.source.stop();
            stem.source.disconnect();
          } catch {
            // Ignore
          }
          stem.source = null;
        }
      });
    }

    // Disconnect all nodes
    this.stems.forEach((stem) => {
      try {
        stem.gainNode.disconnect();
        stem.panNode.disconnect();
      } catch {
        // Ignore if already disconnected
      }
    });

    this.stems.clear();

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Ignore
      }
    }

    if (this.context) {
      this.context.close();
    }

    this.context = null;
    this.masterGain = null;
    this.duration = 0;
    this.pauseTime = 0;
    this.startTime = 0;
  }
}
