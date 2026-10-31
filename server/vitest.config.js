import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    reporters: ['verbose'],
    // These env vars are injected BEFORE any test module is imported.
    // dotenv.config() in env.js will not overwrite vars already present in process.env,
    // so these test values take precedence over any .env file.
    env: {
      NODE_ENV: 'test',
      PORT: '5001',
      MONGODB_URI: 'mongodb://localhost:27017/student-doubt-forum-test',
      JWT_ACCESS_SECRET: 'test-access-secret-32-characters-min!!',
      JWT_REFRESH_SECRET: 'test-refresh-secret-32-characters-min!',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      CLIENT_ORIGIN: 'http://localhost:5173',
      EMAIL_FROM: 'test@doubtforum.local',
    },
    // Setup files (in-memory Mongo, etc.)
    setupFiles: ['./tests/setup.js'],
    // Isolate test files from each other — each file gets its own module instance
    isolate: true,
    // Increase timeout for DB operations
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
