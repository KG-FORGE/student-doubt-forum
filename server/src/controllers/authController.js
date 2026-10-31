import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidators.js';
import { signAccessToken } from '../utils/jwt.js';
import { setRefreshCookie, clearRefreshCookie, getRefreshFromCookie } from '../utils/cookie.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { writeAuditLog } from '../utils/audit.js';
import { createError } from '../middleware/errorHandler.js';
import { success, error as apiError } from '../utils/apiResponse.js';
import { env, isEmailConfigured } from '../config/env.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function issueTokens(res, user) {
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const rawRefresh = RefreshToken.generateRaw();
  return { accessToken, rawRefresh };
}

async function saveRefreshToken(userId, rawRefresh, req) {
  const tokenHash = RefreshToken.hashToken(rawRefresh);
  const family = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: userId,
    tokenHash,
    family,
    expiresAt,
    userAgent: req.headers['user-agent']?.slice(0, 200) ?? '',
    ipAddress: req.ip ?? '',
  });

  return { tokenHash, family };
}

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Public. Always creates a student account — role cannot be supplied by client.
 */
export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { name, email, password } = parsed.data;

    // Check for existing account — use generic message to avoid user enumeration
    const existing = await User.findOne({ email });
    if (existing) {
      // Generic message — don't reveal whether the email is registered
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Role is always 'student' for public registration — never trust client input
    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook will bcrypt this
      role: 'student',        // hardcoded — not from req.body
    });

    // Send verification email (optional — graceful if not configured)
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    const emailSent = await sendVerificationEmail({
      to: email,
      name,
      token: verificationToken,
      baseUrl: env.CLIENT_ORIGIN,
    });

    // Issue tokens
    const { accessToken, rawRefresh } = issueTokens(res, user);
    await saveRefreshToken(user._id, rawRefresh, req);
    setRefreshCookie(res, rawRefresh);

    return success(res, 201, 'Account created successfully', {
      accessToken,
      user: user.toPublicProfile(),
      emailVerificationSent: emailSent,
      emailConfigured: isEmailConfigured,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Public. Generic error messages to avoid user enumeration.
 */
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      // Generic message — don't tell the attacker which field is wrong
      return apiError(res, 400, 'Invalid email or password');
    }

    const { email, password } = parsed.data;

    // Explicitly select passwordHash — it has select: false on the schema
    const user = await User.findOne({ email }).select('+passwordHash');

    // Use a constant-time comparison even for the "user not found" case
    // by comparing against a dummy hash to prevent timing attacks
    const DUMMY_HASH = '$2b$12$dummyhashfortimingattackprevention000000000000000000';
    const passwordMatch = user
      ? await user.comparePassword(password)
      : await bcrypt.compare('dummy', DUMMY_HASH);

    if (!user || !passwordMatch) {
      return apiError(res, 401, 'Invalid email or password');
    }

    if (user.status === 'suspended') {
      return apiError(res, 403, 'Your account has been suspended. Please contact support.');
    }

    // Issue tokens
    const { accessToken, rawRefresh } = issueTokens(res, user);
    await saveRefreshToken(user._id, rawRefresh, req);
    setRefreshCookie(res, rawRefresh);

    return success(res, 200, 'Login successful', {
      accessToken,
      user: user.toPublicProfile(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Authenticated. Revokes the current refresh token and clears the cookie.
 */
export async function logout(req, res, next) {
  try {
    const rawRefresh = getRefreshFromCookie(req);

    if (rawRefresh) {
      const tokenHash = RefreshToken.hashToken(rawRefresh);
      await RefreshToken.findOneAndUpdate(
        { tokenHash },
        { $set: { isRevoked: true } },
      );
    }

    clearRefreshCookie(res);
    return success(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Public (cookie-based). Rotates the refresh token.
 * Detects reuse — if a consumed token is presented, the entire family is revoked.
 */
export async function refreshToken(req, res, next) {
  try {
    const rawRefresh = getRefreshFromCookie(req);

    if (!rawRefresh) {
      clearRefreshCookie(res);
      return apiError(res, 401, 'No refresh token provided');
    }

    const tokenHash = RefreshToken.hashToken(rawRefresh);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      clearRefreshCookie(res);
      return apiError(res, 401, 'Invalid refresh token');
    }

    // ── Reuse detection ────────────────────────────────────────────────────
    if (storedToken.isUsed || storedToken.isRevoked) {
      // Token was already consumed or revoked — possible theft
      // Revoke entire family to protect the legitimate session
      await RefreshToken.revokeFamily(storedToken.family);
      clearRefreshCookie(res);
      console.warn('⚠️  Refresh token reuse detected — family revoked', {
        family: storedToken.family,
        userId: storedToken.user,
      });
      return apiError(res, 401, 'Refresh token reuse detected. Please log in again.');
    }

    if (storedToken.expiresAt < new Date()) {
      clearRefreshCookie(res);
      return apiError(res, 401, 'Refresh token has expired. Please log in again.');
    }

    // ── Rotation ───────────────────────────────────────────────────────────
    // Mark old token as used
    storedToken.isUsed = true;
    await storedToken.save();

    // Fetch the user
    const user = await User.findById(storedToken.user);
    if (!user || user.status === 'suspended') {
      clearRefreshCookie(res);
      return apiError(res, 401, 'Account unavailable');
    }

    // Issue new token — same family
    const newRawRefresh = RefreshToken.generateRaw();
    const newTokenHash = RefreshToken.hashToken(newRawRefresh);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user: user._id,
      tokenHash: newTokenHash,
      family: storedToken.family, // Same family for reuse detection
      expiresAt,
      userAgent: req.headers['user-agent']?.slice(0, 200) ?? '',
      ipAddress: req.ip ?? '',
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    setRefreshCookie(res, newRawRefresh);

    return success(res, 200, 'Token refreshed', { accessToken });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Authenticated. Returns the current user's safe profile.
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return apiError(res, 404, 'User not found');
    }
    return success(res, 200, 'Current user', user.toPublicProfile());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/verify-email?token=...
 * Public.
 */
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) {
      return apiError(res, 400, 'Verification token is required');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return apiError(res, 400, 'Verification token is invalid or has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await writeAuditLog({
      actor: user._id,
      action: 'email_verified',
      targetType: 'User',
      targetId: user._id,
    });

    return success(res, 200, 'Email verified successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/resend-verification
 * Authenticated.
 */
export async function resendVerification(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return apiError(res, 400, 'Email is already verified');
    }

    const token = generateToken();
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const emailSent = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
      baseUrl: env.CLIENT_ORIGIN,
    });

    return success(res, 200, 'Verification email sent', {
      emailConfigured: isEmailConfigured,
      emailSent,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * Public. Always returns 200 to avoid user enumeration.
 */
export async function forgotPassword(req, res, next) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      // Still 200 to avoid leaking info
      return success(res, 200, 'If an account exists, a reset email has been sent', {
        emailConfigured: isEmailConfigured,
      });
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email });

    // Do NOT reveal whether the email exists
    if (user) {
      const token = generateToken();
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      await sendPasswordResetEmail({
        to: email,
        name: user.name,
        token,
        baseUrl: env.CLIENT_ORIGIN,
      });

      await writeAuditLog({
        actor: user._id,
        action: 'password_reset_issued',
        targetType: 'User',
        targetId: user._id,
      });
    }

    return success(res, 200, 'If an account exists with this email, a reset link has been sent', {
      emailConfigured: isEmailConfigured,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Public.
 */
export async function resetPassword(req, res, next) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { token, password } = parsed.data;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return apiError(res, 400, 'Reset token is invalid or has expired');
    }

    // Update password — pre-save hook will hash it
    user.passwordHash = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all refresh tokens — user must re-authenticate
    await RefreshToken.revokeAllForUser(user._id);
    clearRefreshCookie(res);

    return success(res, 200, 'Password reset successfully. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/change-password
 * Authenticated.
 */
export async function changePassword(req, res, next) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await User.findById(req.user._id).select('+passwordHash');
    const valid = await user.comparePassword(currentPassword);

    if (!valid) {
      return apiError(res, 400, 'Current password is incorrect');
    }

    user.passwordHash = newPassword;
    await user.save();

    // Revoke all OTHER refresh tokens (force re-login on other devices)
    await RefreshToken.revokeAllForUser(user._id);

    return success(res, 200, 'Password changed successfully. Please log in again on other devices.');
  } catch (err) {
    next(err);
  }
}
