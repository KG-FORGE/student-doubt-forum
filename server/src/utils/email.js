import nodemailer from 'nodemailer';
import { env, isEmailConfigured } from '../config/env.js';

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  return _transporter;
}

/**
 * Send an email. Returns true on success, false when email is not configured.
 *
 * When email is not configured:
 *   - In development: logs the email content to the console.
 *   - In production: logs a warning and returns false (caller should handle gracefully).
 *
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 * @returns {Promise<boolean>} true if sent (or dev-logged), false if not configured
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!isEmailConfigured) {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      console.log('\n📧  [EMAIL NOT CONFIGURED — Dev/Test log]');
      console.log(`   To:      ${to}`);
      console.log(`   Subject: ${subject}`);
      if (text) console.log(`   Body:    ${text}`);
      console.log('');
    } else {
      console.warn('⚠️  Email not configured — skipping delivery:', { to, subject });
    }
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>/g, ''), // strip HTML tags as plain-text fallback
    });
    return true;
  } catch (err) {
    console.error('Email delivery failed:', err.message);
    return false;
  }
}

/**
 * Send a verification email.
 * @param {{ to: string, name: string, token: string, baseUrl: string }} opts
 */
export async function sendVerificationEmail({ to, name, token, baseUrl }) {
  const link = `${baseUrl}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify your DoubtForum account',
    html: `
      <h2>Hello, ${name}!</h2>
      <p>Welcome to DoubtForum. Please verify your email address to activate your account.</p>
      <p><a href="${link}" style="padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a></p>
      <p>Or copy this link: ${link}</p>
      <p>This link expires in 24 hours. If you did not register, you can safely ignore this email.</p>
    `,
    text: `Hello, ${name}!\n\nVerify your email: ${link}\n\nThis link expires in 24 hours.`,
  });
}

/**
 * Send a password reset email.
 * @param {{ to: string, name: string, token: string, baseUrl: string }} opts
 */
export async function sendPasswordResetEmail({ to, name, token, baseUrl }) {
  const link = `${baseUrl}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset your DoubtForum password',
    html: `
      <h2>Hello, ${name}!</h2>
      <p>You requested a password reset for your DoubtForum account.</p>
      <p><a href="${link}" style="padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>Or copy this link: ${link}</p>
      <p>This link expires in 1 hour and can only be used once. If you did not request a reset, you can safely ignore this email.</p>
    `,
    text: `Hello, ${name}!\n\nReset your password: ${link}\n\nThis link expires in 1 hour.`,
  });
}
