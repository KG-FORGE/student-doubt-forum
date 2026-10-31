/**
 * Global test setup — starts an in-memory MongoDB instance before all tests
 * and tears it down after. Individual test files can call connectDB/disconnectDB
 * using the URI set here.
 *
 * mongodb-memory-server downloads the MongoDB binary on first run.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function setup() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Override the MONGODB_URI so connectDB() uses the in-memory instance
  process.env.MONGODB_URI = uri;
}

export async function teardown() {
  if (mongoServer) {
    await mongoServer.stop();
  }
}
