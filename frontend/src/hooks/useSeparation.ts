import { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../config/api';
import {
  fetchCapabilities,
  uploadFile,
  getJobStatus,
  getJobResult,
  getRecommendedQuality,
  type SystemCapabilities,
  type SeparationResult,
  type JobStatus,
} from '../services/apiClient';

export type SeparationStage = 'idle' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';

interface UseSeparationState {
  stage: SeparationStage;
  progress: number;
  jobId: string | null;
  error: string | null;
  result: SeparationResult | null;
  capabilities: SystemCapabilities | null;
  recommendedQuality: number;
}

interface UseSeparationReturn extends UseSeparationState {
  startSeparation: (file: File, quality: number) => Promise<void>;
  reset: () => void;
}

const initialState: UseSeparationState = {
  stage: 'idle',
  progress: 0,
  jobId: null,
  error: null,
  result: null,
  capabilities: null,
  recommendedQuality: 2,
};

export function useSeparation(): UseSeparationReturn {
  const [state, setState] = useState<UseSeparationState>(initialState);
  const pollingTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch capabilities on mount
  useEffect(() => {
    const controller = new AbortController();

    const loadCapabilities = async () => {
      try {
        const caps = await fetchCapabilities(controller.signal);
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            capabilities: caps,
            recommendedQuality: getRecommendedQuality(caps),
          }));
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn('Failed to fetch system capabilities:', err);
        }
        // Non-critical error, use defaults
      }
    };

    loadCapabilities();

    return () => {
      controller.abort();
    };
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback((jobId: string, signal: AbortSignal) => {
    stopPolling();

    const poll = async () => {
      // Check if aborted before making request
      if (signal.aborted) {
        return;
      }

      try {
        const status = await getJobStatus(jobId, signal);

        // Check again after async operation
        if (signal.aborted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          progress: status.progress ?? prev.progress,
        }));

        const jobStatus: JobStatus = status.status;

        if (jobStatus === 'processing') {
          setState((prev) => ({ ...prev, stage: 'processing' }));
          // Schedule next poll after this one completes
          scheduleNextPoll();
        } else if (jobStatus === 'queued') {
          // Still queued, keep polling
          scheduleNextPoll();
        } else if (jobStatus === 'completed') {
          // Fetch the result
          try {
            const result = await getJobResult(jobId, signal);
            if (signal.aborted) return;
            setState((prev) => ({
              ...prev,
              stage: 'completed',
              progress: 100,
              result,
            }));
          } catch (err) {
            if (signal.aborted) return;
            setState((prev) => ({
              ...prev,
              stage: 'failed',
              error: err instanceof Error ? err.message : 'Failed to fetch results',
            }));
          }
        } else if (jobStatus === 'failed') {
          setState((prev) => ({
            ...prev,
            stage: 'failed',
            error: status.error || 'Separation failed',
          }));
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Network error during polling - schedule retry
        console.warn('Polling error:', err);
        scheduleNextPoll();
      }
    };

    // Schedule next poll using setTimeout (self-scheduling to avoid overlap)
    const scheduleNextPoll = () => {
      if (!signal.aborted) {
        pollingTimeoutRef.current = window.setTimeout(poll, API_CONFIG.pollingInterval);
      }
    };

    // Initial poll
    poll();
  }, [stopPolling]);

  const startSeparation = useCallback(async (file: File, quality: number) => {
    // Stop any existing polling and abort previous requests
    stopPolling();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Reset state
    setState((prev) => ({
      ...prev,
      stage: 'uploading',
      progress: 0,
      jobId: null,
      error: null,
      result: null,
    }));

    try {
      // Upload file
      const response = await uploadFile(file, quality, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      setState((prev) => ({
        ...prev,
        stage: 'queued',
        jobId: response.job_id,
      }));

      // Start polling for status
      pollJobStatus(response.job_id, controller.signal);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      setState((prev) => ({
        ...prev,
        stage: 'failed',
        error: err instanceof Error ? err.message : 'Upload failed',
      }));
    }
  }, [pollJobStatus, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({ ...initialState, capabilities: state.capabilities, recommendedQuality: state.recommendedQuality });
  }, [stopPolling, state.capabilities, state.recommendedQuality]);

  return {
    ...state,
    startSeparation,
    reset,
  };
}
