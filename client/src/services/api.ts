import axios from 'axios';
import { convertDatesToUTC, convertDatesFromUTC } from '../utils/timezone';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Add auth token
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }

    // Convert all dates in request body to UTC
    if (config.data) {
      config.data = convertDatesToUTC(config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and convert dates from UTC
api.interceptors.response.use(
  (response) => {
    // Convert all dates in response data from UTC to local timezone
    if (response.data) {
      response.data = convertDatesFromUTC(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API functions
export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string;
  date_of_birth?: string;
  turnstileToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
  turnstileToken?: string;
}

export const authAPI = {
  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};
