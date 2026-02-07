import { getApiUrl } from '../config/api';

// Types matching backend schemas
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobResponse {
  job_id: string;
  filename: string;
  status: JobStatus;
  progress?: number;
  error?: string;
}

export interface SeparationResult {
  job_id: string;
  status: JobStatus;
  tracks: Record<string, string | null>; // stem name -> download URL (null if not available)
  duration?: number; // processing duration in seconds
}

// Matches backend SystemCapabilities schema exactly
export interface SystemCapabilities {
  has_gpu: boolean;
  gpu_name?: string;
  gpu_memory_gb?: number;
  system_memory_gb: number;
  cpu_cores: number;
  recommended_model: string;
  max_concurrent_jobs: number;
}

export interface QualityPreset {
  level: number;
  label: string;
  description: string;
}

export const QUALITY_PRESETS: QualityPreset[] = [
  { level: 1, label: 'Draft', description: 'Fastest processing, lower quality' },
  { level: 2, label: 'Standard', description: 'Good balance of speed and quality' },
  { level: 3, label: 'High', description: 'Better quality, slower processing' },
  { level: 4, label: 'Very High', description: 'High quality, requires more time' },
  { level: 5, label: 'Maximum', description: 'Best quality, longest processing time' },
];

// API Functions with AbortSignal support
export async function fetchCapabilities(signal?: AbortSignal): Promise<SystemCapabilities> {
  const response = await fetch(getApiUrl('capabilities'), { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch capabilities: ${response.statusText}`);
  }
  return response.json();
}

export async function uploadFile(file: File, quality: number, signal?: AbortSignal): Promise<JobResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality.toString());

  const response = await fetch(getApiUrl('upload'), {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobStatus(jobId: string, signal?: AbortSignal): Promise<JobResponse> {
  const response = await fetch(getApiUrl('status', jobId), { signal });
  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }
  return response.json();
}

export async function getJobResult(jobId: string, signal?: AbortSignal): Promise<SeparationResult> {
  const response = await fetch(getApiUrl('result', jobId), { signal });
  if (!response.ok) {
    throw new Error(`Failed to get job result: ${response.statusText}`);
  }
  return response.json();
}

export function getStemDownloadUrl(jobId: string, stemName: string): string {
  return getApiUrl('download', jobId, stemName);
}

export function getRecommendedQuality(capabilities: SystemCapabilities | null): number {
  if (!capabilities) return 2; // Default to Standard
  // Recommend higher quality if GPU is available
  if (capabilities.has_gpu) {
    return 3; // High quality with GPU
  }
  return 2; // Standard for CPU-only
}
