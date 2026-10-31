/**
 * Centralized Axios instance.
 *
 * - All requests go to /api/* (proxied to Express in development via vite.config.js)
 * - Attaches the access token from memory automatically
 * - Intercepts 401 responses and attempts token refresh
 * - On refresh failure, clears auth state and redirects to login
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Include cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Access token stored in module scope (in-memory, not localStorage) ─────────
let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Response interceptor — handle 401 with token refresh ─────────────────────
let _isRefreshing = false;
let _refreshSubscribers = [];

function onRefreshed(newToken) {
  _refreshSubscribers.forEach((cb) => cb(newToken));
  _refreshSubscribers = [];
}

function onRefreshFailed() {
  _refreshSubscribers.forEach((cb) => cb(null));
  _refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that aren't themselves the refresh or login request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (_isRefreshing) {
        // Queue the request to retry after refresh completes
        return new Promise((resolve, reject) => {
          _refreshSubscribers.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (_refreshError) {
        clearAccessToken();
        onRefreshFailed();
        // Redirect to login — import is deferred to avoid circular dependency
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
