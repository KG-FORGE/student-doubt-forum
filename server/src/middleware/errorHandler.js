import { ZodError } from 'zod';
import { env } from '../config/env.js';

/**
 * Central Express error handler.
 * Must be registered LAST with app.use() — after all routes.
 * Translates known error types into consistent API responses and
 * never leaks stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // ── Zod validation error ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // ── Mongoose document validation error ───────────────────────────────────
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // ── Mongoose duplicate key (unique index violation) ───────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return res.status(409).json({
      success: false,
      message: `${field} is already in use`,
    });
  }

  // ── Mongoose CastError (invalid ObjectId format) ──────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
    });
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired' });
  }

  // ── Application errors (thrown with createError) ──────────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ── Unknown / unexpected error ────────────────────────────────────────────
  console.error('Unhandled server error:', {
    url: req.url,
    method: req.method,
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    // Only expose stack trace in development
    ...(env.NODE_ENV === 'development' && { detail: err.message }),
  });
}

/**
 * Create a typed application error that the central handler will interpret.
 * @param {number} statusCode HTTP status code
 * @param {string} message Error message (safe to expose to clients)
 * @returns {Error}
 */
export function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
