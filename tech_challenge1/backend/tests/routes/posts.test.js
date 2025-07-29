import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../testApp.js';
import User from '../../models/User.js';
import Post from '../../models/Post.js';

const app = createTestApp();

describe('Posts Routes', () => {
  let testUser;
  let adminUser;
  let authToken;
  let adminToken;

  beforeEach(async () => {
    // Create test users
    testUser = await global.testUtils.createTestUser(User, {
      email: 'author@example.com',
      role: 'author'
    });

    adminUser = await global.testUtils.createTestUser(User, {
      email: 'admin@example.com',
      role: 'admin'
    });

    // Get auth tokens
    const authorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });
    authToken = authorLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: 'password123'
      });
    adminToken = adminLogin.body.token;
  });

  describe('GET /api/posts', () => {
    test('should get all posts without authentication', async () => {
      // Create test posts
      await global.testUtils.createTestPost(Post, testUser, { title: 'Post 1' });
      await global.testUtils.createTestPost(Post, testUser, { title: 'Post 2' });

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBeDefined();
      expect(response.body[0].content).toBeDefined();
      expect(response.body[0].author).toBeDefined();
    });

    test('should return empty array when no posts exist', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await global.testUtils.createTestPost(Post, testUser);
    });

    test('should get single post by ID without authentication', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}`)
        .expect(200);

      expect(response.body.title).toBe(testPost.title);
      expect(response.body.content).toBe(testPost.content);
      expect(response.body.author).toBe(testPost.author);
    });

    test('should return 404 for non-existent post', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });

    test('should return 400 for invalid post ID format', async () => {
      const response = await request(app)
        .get('/api/posts/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID format');
    });
  });

  describe('POST /api/posts', () => {
    test('should create post with valid authentication', async () => {
      const postData = {
        title: 'New Test Post',
        content: 'This is the content of the new test post.'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.post.title).toBe(postData.title);
      expect(response.body.post.content).toBe(postData.content);
      expect(response.body.post.author).toBe(testUser.uuid);

      // Verify post was saved to database
      const savedPost = await Post.findById(response.body.post._id);
      expect(savedPost).toBeTruthy();
      expect(savedPost.title).toBe(postData.title);
    });

    test('should return 401 without authentication', async () => {
      const postData = {
        title: 'New Test Post',
        content: 'This is the content of the new test post.'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No valid authorization header provided.');
    });

    test('should return 400 for missing title', async () => {
      const postData = {
        content: 'This is the content of the new test post.'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('Title and content are required');
    });

    test('should return 400 for missing content', async () => {
      const postData = {
        title: 'New Test Post'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('Title and content are required');
    });
  });

  describe('PUT /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await global.testUtils.createTestPost(Post, testUser);
    });

    test('should update own post', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Post updated successfully');
      expect(response.body.post.title).toBe(updateData.title);
      expect(response.body.post.content).toBe(updateData.content);

      // Verify post was updated in database
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.title).toBe(updateData.title);
      expect(updatedPost.content).toBe(updateData.content);
    });

    test('should allow admin to update any post', async () => {
      const updateData = {
        title: 'Admin Updated Title'
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Post updated successfully');
      expect(response.body.post.title).toBe(updateData.title);
    });

    test('should return 403 when trying to update someone else\'s post', async () => {
      // Create another user
      const otherUser = await global.testUtils.createTestUser(User, {
        email: 'other@example.com'
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: otherUser.email,
          password: 'password123'
        });
      const otherToken = otherLogin.body.token;

      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied. You can only update your own posts.');
    });

    test('should return 401 without authentication', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No valid authorization header provided.');
    });

    test('should return 404 for non-existent post', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/posts/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await global.testUtils.createTestPost(Post, testUser);
    });

    test('should delete own post as author', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Post deleted successfully');

      // Verify post was deleted from database
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    test('should allow admin to delete any post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Post deleted successfully');

      // Verify post was deleted from database
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    test('should return 403 for reader role trying to delete', async () => {
      // Create reader user
      const readerUser = await global.testUtils.createTestUser(User, {
        email: 'reader@example.com',
        role: 'reader'
      });

      const readerLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: readerUser.email,
          password: 'password123'
        });
      const readerToken = readerLogin.body.token;

      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Required role: admin or author');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No valid authorization header provided.');
    });

    test('should return 404 for non-existent post', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/posts/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('GET /api/posts/search', () => {
    beforeEach(async () => {
      await global.testUtils.createTestPost(Post, testUser, {
        title: 'JavaScript Tutorial',
        content: 'Learn JavaScript fundamentals'
      });
      await global.testUtils.createTestPost(Post, testUser, {
        title: 'Python Guide',
        content: 'Python programming basics'
      });
      await global.testUtils.createTestPost(Post, testUser, {
        title: 'Web Development',
        content: 'HTML, CSS, and JavaScript for web development'
      });
    });

    test('should search posts by title', async () => {
      const response = await request(app)
        .get('/api/posts/search?query=JavaScript')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(post => 
        post.title.toLowerCase().includes('javascript') || 
        post.content.toLowerCase().includes('javascript')
      )).toBe(true);
    });

    test('should search posts by content', async () => {
      const response = await request(app)
        .get('/api/posts/search?query=python')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Python Guide');
    });

    test('should be case insensitive', async () => {
      const response = await request(app)
        .get('/api/posts/search?query=PYTHON')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Python Guide');
    });

    test('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/posts/search?query=nonexistent')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/posts/search')
        .expect(400);

      expect(response.body.error).toBe('Missing query parameter');
    });
  });
});
