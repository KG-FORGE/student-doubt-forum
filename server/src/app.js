import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { getDbStatus } from './config/db.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// In development, the Vite proxy forwards /api/* to this server so the
// browser never makes a cross-origin request directly. CORS is configured here
// for production deployments and direct API access (e.g. Postman, curl).
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true, // Required to allow cookies on cross-origin requests
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ── Root & Discovery routes ──────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Student Doubt Forum API',
    endpoints: {
      health: '/api/health',
      questions: '/api/questions',
      auth: '/api/auth',
      subjects: '/api/subjects',
    },
    clientApp: env.CLIENT_ORIGIN,
  });
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'Student Doubt Forum API',
    endpoints: {
      health: '/api/health',
      questions: '/api/questions',
      answers: '/api/answers',
      votes: '/api/votes',
      bookmarks: '/api/bookmarks',
      subjects: '/api/subjects',
      notifications: '/api/notifications',
      admin: '/api/admin',
    },
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    db: getDbStatus(),
    version: '1.0.0',
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.js';
import subjectsRoutes from './routes/subjects.js';
import questionsRoutes from './routes/questions.js';
import answersRoutes from './routes/answers.js';
import votesRoutes from './routes/votes.js';
import bookmarksRoutes from './routes/bookmarks.js';
import reportsRoutes from './routes/reports.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/questions/:questionId/answers', answersRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ── Central error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
