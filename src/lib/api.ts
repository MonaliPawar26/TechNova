import { tunnelConfig } from './tunnelConfig';

export const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return tunnelConfig.backendUrl;
    }
  }
  return 'http://localhost:5001';
};

const BASE_URL = `${getBackendUrl()}/api`;

export const fetchApi = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('synergyai_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBackendUrl()}/api${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const getBaseUrl = () => {
  return getBackendUrl();
};
