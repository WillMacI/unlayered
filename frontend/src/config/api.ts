// Use environment variable or default to localhost for development
const getBaseUrl = (): string => {
  // Check for Vite env var first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default for local development
  return 'http://127.0.0.1:8000';
};

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  endpoints: {
    capabilities: '/api/separate/capabilities',
    upload: '/api/separate/upload',
    status: '/api/separate/status',
    result: '/api/separate/result',
    download: '/api/separate/download',
    history: '/api/separate/history',
  },
  pollingInterval: 1000,
} as const;

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.endpoints, ...params: string[]): string => {
  const path = API_CONFIG.endpoints[endpoint];
  if (params.length > 0) {
    const encodedParams = params.map((param) => encodeURIComponent(param)).join('/');
    return `${API_CONFIG.baseUrl}${path}/${encodedParams}`;
  }
  return `${API_CONFIG.baseUrl}${path}`;
};
