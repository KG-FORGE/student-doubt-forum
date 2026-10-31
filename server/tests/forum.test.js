import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Answer from '../src/models/Answer.js';
import Vote from '../src/models/Vote.js';
import Bookmark from '../src/models/Bookmark.js';
import Subject from '../src/models/Subject.js';
import Notification from '../src/models/Notification.js';

let studentToken = '';
let studentUser = null;
let teacherToken = '';
let teacherUser = null;
let adminToken = '';
let adminUser = null;
let testSubject = null;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ email: /@forum-test\.example\.com$/ });
      await Question.deleteMany({});
      await Answer.deleteMany({});
      await Vote.deleteMany({});
      await Bookmark.deleteMany({});
      await Subject.deleteMany({});
      await Notification.deleteMany({});
    }
  } catch (_) {}
  await disconnectDB();
});

beforeEach(async () => {
  // Clear collections for clean test slate
  await User.deleteMany({ email: /@forum-test\.example\.com$/ });
  await Question.deleteMany({});
  await Answer.deleteMany({});
  await Vote.deleteMany({});
  await Bookmark.deleteMany({});
  await Subject.deleteMany({});
  await Notification.deleteMany({});

  // Seed subject
  testSubject = await Subject.create({
    name: 'Computer Science',
    description: 'Algorithms and Data Structures',
    isActive: true,
  });

  // Seed Student
  const regStudent = await request(app).post('/api/auth/register').send({
    name: 'Alice Student',
    email: 'alice@forum-test.example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  });
  studentToken = regStudent.body.data.accessToken;
  studentUser = regStudent.body.data.user;

  // Seed Teacher directly in DB
  const teacher = await User.create({
    name: 'Bob Teacher',
    email: 'bob@forum-test.example.com',
    passwordHash: 'TeacherPass123',
    role: 'teacher',
    isEmailVerified: true,
  });
  const loginTeacher = await request(app).post('/api/auth/login').send({
    email: 'bob@forum-test.example.com',
    password: 'TeacherPass123',
  });
  teacherToken = loginTeacher.body.data.accessToken;
  teacherUser = teacher;

  // Seed Admin directly in DB
  const admin = await User.create({
    name: 'Charlie Admin',
    email: 'charlie@forum-test.example.com',
    passwordHash: 'AdminPass123',
    role: 'admin',
    isEmailVerified: true,
  });
  const loginAdmin = await request(app).post('/api/auth/login').send({
    email: 'charlie@forum-test.example.com',
    password: 'AdminPass123',
  });
  adminToken = loginAdmin.body.data.accessToken;
  adminUser = admin;
});

describe('Questions API', () => {
  it('creates a question when authenticated', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'How does React useEffect dependency array work?',
        description: 'I want to know when useEffect triggers re-runs and how to avoid infinite loops.',
        tags: ['react', 'javascript'],
        subject: testSubject._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.question.title).toBe('How does React useEffect dependency array work?');
    expect(res.body.data.question.author.name).toBe('Alice Student');
    expect(res.body.data.question.tags).toContain('react');
  });

  it('rejects question creation if not authenticated', async () => {
    const res = await request(app).post('/api/questions').send({
      title: 'Unauthenticated question title here',
      description: 'This is an unauthenticated question description text.',
    });
    expect(res.status).toBe(401);
  });

  it('lists and searches questions with pagination', async () => {
    // Create 2 questions
    await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'How does binary search work in Python?',
        description: 'Explain the logarithmic time complexity of binary search algorithms.',
        tags: ['python', 'algorithms'],
        subject: testSubject._id.toString(),
      });

    await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Understanding MongoDB compound indexes and collation',
        description: 'Can someone explain when compound index prefix rule applies in MongoDB?',
        tags: ['mongodb', 'database'],
        subject: testSubject._id.toString(),
      });

    const res = await request(app).get('/api/questions?limit=10&page=1');
    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBe(2);
    expect(res.body.data.pagination.total).toBe(2);

    // Search by text
    const searchRes = await request(app).get('/api/questions?search=Python');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.questions.length).toBe(1);
    expect(searchRes.body.data.questions[0].title).toContain('Python');
  });

  it('prevents non-owners from editing or deleting a question', async () => {
    const createRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Original Question by Alice Student',
        description: 'This is the description written by student Alice for testing permissions.',
        tags: ['react'],
      });
    const questionId = createRes.body.data.question._id;

    // Bob (teacher, not owner) tries to edit Alice's question -> 403
    const editRes = await request(app)
      .put(`/api/questions/${questionId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Hacked question title by Bob',
      });
    expect(editRes.status).toBe(403);

    // Charlie (admin) CAN edit or delete question
    const adminDeleteRes = await request(app)
      .delete(`/api/questions/${questionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminDeleteRes.status).toBe(200);
  });
});

