import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';

const router = Router();

// ── Public routes (rate limited) ───────────────────────────────────────────────
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);           // Cookie-based — no Bearer token
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// ── Authenticated routes ───────────────────────────────────────────────────────
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/resend-verification', authenticate, resendVerification);
router.put('/change-password', authenticate, changePassword);

export default router;
