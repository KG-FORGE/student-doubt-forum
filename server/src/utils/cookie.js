import { env } from '../config/env.js';

const COOKIE_NAME = 'refresh_token';

/** Number of milliseconds in 7 days */
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Set the refresh token HttpOnly cookie.
 * @param {import('express').Response} res
 * @param {string} rawToken  The plaintext refresh token (NOT the hash)
 */
export function setRefreshCookie(res, rawToken) {
  res.cookie(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/api/auth',  // Only sent to /api/auth/* endpoints, reducing exposure
  });
}

/**
 * Clear the refresh token cookie (logout).
 * @param {import('express').Response} res
 */
export function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth',
  });
}

/**
 * Read the refresh token from the request cookie.
 * @param {import('express').Request} req
 * @returns {string|undefined}
 */
export function getRefreshFromCookie(req) {
  return req.cookies?.[COOKIE_NAME];
}

export { COOKIE_NAME };
