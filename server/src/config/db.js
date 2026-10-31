import mongoose from 'mongoose';
import { env } from './env.js';

let _isConnected = false;
let _memoryServer = null;

async function seedDevData() {
  try {
    const User = (await import('../models/User.js')).default;
    const Subject = (await import('../models/Subject.js')).default;
    const Question = (await import('../models/Question.js')).default;

    const subjectCount = await Subject.countDocuments();
    if (subjectCount === 0) {
      await Subject.insertMany([
        { name: 'Computer Science', description: 'Core algorithms, OS, and system architectures', isActive: true },
        { name: 'Web Development', description: 'React, Node.js, CSS, and modern web frameworks', isActive: true },
        { name: 'Data Structures & Algorithms', description: 'Trees, graphs, dynamic programming, and complexity', isActive: true },
        { name: 'Mathematics', description: 'Discrete mathematics, calculus, and linear algebra', isActive: true },
      ]);
      console.log('🌱  Default subjects seeded');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const admin = await User.create({
        name: 'System Admin',
        email: 'admin@doubtforum.local',
        passwordHash: 'AdminPass123!',
        role: 'admin',
        isEmailVerified: true,
      });

      const teacher = await User.create({
        name: 'Prof. Alan Turing',
        email: 'teacher@doubtforum.local',
        passwordHash: 'TeacherPass123!',
        role: 'teacher',
        subject: 'Computer Science',
        isEmailVerified: true,
      });

      const student = await User.create({
        name: 'Alex Student',
        email: 'student@doubtforum.local',
        passwordHash: 'StudentPass123!',
        role: 'student',
        isEmailVerified: true,
      });

      const csSubject = await Subject.findOne({ name: 'Web Development' });

      await Question.create({
        title: 'How does React useState and useEffect work under the hood?',
        description: 'Can someone explain how React maintains state across re-renders and when useEffect executes in the browser lifecycle? Looking for best practices on dependency arrays.',
        tags: ['react', 'javascript', 'hooks'],
        subject: csSubject?._id,
        author: student._id,
      });

      console.log('\n🌱  Demo accounts created:');
      console.log('    Admin:   admin@doubtforum.local   / AdminPass123!');
      console.log('    Teacher: teacher@doubtforum.local / TeacherPass123!');
      console.log('    Student: student@doubtforum.local / StudentPass123!\n');
    }
  } catch (seedErr) {
    console.warn('Dev seed warning:', seedErr.message);
  }
}

/**
 * Connect to MongoDB. Safe to call multiple times — connects only once.
 * Falls back to MongoMemoryServer in development if no local mongod daemon is running.
 */
export async function connectDB(customUri) {
  if (_isConnected || mongoose.connection.readyState === 1) {
    _isConnected = true;
    return;
  }

  const uri = customUri || process.env.MONGODB_URI || env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    _isConnected = true;
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
    if (env.NODE_ENV === 'development') {
      await seedDevData();
    }
  } catch (err) {
    // If running in development and local connection failed, spin up in-memory MongoDB
    if (env.NODE_ENV === 'development' && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
      console.warn('\n⚠️   Local mongod not found on port 27017.');
      console.warn('    Spinning up automated in-memory MongoDB for local development...\n');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        _memoryServer = await MongoMemoryServer.create();
        const memUri = _memoryServer.getUri();
        await mongoose.connect(memUri);
        _isConnected = true;
        console.log(`✅  In-memory MongoDB started and connected: ${memUri}`);
        await seedDevData();
        return;
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr.message);
      }
    }

    const msg = `MongoDB connection failed: ${err.message}`;
    if (env.NODE_ENV === 'test') {
      throw new Error(msg); // Let the test runner handle it gracefully
    }
    console.error('❌ ', msg);
    console.error('   Check your MONGODB_URI in .env or provide a MongoDB Atlas connection string.');
    process.exit(1);
  }
}

/**
 * Close the database connection. Used during graceful shutdown and testing.
 */
export async function disconnectDB() {
  if (!_isConnected) return;
  await mongoose.connection.close();
  if (_memoryServer) {
    await _memoryServer.stop();
    _memoryServer = null;
  }
  _isConnected = false;
  console.log('   MongoDB disconnected');
}

/**
 * Returns a human-readable database connection status string.
 * @returns {'disconnected'|'connected'|'connecting'|'disconnecting'|'unknown'}
 */
export function getDbStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] ?? 'unknown';
}

// ── Mongoose connection event handlers ────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  _isConnected = false;
  if (env.NODE_ENV !== 'test') {
    console.warn('⚠️   MongoDB disconnected');
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});
