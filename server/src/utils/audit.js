import AuditLog from '../models/AuditLog.js';

/**
 * Write an immutable audit log entry.
 * Errors are swallowed so a logging failure never breaks a user-facing request.
 *
 * @param {{
 *   actor: string|ObjectId,
 *   action: string,
 *   targetType?: string,
 *   targetId?: string|ObjectId,
 *   metadata?: object
 * }} entry
 */
export async function writeAuditLog({ actor, action, targetType, targetId, metadata = {} }) {
  try {
    await AuditLog.create({
      actor,
      action,
      targetType,
      targetId,
      metadata,
    });
  } catch (err) {
    // Log to stderr but do not propagate — audit failures must not block the operation
    console.error('AuditLog write failed:', err.message, { actor, action });
  }
}
