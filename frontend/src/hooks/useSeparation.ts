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
  const pollingRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch capabilities on mount
  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      try {
        const caps = await fetchCapabilities();
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            capabilities: caps,
            recommendedQuality: getRecommendedQuality(caps),
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch system capabilities:', err);
        // Non-critical error, use defaults
      }
    };

    loadCapabilities();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback((jobId: string) => {
    stopPolling();

    const poll = async () => {
      try {
        const status = await getJobStatus(jobId);

        setState((prev) => ({
          ...prev,
          progress: status.progress ?? prev.progress,
        }));

        const jobStatus: JobStatus = status.status;

        if (jobStatus === 'processing') {
          setState((prev) => ({ ...prev, stage: 'processing' }));
        } else if (jobStatus === 'completed') {
          stopPolling();
          // Fetch the result
          try {
            const result = await getJobResult(jobId);
            setState((prev) => ({
              ...prev,
              stage: 'completed',
              progress: 100,
              result,
            }));
          } catch (err) {
            setState((prev) => ({
              ...prev,
              stage: 'failed',
              error: err instanceof Error ? err.message : 'Failed to fetch results',
            }));
          }
        } else if (jobStatus === 'failed') {
          stopPolling();
          setState((prev) => ({
            ...prev,
            stage: 'failed',
            error: status.error || 'Separation failed',
          }));
        }
      } catch (err) {
        // Network error during polling - continue polling
        console.warn('Polling error:', err);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    pollingRef.current = window.setInterval(poll, API_CONFIG.pollingInterval);
  }, [stopPolling]);

  const startSeparation = useCallback(async (file: File, quality: number) => {
    // Reset state
    setState((prev) => ({
      ...prev,
      stage: 'uploading',
      progress: 0,
      jobId: null,
      error: null,
      result: null,
    }));

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Upload file
      const response = await uploadFile(file, quality);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState((prev) => ({
        ...prev,
        stage: 'queued',
        jobId: response.job_id,
      }));

      // Start polling for status
      pollJobStatus(response.job_id);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState((prev) => ({
        ...prev,
        stage: 'failed',
        error: err instanceof Error ? err.message : 'Upload failed',
      }));
    }
  }, [pollJobStatus]);

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
