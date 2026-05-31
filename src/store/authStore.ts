import { create } from 'zustand';
import { tunnelConfig } from '../lib/tunnelConfig';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'Team Lead' | 'Manager' | 'Admin';
  department: string;
  avatar: string;
  joinedDate: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, token) => {
    localStorage.setItem('synergyai_token', token);
    localStorage.setItem('synergyai_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('synergyai_token');
    localStorage.removeItem('synergyai_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: true });
    triggerAutoLogin();
  },
  setLoading: (isLoading) => set({ isLoading })
}));

const getBackendUrl = () => {
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



async function triggerAutoLogin() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify({ email: 'admin@synergyai.com', password: 'password123' })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('synergyai_token', data.token);
      localStorage.setItem('synergyai_user', JSON.stringify(data.user));
      useAuthStore.setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  } catch (e) {
    console.error('Auto login failed:', e);
    useAuthStore.setState({ isLoading: false });
  }
}

// Initialize store from localStorage in browser environment
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('synergyai_token');
  const userStr = localStorage.getItem('synergyai_user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      localStorage.removeItem('synergyai_token');
      localStorage.removeItem('synergyai_user');
      triggerAutoLogin();
    }
  } else {
    triggerAutoLogin();
  }
}