describe('Answers API & Verification', () => {
  it('posts an answer, increments answer count, and notifies question author', async () => {
    const qRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Explain CSS Flexbox vs CSS Grid layouts',
        description: 'When should I choose CSS Grid over Flexbox for responsive layouts?',
        tags: ['css'],
      });
    const questionId = qRes.body.data.question._id;

    // Teacher posts answer
    const ansRes = await request(app)
      .post(`/api/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        content: 'Flexbox is designed for 1-dimensional layouts (row or column), while Grid is for 2D.',
      });

    expect(ansRes.status).toBe(201);
    expect(ansRes.body.data.answer.author.name).toBe('Bob Teacher');

    // Check Question answerCount
    const checkQ = await Question.findById(questionId);
    expect(checkQ.answerCount).toBe(1);

    // Check student received notification
    const studentNotifs = await Notification.find({ recipient: studentUser._id });
    expect(studentNotifs.length).toBe(1);
    expect(studentNotifs[0].type).toBe('new_answer');
  });

  it('allows teacher or admin to verify an answer, awards +15 reputation', async () => {
    const qRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'What is memoization in dynamic programming?',
        description: 'I need a clear explanation of top-down memoization with examples.',
        tags: ['algorithms'],
      });
    const questionId = qRes.body.data.question._id;

    const ansRes = await request(app)
      .post(`/api/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${studentToken}`) // Alice answers
      .send({
        content: 'Memoization is an optimization technique that caches previously computed results.',
      });
    const answerId = ansRes.body.data.answer._id;

    // Student tries to verify answer -> 403 Forbidden!
    const studentVerify = await request(app)
      .put(`/api/answers/${answerId}/verify`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentVerify.status).toBe(403);

    // Teacher verifies answer -> 200 OK
    const teacherVerify = await request(app)
      .put(`/api/answers/${answerId}/verify`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(teacherVerify.status).toBe(200);
    expect(teacherVerify.body.data.answer.isVerified).toBe(true);

    // Question hasVerifiedAnswer is now true
    const updatedQ = await Question.findById(questionId);
    expect(updatedQ.hasVerifiedAnswer).toBe(true);

    // Alice gained +15 reputation
    const updatedAlice = await User.findById(studentUser._id);
    expect(updatedAlice.reputation).toBe(15);
  });
});

describe('Voting System Integrity', () => {
  it('prevents self-voting and records upvotes with reputation gain', async () => {
    const qRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'How to implement JWT refresh token rotation?',
        description: 'Looking for best practices for secure token rotation and reuse detection.',
        tags: ['security', 'jwt'],
      });
    const questionId = qRes.body.data.question._id;

    // Alice tries to upvote her own question -> 400
    const selfVoteRes = await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        targetType: 'Question',
        targetId: questionId,
        value: 1,
      });
    expect(selfVoteRes.status).toBe(400);
    expect(selfVoteRes.body.message).toContain('own post');

    // Bob (teacher) upvotes Alice's question
    const voteRes = await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        targetType: 'Question',
        targetId: questionId,
        value: 1,
      });
    expect(voteRes.status).toBe(200);
    expect(voteRes.body.data.voteScore).toBe(1);

    // Alice gained +10 reputation
    const alice = await User.findById(studentUser._id);
    expect(alice.reputation).toBe(10);

    // Bob clicks upvote again -> toggles vote off (un-votes)
    const toggleRes = await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        targetType: 'Question',
        targetId: questionId,
        value: 1,
      });
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.voteScore).toBe(0);
    expect(toggleRes.body.data.userVote).toBe(0);
  });
});

describe('Bookmarks API', () => {
  it('allows students to bookmark and unbookmark questions', async () => {
    const qRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Top 10 algorithms every software engineer should know',
        description: 'Dijkstra, QuickSort, MergeSort, BFS, DFS, Binary Search, Kadane, etc.',
        tags: ['algorithms'],
      });
    const questionId = qRes.body.data.question._id;

    // Add bookmark
    const addRes = await request(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ questionId });
    expect(addRes.status).toBe(201);
    expect(addRes.body.data.isBookmarked).toBe(true);

    // List bookmarks
    const listRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.bookmarks.length).toBe(1);
    expect(listRes.body.data.bookmarks[0]._id).toBe(questionId);

    // Check IDs
    const idsRes = await request(app)
      .get('/api/bookmarks/ids')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(idsRes.body.data.bookmarkedIds).toContain(questionId);

    // Delete bookmark
    const delRes = await request(app)
      .delete(`/api/bookmarks/${questionId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.data.isBookmarked).toBe(false);
  });
});

describe('Admin Security & Dashboard API', () => {
  it('blocks non-admin users from accessing admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('allows admin to fetch platform stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats.users.total).toBeGreaterThanOrEqual(3);
  });

  it('allows admin to promote a student to teacher', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${studentUser._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'teacher' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('teacher');

    const updatedUser = await User.findById(studentUser._id);
    expect(updatedUser.role).toBe('teacher');
  });

  it('prevents admin from modifying their own admin role', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${adminUser._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'student' });

    expect(res.status).toBe(400);
  });
});
