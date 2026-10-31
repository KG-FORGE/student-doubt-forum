import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll } from 'vitest';

// Start in-memory MongoDB synchronously with top-level await in ESM
const mongoServer = await MongoMemoryServer.create();
const uri = mongoServer.getUri();
process.env.MONGODB_URI = uri;

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoServer.stop();
});
