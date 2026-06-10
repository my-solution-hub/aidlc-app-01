import axios, { type AxiosRequestConfig } from 'axios';
import type { Result } from '../types/api';

// ---- Business error ----

/**
 * Thrown when the backend returns a non-success business code.
 * Callers can catch this to show user-friendly error messages.
 */
export class BusinessError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'BusinessError';
  }
}

// ---- Constants ----

const SUCCESS_CODE = 'SUCCESS';
const TOKEN_KEY = 'token';

// ---- Axios instance ----

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
});

// Request interceptor — inject JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap Result<T> and handle errors
instance.interceptors.response.use(
  (response) => {
    const result = response.data as Result;

    // If the response doesn't follow Result<T> pattern, return as-is
    if (result.code === undefined) {
      return response.data;
    }

    // Business success — unwrap and return data directly
    if (result.code === SUCCESS_CODE) {
      return result.data;
    }

    // Business error
    return Promise.reject(new BusinessError(result.code, result.message || '请求失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ---- Typed request helpers ----

/**
 * Generic request helper. After the response interceptor unwraps Result<T>,
 * callers receive T directly with full type safety.
 *
 * @example
 *   const user = await request.post<LoginResponse>('/auth/api/v1/public/auth/login', body);
 *   // user is typed as LoginResponse
 */
const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config) as Promise<T>;
  },

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config) as Promise<T>;
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config) as Promise<T>;
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config) as Promise<T>;
  },
};

export default request;
