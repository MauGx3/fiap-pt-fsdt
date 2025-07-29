import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Post from '../../models/Post.js';
import User from '../../models/User.js';
import { connectToTestDB, disconnectFromTestDB } from '../setup.js';

describe('Post Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await global.testUtils.createTestUser(User);
  });

  describe('Post Creation', () => {
    test('should create a valid post', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is the content of the test post.',
        author: testUser.uuid
      };

      const post = new Post(postData);
      const savedPost = await post.save();

      expect(savedPost._id).toBeDefined();
      expect(savedPost.title).toBe(postData.title);
      expect(savedPost.content).toBe(postData.content);
      expect(savedPost.author).toBe(postData.author);
      expect(savedPost.comments).toEqual([]);
      expect(savedPost.createdAt).toBeDefined();
      expect(savedPost.updatedAt).toBeDefined();
    });

    test('should create post with comments', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test content',
        author: testUser.uuid,
        comments: [
          {
            user: 'commenter-uuid',
            text: 'Great post!',
            createdAt: new Date()
          }
        ]
      };

      const post = new Post(postData);
      const savedPost = await post.save();

      expect(savedPost.comments).toHaveLength(1);
      expect(savedPost.comments[0].user).toBe('commenter-uuid');
      expect(savedPost.comments[0].text).toBe('Great post!');
      expect(savedPost.comments[0].createdAt).toBeDefined();
    });
  });

  describe('Post Validation', () => {
    test('should require title', async () => {
      const postData = {
        content: 'Test content',
        author: testUser.uuid
      };

      const post = new Post(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should require content', async () => {
      const postData = {
        title: 'Test Title',
        author: testUser.uuid
      };

      const post = new Post(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should require author', async () => {
      const postData = {
        title: 'Test Title',
        content: 'Test content'
      };

      const post = new Post(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should validate author UUID format', async () => {
      const postData = {
        title: 'Test Title',
        content: 'Test content',
        author: 'invalid-uuid'
      };

      const post = new Post(postData);
      
      await expect(post.save()).rejects.toThrow();
    });

    test('should accept valid UUID for author', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const postData = {
        title: 'Test Title',
        content: 'Test content',
        author: validUuid
      };

      const post = new Post(postData);
      const savedPost = await post.save();
      
      expect(savedPost.author).toBe(validUuid);
    });
  });

  describe('Post Comments', () => {
    test('should add comments to existing post', async () => {
      const post = await global.testUtils.createTestPost(Post, testUser);

      post.comments.push({
        user: 'commenter-uuid-1',
        text: 'First comment',
        createdAt: new Date()
      });

      post.comments.push({
        user: 'commenter-uuid-2',
        text: 'Second comment',
        createdAt: new Date()
      });

      const savedPost = await post.save();

      expect(savedPost.comments).toHaveLength(2);
      expect(savedPost.comments[0].text).toBe('First comment');
      expect(savedPost.comments[1].text).toBe('Second comment');
    });

    test('should handle empty comments array', async () => {
      const post = await global.testUtils.createTestPost(Post, testUser);

      expect(post.comments).toEqual([]);
    });

    test('should set default createdAt for comments', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test content',
        author: testUser.uuid,
        comments: [
          {
            user: 'commenter-uuid',
            text: 'Comment without explicit createdAt'
          }
        ]
      };

      const post = new Post(postData);
      const savedPost = await post.save();

      expect(savedPost.comments[0].createdAt).toBeDefined();
      expect(savedPost.comments[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Post Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const post = await global.testUtils.createTestPost(Post, testUser);

      expect(post.createdAt).toBeDefined();
      expect(post.updatedAt).toBeDefined();
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt when post is modified', async () => {
      const post = await global.testUtils.createTestPost(Post, testUser);
      const originalUpdatedAt = post.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      post.title = 'Updated Title';
      const updatedPost = await post.save();

      expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Post Queries', () => {
    test('should find post by author', async () => {
      await global.testUtils.createTestPost(Post, testUser, { title: 'Post 1' });
      await global.testUtils.createTestPost(Post, testUser, { title: 'Post 2' });

      const posts = await Post.find({ author: testUser.uuid });

      expect(posts).toHaveLength(2);
      expect(posts.every(post => post.author === testUser.uuid)).toBe(true);
    });

    test('should find posts by title regex', async () => {
      await global.testUtils.createTestPost(Post, testUser, { title: 'JavaScript Tutorial' });
      await global.testUtils.createTestPost(Post, testUser, { title: 'Python Guide' });
      await global.testUtils.createTestPost(Post, testUser, { title: 'JavaScript Advanced' });

      const posts = await Post.find({
        title: { $regex: 'JavaScript', $options: 'i' }
      });

      expect(posts).toHaveLength(2);
      expect(posts.every(post => post.title.includes('JavaScript'))).toBe(true);
    });
  });
});
