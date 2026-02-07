export const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  endpoints: {
    capabilities: '/api/capabilities',
    upload: '/api/separate/upload',
    status: '/api/separate/status',
    result: '/api/separate/result',
    download: '/api/separate/download',
  },
  pollingInterval: 1000,
} as const;

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.endpoints, ...params: string[]): string => {
  const path = API_CONFIG.endpoints[endpoint];
  if (params.length > 0) {
    return `${API_CONFIG.baseUrl}${path}/${params.join('/')}`;
  }
  return `${API_CONFIG.baseUrl}${path}`;
};
