import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { LoginResponse, Result } from "../types/api";

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
    this.name = "BusinessError";
  }
}

// ---- Constants ----

const SUCCESS_CODE = "SUCCESS";
const TOKEN_KEY = "token";
const REFRESH_URL = "/api/auth/refresh";
const LOGIN_URL = "/api/auth/login";

// Extend the request config with a retry marker so a request that already
// went through one refresh+retry cycle is never retried again (prevents
// infinite loops).
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ---- Axios instance ----

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8088",
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

// ---- Token refresh (concurrency-safe) ----

/**
 * Holds the in-flight refresh request so that concurrent 401s share a single
 * refresh call instead of each firing their own. Reset to null once settled.
 */
let refreshPromise: Promise<string> | null = null;

/**
 * Exchange the (expired) token for a new one via POST /api/auth/refresh.
 * Done inline with the axios instance — NOT via services/api/auth.ts — to
 * avoid a circular import (auth.ts imports this module).
 * The response interceptor unwraps Result<T>, so the resolved value is the
 * LoginResponse payload directly.
 */
function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = instance
      .post(REFRESH_URL)
      .then((data) => {
        const res = data as unknown as LoginResponse;
        if (!res?.token) {
          throw new Error("Refresh response missing token");
        }
        localStorage.setItem(TOKEN_KEY, res.token);
        return res.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function clearAuthAndRedirect() {
  // Clear both the JWT and the zustand-persisted auth flag, otherwise
  // /login redirects the user straight back to / via the
  // isAuthenticated useEffect, looping forever.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("auth-storage");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

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
    return Promise.reject(
      new BusinessError(result.code, result.message || "请求失败"),
    );
  },
  async (error) => {
    const originalConfig = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && originalConfig && !originalConfig._retry) {
      const url = originalConfig.url || "";
      const token = localStorage.getItem(TOKEN_KEY);
      // Never try to refresh for the auth endpoints themselves — a 401 on
      // /refresh or /login means the session is truly gone.
      const isAuthEndpoint =
        url.includes(REFRESH_URL) || url.includes(LOGIN_URL);

      if (token && !isAuthEndpoint) {
        originalConfig._retry = true;
        try {
          const newToken = await refreshAccessToken();
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalConfig);
        } catch {
          clearAuthAndRedirect();
          return Promise.reject(error);
        }
      }

      // No token, or the auth endpoint itself returned 401 → give up.
      clearAuthAndRedirect();
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

  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return instance.post(url, data, config) as Promise<T>;
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config) as Promise<T>;
  },

  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return instance.patch(url, data, config) as Promise<T>;
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config) as Promise<T>;
  },
};

export default request;
