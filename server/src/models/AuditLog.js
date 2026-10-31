import mongoose from 'mongoose';

/**
 * AuditLog model.
 * Records sensitive administrative actions.
 * - Documents are append-only (never updated after creation).
 * - actor/target fields store IDs only (no embedded user data that could become stale).
 * - metadata must never contain passwords, tokens, or raw PII.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        'role_change',
        'account_suspended',
        'account_reactivated',
        'content_removed',
        'content_restored',
        'report_resolved',
        'report_dismissed',
        'admin_created',
        'announcement_published',
        'subject_created',
        'subject_deactivated',
        'password_reset_issued',
        'email_verified',
      ],
    },

    targetType: {
      type: String,
      enum: ['User', 'Question', 'Answer', 'Report', 'Subject', 'Announcement'],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    /** Safe, non-sensitive context about what changed. */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    // Audit logs should never be modified
    // (enforced at controller level — no update routes)
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
