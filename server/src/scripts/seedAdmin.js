/**
 * Admin Seed Script
 *
 * Creates the first administrator account using credentials from environment variables.
 * Run ONCE to bootstrap the platform. After running, remove or rotate ADMIN_SEED_* vars.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Required environment variables (set in server/.env):
 *   ADMIN_SEED_EMAIL      — email address for the admin account
 *   ADMIN_SEED_PASSWORD   — password (must meet password strength requirements)
 *   ADMIN_SEED_NAME       — display name for the admin
 *
 * This script will NOT overwrite an existing account with the same email.
 * It ONLY sets role: 'admin' — it cannot be triggered through any API endpoint.
 */

// Load env first (critical — do not move below other imports)
import '../config/env.js';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';

async function seedAdmin() {
  const { ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, ADMIN_SEED_NAME } = env;

  if (!ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD || !ADMIN_SEED_NAME) {
    console.error('❌  Missing required seed variables:');
    console.error('   ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, and ADMIN_SEED_NAME must all be set in .env');
    process.exit(1);
  }

  const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRequirements.test(ADMIN_SEED_PASSWORD)) {
    console.error('❌  ADMIN_SEED_PASSWORD does not meet requirements:');
    console.error('   At least 8 characters, one uppercase, one lowercase, one number');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: ADMIN_SEED_EMAIL.toLowerCase().trim() });

  if (existing) {
    console.log(`ℹ️   Account already exists for ${ADMIN_SEED_EMAIL}`);
    console.log(`    Current role: ${existing.role}`);

    if (existing.role !== 'admin') {
      console.log('    Promoting to admin...');
      existing.role = 'admin';
      await existing.save();
      console.log('✅  Account promoted to admin');
    } else {
      console.log('    Already an admin — nothing to do');
    }

    await disconnectDB();
    return;
  }

  const admin = await User.create({
    name: ADMIN_SEED_NAME,
    email: ADMIN_SEED_EMAIL.toLowerCase().trim(),
    passwordHash: ADMIN_SEED_PASSWORD, // pre-save hook will bcrypt
    role: 'admin',
    isEmailVerified: true, // Admin accounts are pre-verified
    status: 'active',
  });

  console.log('\n✅  Admin account created successfully');
  console.log(`    Name:  ${admin.name}`);
  console.log(`    Email: ${admin.email}`);
  console.log(`    Role:  ${admin.role}`);
  console.log('\n⚠️   IMPORTANT: Remove ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from your .env now.');
  console.log('    They are no longer needed and their presence is a security risk.\n');

  await disconnectDB();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
