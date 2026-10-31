import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a short-lived access token.
 * @param {{ userId: string, role: string }} payload
 * @returns {string} signed JWT
 */
export function signAccessToken(payload) {
  return jwt.sign(
    {
      sub: payload.userId,
      role: payload.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: 'doubtforum',
      audience: 'doubtforum-client',
    },
  );
}

/**
 * Verify an access token.
 * @param {string} token
 * @returns {{ sub: string, role: string, iat: number, exp: number }}
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'doubtforum',
    audience: 'doubtforum-client',
  });
}

/**
 * Sign a refresh token JWT (carries only the session family — the raw token
 * is the sensitive value stored in the HttpOnly cookie).
 * NOTE: The actual refresh token stored in the DB is a random hex string;
 * this JWT is not used for refresh tokens. Instead we use crypto.randomBytes
 * (see RefreshToken model). This function is kept as a utility if needed.
 */
// (Refresh tokens are random hex — see RefreshToken model statics)
