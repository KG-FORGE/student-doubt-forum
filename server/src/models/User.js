import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // normalise on save
      maxlength: [254, 'Email is too long'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // Never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },

    // ── Profile ──────────────────────────────────────────────────────────────
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio must be at most 500 characters'],
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    subject: {
      // For teachers: their primary subject area
      type: String,
      trim: true,
      maxlength: [100, ''],
      default: '',
    },

    // ── Reputation ────────────────────────────────────────────────────────────
    reputation: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Email verification ─────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ── Password reset ──────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── Account status ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    suspendedAt: {
      type: Date,
    },
    suspendedReason: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    // Remove passwordHash when converting to JSON (belt + suspenders with select: false)
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.suspendedReason;
        return ret;
      },
    },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// ── Password hashing middleware ───────────────────────────────────────────────
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  // passwordHash field stores the plaintext temporarily before this hook runs.
  // The hook hashes it and replaces the value before it's persisted.
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
/**
 * Compare a candidate plaintext password against the stored hash.
 * Must select passwordHash explicitly: User.findOne(...).select('+passwordHash')
 */
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

/**
 * Returns a safe public profile object — no sensitive fields.
 */
userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    subject: this.subject,
    reputation: this.reputation,
    isEmailVerified: this.isEmailVerified,
    status: this.status,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
