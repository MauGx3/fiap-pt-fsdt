import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../testApp.js';

describe('Rate Limiting Middleware', () => {
  let app;

  beforeEach(async () => {
    app = createTestApp();
  });

  afterEach(async () => {
    // Clean up any test data if needed
  });

  describe('General Rate Limiting', () => {
    test('should allow requests under the limit', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-test-rate-limit', 'true') // Enable rate limiting for this test
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });

    test('should include rate limit headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-test-rate-limit', 'true') // Enable rate limiting for this test
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBe('1000');
      expect(parseInt(response.headers['ratelimit-remaining'])).toBeLessThanOrEqual(1000);
    });
  });

  describe('Authentication Rate Limiting', () => {
    test('should allow login attempts under the limit', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .set('x-test-rate-limit', 'true') // Enable rate limiting for this test
        .send(loginData)
        .expect(401); // We expect 401 because user doesn't exist (invalid credentials)

      expect(response.headers['ratelimit-limit']).toBe('50');
    });
  });

  describe('Registration Rate Limiting', () => {
    test('should allow registration attempts under the limit', async () => {
      const registrationData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .set('x-test-rate-limit', 'true') // Enable rate limiting for this test
        .send(registrationData)
        .expect(201);

      expect(response.headers['ratelimit-limit']).toBe('50');
    });
  });

  describe('Post Creation Rate Limiting', () => {
    let authToken;

    beforeEach(async () => {
      // Create a user and get auth token
      const userData = {
        name: 'Test Author',
        email: 'author@example.com',
        password: 'password123',
        role: 'author'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      authToken = loginResponse.body.token;
    });

    test('should allow post creation under the limit', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content.',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-test-rate-limit', 'true') // Enable rate limiting for this test
        .send(postData)
        .expect(201);

      expect(response.headers['ratelimit-limit']).toBe('100');
    });
  });
});
