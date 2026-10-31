import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Persistent refresh token record.
 *
 * Architecture:
 *  - Each login creates one RefreshToken document.
 *  - The raw token is returned to the client once (in an HttpOnly cookie).
 *  - Only the SHA-256 hash is stored here — the raw token is never persisted.
 *  - Token rotation: each use of a refresh token issues a new token and marks
 *    the old one as used (isUsed: true).
 *  - Reuse detection: tokens share a `family` UUID. If a used token is
 *    presented again, ALL tokens in that family are immediately revoked,
 *    indicating a possible token theft.
 *  - TTL index: MongoDB automatically removes expired documents.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /** SHA-256 hash of the raw refresh token. */
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },

    /**
     * Token family UUID.
     * All rotated tokens for a single login session share the same family.
     * Reuse of a consumed token triggers revocation of the entire family.
     */
    family: {
      type: String,
      required: true,
      index: true,
    },

    /** True when this token has already been exchanged for a new one. */
    isUsed: {
      type: Boolean,
      default: false,
    },

    /** True when this token has been explicitly revoked (logout, suspension, etc.). */
    isRevoked: {
      type: Boolean,
      default: false,
    },

    /** MongoDB TTL index — documents are automatically removed after this date. */
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB removes doc when expiresAt is past
    },

    /** Metadata for audit and debugging — never contains sensitive data. */
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// ── Static helpers ─────────────────────────────────────────────────────────────

/**
 * Hash a raw refresh token using SHA-256.
 * @param {string} rawToken
 * @returns {string}
 */
refreshTokenSchema.statics.hashToken = function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Generate a cryptographically random raw refresh token (256-bit / 32 bytes).
 * @returns {string} hex-encoded token
 */
refreshTokenSchema.statics.generateRaw = function generateRaw() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Revoke all refresh tokens belonging to a token family.
 * Called when token reuse is detected.
 * @param {string} family
 */
refreshTokenSchema.statics.revokeFamily = async function revokeFamily(family) {
  await this.updateMany({ family }, { $set: { isRevoked: true } });
};

/**
 * Revoke all active refresh tokens for a user.
 * Called on logout, password change, or account suspension.
 * @param {string|ObjectId} userId
 */
refreshTokenSchema.statics.revokeAllForUser = async function revokeAllForUser(userId) {
  await this.updateMany({ user: userId }, { $set: { isRevoked: true } });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
