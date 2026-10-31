/**
 * Environment configuration with Zod validation.
 * This module MUST be the first import in the application entry point.
 * It loads dotenv and validates all required variables before the app starts.
 */
import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file. Does NOT overwrite variables already set in process.env
// (e.g. variables set by vitest test.env, Docker, or deployment platforms).
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  // ── Server ────────────────────────────────────────────────────────────────
  PORT: z.coerce.number().int().min(1).max(65535).default(5001),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // ── Database ──────────────────────────────────────────────────────────────
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required. See .env.example.'),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(
      isProduction ? 64 : 8,
      `JWT_ACCESS_SECRET must be at least ${isProduction ? 64 : 8} characters`,
    ),
  JWT_REFRESH_SECRET: z
    .string()
    .min(
      isProduction ? 64 : 8,
      `JWT_REFRESH_SECRET must be at least ${isProduction ? 64 : 8} characters`,
    ),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),

  // ── Email (all optional) ──────────────────────────────────────────────────
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().int().default(587),
  EMAIL_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@doubtforum.local'),

  // ── Admin seed script (optional — only needed when running seedAdmin.js) ──
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  ADMIN_SEED_PASSWORD: z.string().optional(),
  ADMIN_SEED_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌  Invalid environment configuration:\n');
  parsed.error.errors.forEach((e) => {
    console.error(`   ${e.path.join('.')}: ${e.message}`);
  });
  console.error('\n   Copy server/.env.example to server/.env and fill in the required values.\n');
  process.exit(1);
}

export const env = parsed.data;

/**
 * True when all required SMTP variables are present.
 * Use this to conditionally enable email delivery.
 */
export const isEmailConfigured =
  Boolean(env.EMAIL_HOST) &&
  Boolean(env.EMAIL_USER) &&
  Boolean(env.EMAIL_PASS);
