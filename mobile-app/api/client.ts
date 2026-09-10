import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Dynamically grab the local network IP from Expo Go during development
const debuggerHost = Constants?.expoConfig?.hostUri;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

export const API_URL = `http://${hostIp}:5001/api`;

console.log(`\n========================================`);
console.log(`🔌 MOBILE APP API CONFIGURED FOR:`);
console.log(`👉 ${API_URL}`);
console.log(`========================================\n`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
