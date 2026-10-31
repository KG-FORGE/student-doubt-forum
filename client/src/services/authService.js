import api from './api.js';

/**
 * Register a new student account.
 * Role is always assigned server-side — do not pass a role field.
 */
export function register(data) {
  return api.post('/auth/register', data);
}

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function logout() {
  return api.post('/auth/logout');
}

/** Exchange the HttpOnly refresh cookie for a new access token. */
export function refresh() {
  return api.post('/auth/refresh');
}

/** Get the currently authenticated user. */
export function getMe() {
  return api.get('/auth/me');
}

export function verifyEmail(token) {
  return api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export function resendVerification() {
  return api.post('/auth/resend-verification');
}

/** @param {string} email */
export function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

/** @param {{ token: string, password: string, confirmPassword: string }} data */
export function resetPassword(data) {
  return api.post('/auth/reset-password', data);
}

/** @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data */
export function changePassword(data) {
  return api.put('/auth/change-password', data);
}
