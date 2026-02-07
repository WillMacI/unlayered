import { getApiUrl } from '../config/api';

// Types
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  progress?: number;
  error?: string;
}

export interface SeparationResult {
  job_id: string;
  tracks: Record<string, string | null>; // stem name -> relative path (null if not available)
  metadata?: {
    duration?: number;
    sample_rate?: number;
  };
}

export interface SystemCapabilities {
  gpu_available: boolean;
  gpu_name?: string;
  cuda_version?: string;
  recommended_quality: number;
  max_quality: number;
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

// API Functions
export async function fetchCapabilities(): Promise<SystemCapabilities> {
  const response = await fetch(getApiUrl('capabilities'));
  if (!response.ok) {
    throw new Error(`Failed to fetch capabilities: ${response.statusText}`);
  }
  return response.json();
}

export async function uploadFile(file: File, quality: number): Promise<JobResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality.toString());

  const response = await fetch(getApiUrl('upload'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobResponse> {
  const response = await fetch(getApiUrl('status', jobId));
  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }
  return response.json();
}

export async function getJobResult(jobId: string): Promise<SeparationResult> {
  const response = await fetch(getApiUrl('result', jobId));
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
  return capabilities.recommended_quality;
}
