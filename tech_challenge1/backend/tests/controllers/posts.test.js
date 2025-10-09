import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
} from "../../postsController.js";
import Post from "../../models/Post.js";
import User from "../../models/User.js";

describe("Posts Controller", () => {
  let mockReq;
  let mockRes;
  let testUser;
  let testPost;

  beforeEach(async () => {
    testUser = await global.testUtils.createTestUser(User);
    testPost = await global.testUtils.createTestPost(Post, testUser);

    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {
        uuid: testUser.uuid,
        email: testUser.email,
        role: testUser.role,
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getAllPosts", () => {
    test("should return all posts", async () => {
      await getAllPosts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            content: expect.any(String),
            author: expect.any(String),
          }),
        ]),
      );
    });

    test("should handle database errors", async () => {
      // Mock Post.find to throw an error
      const mockFind = jest
        .spyOn(Post, "find")
        .mockRejectedValue(new Error("Database error"));

      await getAllPosts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });

      mockFind.mockRestore();
    });
  });

  describe("getPostById", () => {
    test("should return post by valid ID", async () => {
      mockReq.params.id = testPost._id.toString();

      await getPostById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: testPost.title,
          content: testPost.content,
          author: testPost.author,
        }),
      );
    });

    test("should return 404 for non-existent post", async () => {
      mockReq.params.id = "507f1f77bcf86cd799439011";

      await getPostById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Post not found" });
    });

    test("should return 400 for invalid ID format", async () => {
      mockReq.params.id = "invalid-id";

      await getPostById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid ID format" });
    });
  });

  describe("createPost", () => {
    test("should create post successfully", async () => {
      mockReq.body = {
        title: "New Post Title",
        content: "New post content",
      };

      await createPost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Post created successfully",
        post: expect.objectContaining({
          title: "New Post Title",
          content: "New post content",
          author: testUser.uuid,
        }),
      });

      // Verify post was saved to database
      const savedPost = await Post.findOne({ title: "New Post Title" });
      expect(savedPost).toBeTruthy();
    });

    test("should return 400 for missing title", async () => {
      mockReq.body = {
        content: "Content without title",
      };

      await createPost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Title and content are required",
      });
    });

    test("should return 400 for missing content", async () => {
      mockReq.body = {
        title: "Title without content",
      };

      await createPost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Title and content are required",
      });
    });

    test("should handle validation errors", async () => {
      // Mock invalid user UUID to trigger validation error
      mockReq.user.uuid = "invalid-uuid";
      mockReq.body = {
        title: "Test Title",
        content: "Test content",
      };

      await createPost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining("Validation failed"),
      });
    });
  });

  describe("updatePost", () => {
    test("should update own post successfully", async () => {
      mockReq.params.id = testPost._id.toString();
      mockReq.body = {
        title: "Updated Title",
        content: "Updated content",
      };

      await updatePost(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Post updated successfully",
        post: expect.objectContaining({
          title: "Updated Title",
          content: "Updated content",
        }),
      });

      // Verify post was updated in database
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.title).toBe("Updated Title");
      expect(updatedPost.content).toBe("Updated content");
    });

    test("should allow admin to update any post", async () => {
      // Create admin user
      const adminUser = await global.testUtils.createTestUser(User, {
        email: "admin@example.com",
        role: "admin",
      });

      mockReq.user = {
        uuid: adminUser.uuid,
        role: "admin",
      };
      mockReq.params.id = testPost._id.toString();
      mockReq.body = {
        title: "Admin Updated Title",
      };

      await updatePost(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Post updated successfully",
        post: expect.objectContaining({
          title: "Admin Updated Title",
        }),
      });
    });

    test("should return 403 when non-owner tries to update post", async () => {
      // Create different user
      const otherUser = await global.testUtils.createTestUser(User, {
        email: "other@example.com",
      });

      mockReq.user = {
        uuid: otherUser.uuid,
        role: "author",
      };
      mockReq.params.id = testPost._id.toString();
      mockReq.body = {
        title: "Unauthorized Update",
      };

      await updatePost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied. You can only update your own posts.",
      });
    });

    test("should return 404 for non-existent post", async () => {
      mockReq.params.id = "507f1f77bcf86cd799439011";
      mockReq.body = {
        title: "Updated Title",
      };

      await updatePost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Post not found" });
    });

    test("should return 400 for invalid post ID", async () => {
      mockReq.params.id = "invalid-id";
      mockReq.body = {
        title: "Updated Title",
      };

      await updatePost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid post ID format",
      });
    });
  });

  describe("deletePost", () => {
    test("should delete own post successfully", async () => {
      mockReq.params.id = testPost._id.toString();

      await deletePost(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Post deleted successfully",
        post: expect.objectContaining({
          title: testPost.title,
          content: testPost.content,
        }),
      });

      // Verify post was deleted from database
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    test("should allow admin to delete any post", async () => {
      const adminUser = await global.testUtils.createTestUser(User, {
        email: "admin@example.com",
        role: "admin",
      });

      mockReq.user = {
        uuid: adminUser.uuid,
        role: "admin",
      };
      mockReq.params.id = testPost._id.toString();

      await deletePost(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Post deleted successfully",
        post: expect.objectContaining({
          title: testPost.title,
        }),
      });

      // Verify post was deleted from database
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    test("should return 403 when non-owner tries to delete post", async () => {
      const otherUser = await global.testUtils.createTestUser(User, {
        email: "other@example.com",
      });

      mockReq.user = {
        uuid: otherUser.uuid,
        role: "author",
      };
      mockReq.params.id = testPost._id.toString();

      await deletePost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied. You can only delete your own posts.",
      });
    });

    test("should return 404 for non-existent post", async () => {
      mockReq.params.id = "507f1f77bcf86cd799439011";

      await deletePost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Post not found" });
    });
  });

  describe("searchPosts", () => {
    beforeEach(async () => {
      // Clear existing posts and create test posts
      await Post.deleteMany({});

      await global.testUtils.createTestPost(Post, testUser, {
        title: "JavaScript Tutorial",
        content: "Learn JavaScript fundamentals",
      });
      await global.testUtils.createTestPost(Post, testUser, {
        title: "Python Guide",
        content: "Python programming basics",
      });
      await global.testUtils.createTestPost(Post, testUser, {
        title: "Web Development",
        content: "HTML, CSS, and JavaScript for web development",
      });
    });

    test("should search posts by title", async () => {
      mockReq.query.query = "JavaScript";

      await searchPosts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringMatching(/JavaScript/i),
          }),
        ]),
      );

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveLength(2); // Should match 2 posts
    });

    test("should search posts by content", async () => {
      mockReq.query.query = "Python";

      await searchPosts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Python Guide",
          }),
        ]),
      );

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveLength(1);
    });

    test("should return 400 for missing query parameter", async () => {
      mockReq.query = {}; // No query parameter

      await searchPosts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing query parameter",
      });
    });

    test("should return empty array for no matches", async () => {
      mockReq.query.query = "nonexistent";

      await searchPosts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test("should be case insensitive", async () => {
      mockReq.query.query = "PYTHON";

      await searchPosts(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveLength(1);
      expect(response[0].title).toBe("Python Guide");
    });
  });
});
