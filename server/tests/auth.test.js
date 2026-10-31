/**
 * Phase 2 — Authentication API tests
 *
 * These tests require a running MongoDB instance.
 * The test DB is: student-doubt-forum-test (set in vitest.config.js)
 * Each test file connects fresh and disconnects on teardown.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import RefreshToken from '../src/models/RefreshToken.js';

const TEST_USER = {
  name: 'Test Student',
  email: 'student@test.example.com',
  password: 'TestPass123',
  confirmPassword: 'TestPass123',
};

const ADMIN_USER = {
  name: 'Test Admin',
  email: 'admin@test.example.com',
  password: 'AdminPass123',
  confirmPassword: 'AdminPass123',
};

async function registerUser(data = TEST_USER) {
  return request(app).post('/api/auth/register').send(data);
}

async function loginUser(email = TEST_USER.email, password = TEST_USER.password) {
  return request(app).post('/api/auth/login').send({ email, password });
}

// ── Setup / Teardown ───────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  // Clean up test data and disconnect
  try {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ email: /@test\.example\.com$/ });
      await RefreshToken.deleteMany({});
    }
  } catch (_) {}
  await disconnectDB();
});

beforeEach(async () => {
  // Clean slate for each test
  await User.deleteMany({ email: /@test\.example\.com$/ });
  await RefreshToken.deleteMany({});
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a student account and returns access token', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.email).toBe(TEST_USER.email);
  });

  it('sets an HttpOnly refresh token cookie', async () => {
    const res = await registerUser();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeTruthy();
    const refreshCookie = cookies.find((c) => c.includes('refresh_token'));
    expect(refreshCookie).toBeTruthy();
    expect(refreshCookie).toMatch(/HttpOnly/i);
  });

  it('SECURITY: never returns password hash in response', async () => {
    const res = await registerUser();

    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toMatch(/passwordHash/i);
    expect(bodyStr).not.toMatch(/bcrypt/i);
    expect(bodyStr).not.toMatch(/\$2[ab]\$/); // bcrypt hash prefix
  });

  it('SECURITY: always assigns student role regardless of body payload', async () => {
    // Attacker tries to register as admin
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('student');
  });

  it('SECURITY: teacher role cannot be self-assigned via registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, role: 'teacher' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('student');
  });

  it('rejects duplicate email', async () => {
    await registerUser();
    const res = await registerUser(); // second registration with same email
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'incomplete@test.example.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects weak password (no uppercase)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...TEST_USER,
      password: 'weakpassword1',
      confirmPassword: 'weakpassword1',
    });
    expect(res.status).toBe(400);
  });

  it('rejects mismatched confirm password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...TEST_USER,
      confirmPassword: 'DifferentPass123',
    });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...TEST_USER,
      email: 'not-an-email',
    });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser(); // Create the user
  });

  it('returns access token and sets refresh cookie on valid credentials', async () => {
    const res = await loginUser();

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.headers['set-cookie']).toBeTruthy();
  });

  it('SECURITY: uses generic error message for wrong password', async () => {
    const res = await loginUser(TEST_USER.email, 'WrongPass123');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('SECURITY: uses generic error message for non-existent email', async () => {
    const res = await loginUser('nobody@test.example.com', 'AnyPass123');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('SECURITY: never reveals password hash in error response', async () => {
    const res = await loginUser(TEST_USER.email, 'wrong');
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toMatch(/passwordHash/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns current user for valid access token', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const { accessToken } = loginRes.body.data;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_USER.email);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.jwt.token');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('clears the refresh cookie', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const { accessToken } = loginRes.body.data;
    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    // Cookie should be cleared (max-age=0 or expires in past)
    const setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader) {
      const refreshCookie = setCookieHeader.find((c) => c.includes('refresh_token'));
      if (refreshCookie) {
        // Cleared cookie has max-age=0 or expires in the past
        const isCleared =
          refreshCookie.includes('Max-Age=0') ||
          refreshCookie.includes('max-age=0') ||
          refreshCookie.includes('Expires=Thu, 01 Jan 1970');
        expect(isCleared).toBe(true);
      }
    }
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('issues new access token from valid refresh cookie', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    // New refresh cookie should be set (rotation)
    expect(res.headers['set-cookie']).toBeTruthy();
  });

  it('SECURITY: detects refresh token reuse and revokes family', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const originalCookies = loginRes.headers['set-cookie'];

    // Use refresh token once (valid rotation)
    const firstRefresh = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', originalCookies);
    expect(firstRefresh.status).toBe(200);

    // Try to reuse the ORIGINAL (now consumed) refresh token → should be rejected
    const reuseAttempt = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', originalCookies); // Same old cookies

    expect(reuseAttempt.status).toBe(401);

    // The new token (from first rotation) should also be revoked (family revoked)
    const newCookies = firstRefresh.headers['set-cookie'];
    const familyRevoked = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', newCookies);
    expect(familyRevoked.status).toBe(401);
  });

  it('returns 401 with no cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('SECURITY — Suspended accounts', () => {
  it('prevents login for suspended users', async () => {
    await registerUser();
    // Suspend directly in DB
    await User.findOneAndUpdate(
      { email: TEST_USER.email },
      { status: 'suspended' },
    );

    const res = await loginUser();
    expect(res.status).toBe(403);
  });

  it('invalidates access to protected routes for suspended users', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const { accessToken } = loginRes.body.data;

    // Suspend after login (mid-session)
    await User.findOneAndUpdate(
      { email: TEST_USER.email },
      { status: 'suspended' },
    );

    // Next request with still-valid access token should be rejected
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
  });
});
