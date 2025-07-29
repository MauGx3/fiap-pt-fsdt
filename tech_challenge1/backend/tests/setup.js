import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

let mongoServer;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

export const connectToTestDB = async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
};

export const disconnectFromTestDB = async () => {
  // Disconnect from the database and stop the in-memory server
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
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
