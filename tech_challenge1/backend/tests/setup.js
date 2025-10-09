// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

let mongoServer;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

const connectToTestDB = async () => {
  // Check if running in Docker container with real MongoDB
  if (process.env.MONGO_URI) {
    // Use the real MongoDB container for tests, but with a test database
    const testUri = process.env.MONGO_URI.replace(/\/[^/]*$/, '/test-blog-api');
    await mongoose.connect(testUri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
  } else {
    // Start in-memory MongoDB instance with optimized configuration
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.14',
        downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || undefined
      },
      instance: {
        dbName: 'test-blog-api'
      }
    });
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database with optimized settings
    await mongoose.connect(mongoUri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
  }
};

const disconnectFromTestDB = async () => {
  // Clean disconnect from the database and stop the in-memory server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

beforeAll(async () => {
  await connectToTestDB();
});

afterEach(async () => {
  // Clean up the database between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await disconnectFromTestDB();
});

// Global test utilities
global.testUtils = {
  createTestUser: async (User, userData = {}) => {
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'author',
      ...userData
    };

    const user = new User(defaultUser);
    await user.save();
    return user;
  },

  createTestPost: async (Post, user, postData = {}) => {
    const defaultPost = {
      title: 'Test Post Title',
      content: 'This is test post content.',
      author: user.uuid,
      ...postData
    };

    const post = new Post(defaultPost);
    await post.save();
    return post;
  }
};
