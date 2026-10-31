import { verifyAccessToken } from '../utils/jwt.js';
import { createError } from './errorHandler.js';
import User from '../models/User.js';

/**
 * authenticate middleware
 * Reads the Bearer token from the Authorization header, verifies it,
 * loads the user from DB (without passwordHash), and attaches them to req.user.
 *
 * Rejects:
 *   - Missing or malformed Authorization header
 *   - Invalid or expired access tokens
 *   - Suspended accounts
 *   - Non-existent users (deleted after token was issued)
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(createError(401, 'Authentication required'));
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    const payload = verifyAccessToken(token);

    // Re-fetch user on every request to catch role/status changes mid-session
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return next(createError(401, 'User account not found'));
    }

    if (user.status === 'suspended') {
      return next(createError(403, 'Your account has been suspended'));
    }

    // Attach safe user object to the request
    req.user = {
      _id: user._id.toString(),
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (err) {
    // jwt.verify throws JsonWebTokenError or TokenExpiredError — handled by errorHandler
    next(err);
  }
}

/**
 * optionalAuthenticate middleware
 * Like authenticate, but does NOT fail if no token is provided.
 * Attaches req.user if authenticated, leaves it undefined otherwise.
 */
export async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // Not authenticated — that's OK
  }

  return authenticate(req, res, next);
}
