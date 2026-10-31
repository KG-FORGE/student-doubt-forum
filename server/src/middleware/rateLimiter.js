import rateLimit from 'express-rate-limit';

const rateLimitResponse = (message) => ({
  success: false,
  message,
});

/**
 * Global rate limiter — applied to all /api routes.
 * 200 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: rateLimitResponse('Too many requests. Please slow down and try again later.'),
});

/**
 * Auth rate limiter — applied to login, register, forgot-password, reset-password.
 * 15 attempts per 15 minutes per IP. Does not skip failed requests.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  skipSuccessfulRequests: false,
  message: rateLimitResponse(
    'Too many authentication attempts. Please wait 15 minutes before trying again.',
  ),
});
