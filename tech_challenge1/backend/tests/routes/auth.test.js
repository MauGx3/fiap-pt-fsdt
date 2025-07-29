import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from '../testApp.js';
import User from '../../models/User.js';

const app = createTestApp();

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'author'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        uuid: expect.any(String),
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role
      });

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
    });

    test('should register user with default role', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('author');
    });

    test('should return 400 for missing required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Name, email, and password are required');
    });

    test('should return 400 for short password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Password must be at least 6 characters long');
    });

    test('should return 400 for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, name: 'Jane Doe' })
        .expect(400);

      expect(response.body.error).toBe('User with this email already exists');
    });

    test('should handle case-insensitive email duplicates', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      const userData2 = {
        name: 'Jane Doe',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData1)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData2)
        .expect(400);

      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser(User, {
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        uuid: testUser.uuid,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      });

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.uuid).toBe(testUser.uuid);
    });

    test('should handle case-insensitive email login', async () => {
      const loginData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should return 400 for missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    test('should return 400 for missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    test('should return 401 for non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should return 401 for wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser(User);
      
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    test('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
      expect(response.body.instruction).toBe('Please remove the token from your client storage');
    });

    test('should return 401 without authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.error).toBe('Access denied. No valid authorization header provided.');
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token format.');
    });
  });

  describe('GET /api/auth/verify', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser(User);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    test('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Token is valid');
      expect(response.body.user).toEqual({
        uuid: testUser.uuid,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      });
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token format.');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser(User);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    test('should refresh token successfully', async () => {
      // Add a small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.token).not.toBe(authToken); // Should be a new token
      expect(response.body.user).toEqual({
        uuid: testUser.uuid,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      });

      // Verify new token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.uuid).toBe(testUser.uuid);
    });

    test('should return 401 without valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token format.');
    });
  });
});
