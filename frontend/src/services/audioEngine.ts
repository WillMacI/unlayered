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
  muted: boolean;
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
   * Reset all loaded stems and timing without destroying the AudioContext.
   */
  resetStems(): void {
    // Stop playback first
    if (this.isPlaying) {
      this.isPlaying = false;
    }

    // Stop and disconnect all sources/nodes
    this.stems.forEach((stem) => {
      if (stem.source) {
        try {
          stem.source.stop();
          stem.source.disconnect();
        } catch {
          // ignore
        }
        stem.source = null;
      }
      try {
        stem.gainNode.disconnect();
        stem.panNode.disconnect();
      } catch {
        // ignore
      }
    });

    this.stems.clear();
    this.duration = 0;
    this.pauseTime = 0;
    this.startTime = 0;
  }

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
      try {
        await this.context.resume();
      } catch (error) {
        // Autoplay policies can block resume without a user gesture.
        console.warn('Audio context resume blocked during init:', error);
      }
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
      const existing = this.stems.get(stemId);
      if (existing) {
        if (existing.source) {
          try {
            existing.source.stop();
            existing.source.disconnect();
          } catch {
            // Ignore if already stopped
          }
          existing.source = null;
        }
        try {
          existing.gainNode.disconnect();
          existing.panNode.disconnect();
        } catch {
          // Ignore if already disconnected
        }
      }

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
        muted: false,
      });
      console.log(`[AudioEngine] Loaded stem ${stemId}`, {
        url: audioUrl,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length
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
  async play(): Promise<void> {
    if (!this.context) return;

    // Prevent multiple play calls
    if (this.isPlaying) {
      console.warn('Already playing');
      return;
    }

    // Resume context if needed
    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch (error) {
        console.warn('Audio context resume failed:', error);
        this.isPlaying = false;
        return;
      }
    }

    // Set playing state after successful resume
    this.isPlaying = true;

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

    // Schedule all stems to start at the same precise time
    // A small buffer ensures all sources can be scheduled before playback begins
    const scheduledStart = this.context.currentTime + 0.01; // 10ms buffer

    console.log(`[AudioEngine] play() - scheduledStart: ${scheduledStart}, offset: ${offset}, context.currentTime: ${this.context.currentTime}`);

    // Create and start sources for all stems
    let startedSources = 0;
    this.stems.forEach((stem, stemId) => {
      if (!stem.buffer) return;
      if (offset >= stem.buffer.duration) {
        console.log(`[AudioEngine] Skipping ${stemId} - offset ${offset} >= duration ${stem.buffer.duration}`);
        return;
      }

      // Create new source (AudioBufferSourceNode is one-shot)
      const source = this.context!.createBufferSource();
      source.buffer = stem.buffer;

      // Connect to existing gain/pan chain
      source.connect(stem.panNode);

      // Start playback at the scheduled time (all stems start together)
      source.start(scheduledStart, offset);
      startedSources += 1;
      console.log(`[AudioEngine] Started ${stemId}: when=${scheduledStart.toFixed(4)}, offset=${offset.toFixed(4)}, bufferDuration=${stem.buffer.duration.toFixed(4)}`);

      // Handle end of playback
      source.onended = () => {
        if (this.isPlaying && this.getCurrentTime() >= this.duration) {
          this.pause();
          this.seek(0);
        }
      };

      stem.source = source;
    });

    if (startedSources === 0) {
      this.isPlaying = false;
      return;
    }

    // Calculate startTime based on the scheduled start, not current time
    this.startTime = scheduledStart - offset;
  }

  /**
   * Get maximum duration from all loaded buffers directly
   */
  getMaxBufferDuration(): number {
    let max = 0;
    this.stems.forEach(stem => {
      if (stem.buffer && stem.buffer.duration > max) {
        max = stem.buffer.duration;
      }
    });
    return max;
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
      void this.play().catch((error) => {
        console.error('Error resuming playback after seek:', error);
      });
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
      if (!stem.muted) {
        stem.gainNode.gain.value = clampedVolume;
      }
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
      stem.muted = muted;
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
   * Get waveform data for a specific stem
   * Returns normalized array of peaks (0-1)
   */
  getWaveformData(stemId: string, samples: number = 200): number[] {
    const safeSamples = Math.max(0, Math.floor(samples));
    if (safeSamples === 0) return [];
    const stem = this.stems.get(stemId);
    if (!stem || !stem.buffer) {
      return new Array(safeSamples).fill(0);
    }

    const channelData = stem.buffer.getChannelData(0); // Use first channel
    if (channelData.length === 0) return new Array(safeSamples).fill(0);
    // Use fractional step so we don't read past the buffer for short data
    const step = channelData.length / safeSamples;
    const waveform: number[] = [];

    for (let i = 0; i < safeSamples; i++) {
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
    let max = 0;
    for (let i = 0; i < waveform.length; i++) {
      if (waveform[i] > max) {
        max = waveform[i];
      }
    }
    if (max === 0) {
      max = 1;
    }
    return waveform.map(val => Math.min(1, (val / max) * 1.5));
  }

  /**
   * Get stereo waveform data (left and right channels)
   */
  getStereoWaveformData(stemId: string, samples: number = 200): { left: number[], right: number[] } {
    const safeSamples = Math.max(0, Math.floor(samples));
    if (safeSamples === 0) return { left: [], right: [] };
    const stem = this.stems.get(stemId);
    if (!stem || !stem.buffer) {
      return { left: new Array(safeSamples).fill(0), right: new Array(safeSamples).fill(0) };
    }

    const processChannel = (channelIndex: number): number[] => {
      // If buffer is mono, use channel 0 for both
      const idx = Math.min(channelIndex, stem.buffer!.numberOfChannels - 1);
      const channelData = stem.buffer!.getChannelData(idx);
      if (channelData.length === 0) return new Array(safeSamples).fill(0);
      // Use fractional step so we don't read past the buffer for short data
      const step = channelData.length / safeSamples;
      const waveform: number[] = [];

      for (let i = 0; i < safeSamples; i++) {
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

      let max = 0;
      for (let i = 0; i < waveform.length; i++) {
        if (waveform[i] > max) {
          max = waveform[i];
        }
      }
      if (max === 0) {
        max = 1;
      }
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
      const ctx = this.context;
      void ctx.close().catch(() => {
        // Ignore close errors to avoid unhandled promise rejections during cleanup
      });
    }

    this.context = null;
    this.masterGain = null;
    this.duration = 0;
    this.pauseTime = 0;
    this.startTime = 0;
  }

  /**
   * Analyze the drum stem to find kick drum peaks
   * Uses an OfflineAudioContext to run a low-pass filter and extract peaks
   */
  async getKickDrumPeaks(stemId: string, threshold: number = 0.3): Promise<{ time: number; intensity: number; channel: 'left' | 'right' | 'center' }[]> {
    console.log(`[AudioEngine] getKickDrumPeaks called for ${stemId}`);
    const stem = this.stems.get(stemId);
    if (!stem || !stem.buffer) {
      console.warn(`[AudioEngine] Stem ${stemId} not found or has no buffer`);
      return [];
    }

    // Create offline context for processing
    const offlineCtx = new OfflineAudioContext(
      1, // Mono is enough for kick detection
      stem.buffer.length,
      stem.buffer.sampleRate
    );

    // Create source
    const source = offlineCtx.createBufferSource();
    source.buffer = stem.buffer;

    // Create Low-pass filter for Kick (approx < 150Hz)
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    filter.Q.value = 1;

    // Connect
    source.connect(filter);
    filter.connect(offlineCtx.destination);

    source.start(0);

    // Render
    const renderedBuffer = await offlineCtx.startRendering();
    const data = renderedBuffer.getChannelData(0);

    // Peak detection on filtered data
    const peaks: { time: number; intensity: number; channel: 'left' | 'right' | 'center' }[] = [];
    const minSpacing = 0.2; // Kick hits are rarely faster than 200ms (300bpm 8th notes)
    const minSpacingSamples = minSpacing * renderedBuffer.sampleRate;

    // Find peaks
    for (let i = 0; i < data.length; i++) {
      // Simple threshold check + local maximum
      // Optimization: skip samples if below threshold
      if (Math.abs(data[i]) < threshold) continue;

      // Check if it's a local maximum in a small window
      let isMax = true;
      const checkWindow = 500; // Small window to confirm peak
      for (let j = Math.max(0, i - checkWindow); j < Math.min(data.length, i + checkWindow); j++) {
        if (Math.abs(data[j]) > Math.abs(data[i])) {
          isMax = false;
          break;
        }
      }

      if (isMax) {
        // Check spacing from last peak
        const lastPeak = peaks[peaks.length - 1];
        const time = i / renderedBuffer.sampleRate;

        if (!lastPeak || (time - lastPeak.time > minSpacing)) {
          peaks.push({
            time,
            intensity: Math.min(1, Math.abs(data[i])),
            channel: 'center' // Kicks are usually centered
          });
          // Skip forward to avoid double triggers on the same hit tail
          i += Math.floor(minSpacingSamples / 2);
        }
      }
    }

    return peaks;
  }
}
