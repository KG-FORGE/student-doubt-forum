import { createError } from './errorHandler.js';

/**
 * authorize(...roles) → middleware
 *
 * Factory that returns a middleware enforcing role-based access control.
 * Must be used AFTER authenticate so req.user is populated.
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('admin'), deleteUser);
 *   router.put('/:id/verify', authenticate, authorize('admin', 'teacher'), verifyAnswer);
 *
 * @param {...string} roles  Allowed roles
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      // Should not reach here if authenticate is applied first
      return next(createError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, 'You do not have permission to perform this action'),
      );
    }

    next();
  };
}

/**
 * Shorthand middleware factories for common role checks.
 */
export const requireAdmin = authorize('admin');
export const requireTeacherOrAdmin = authorize('teacher', 'admin');
