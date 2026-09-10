import { create } from 'zustand';
import api from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: any) => Promise<boolean>;
  signup: (payload: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<any>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', payload);
      const { token, ...userData } = res.data;
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      return false;
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', payload);
      const { token, ...userData } = res.data;
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Signup failed',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout'); // Tell backend to logout (optional)
    } catch (e) {
      // Ignore backend error on logout
    }
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    set({ user: null, token: null, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userDataStr = await SecureStore.getItemAsync('userData');
      if (token && userDataStr) {
        set({ token, user: JSON.parse(userDataStr), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, isLoading: false });
      await SecureStore.setItemAsync('userData', JSON.stringify(res.data));
      return res.data;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch profile',
      });
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        set({ user: null, token: null });
      }
      return null;
    }
  },
}));
