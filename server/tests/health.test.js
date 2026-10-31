/**
 * Phase 1 — Health check and foundation tests.
 * These tests do NOT require a database connection.
 * The app is imported directly; supertest creates an in-process HTTP server.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/health', () => {
  it('returns 200 with success: true and expected fields', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment', 'test');
    expect(res.body).toHaveProperty('db'); // 'disconnected' is acceptable here
    expect(res.body).toHaveProperty('version');
  });

  it('returns a valid ISO 8601 timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('returns JSON for unknown routes (not HTML)', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('CORS headers', () => {
  it('includes Access-Control-Allow-Origin for the configured client origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    // When cors() matches the origin, it echoes it back
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

describe('Security headers (Helmet)', () => {
  it('includes X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
