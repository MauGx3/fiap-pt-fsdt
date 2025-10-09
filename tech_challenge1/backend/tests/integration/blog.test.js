import { describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../testApp.js";
import User from "../../models/User.js";
import Post from "../../models/Post.js";

const app = createTestApp();

describe("Blog API Integration Tests", () => {
  let user1, user2;
  let user1Token, user2Token, adminToken;
  let post1, post2;

  beforeEach(async () => {
    // Create test users
    user1 = await global.testUtils.createTestUser(User, {
      name: "Alice Author",
      email: "alice@example.com",
      password: "password123",
      role: "author",
    });

    user2 = await global.testUtils.createTestUser(User, {
      name: "Bob Blogger",
      email: "bob@example.com",
      password: "password123",
      role: "author",
    });

    await global.testUtils.createTestUser(User, {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    // Login users to get tokens
    const user1Login = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@example.com", password: "password123" });
    user1Token = user1Login.body.token;

    const user2Login = await request(app)
      .post("/api/auth/login")
      .send({ email: "bob@example.com", password: "password123" });
    user2Token = user2Login.body.token;

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    adminToken = adminLogin.body.token;

    // Create test posts
    post1 = await global.testUtils.createTestPost(Post, user1, {
      title: "Alice First Post",
      content: "This is Alice first blog post.",
    });

    post2 = await global.testUtils.createTestPost(Post, user2, {
      title: "Bob Second Post",
      content: "This is Bob second blog post about testing.",
    });
  });

  describe("Complete User Journey", () => {
    test("should handle complete user registration and posting workflow", async () => {
      // 1. Register a new user
      const registrationData = {
        name: "Charlie Newcomer",
        email: "charlie@example.com",
        password: "password123",
        role: "author",
      };

      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(registrationData)
        .expect(201);

      expect(registerResponse.body.message).toBe(
        "User registered successfully",
      );
      expect(registerResponse.body.token).toBeDefined();
      const charlieToken = registerResponse.body.token;

      // 2. Verify token works for authentication
      const verifyResponse = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${charlieToken}`)
        .expect(200);

      expect(verifyResponse.body.message).toBe("Token is valid");
      expect(verifyResponse.body.user.name).toBe(registrationData.name);

      // 3. Create a blog post
      const postData = {
        title: "Charlie First Post",
        content: "This is my first blog post after registration!",
      };

      const createPostResponse = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${charlieToken}`)
        .send(postData)
        .expect(201);

      expect(createPostResponse.body.message).toBe("Post created successfully");
      expect(createPostResponse.body.post.title).toBe(postData.title);
      expect(createPostResponse.body.post.author).toBe(
        registerResponse.body.user.uuid,
      );

      // 4. Verify post appears in all posts
      const allPostsResponse = await request(app).get("/api/posts").expect(200);

      expect(allPostsResponse.body.length).toBe(3); // 2 existing + 1 new
      const charliePost = allPostsResponse.body.find(
        (p) => p.title === postData.title,
      );
      expect(charliePost).toBeDefined();

      // 5. Update the post
      const updateData = {
        title: "Charlie Updated Post",
        content: "This is my updated first blog post!",
      };

      const updateResponse = await request(app)
        .put(`/api/posts/${createPostResponse.body.post._id}`)
        .set("Authorization", `Bearer ${charlieToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.message).toBe("Post updated successfully");
      expect(updateResponse.body.post.title).toBe(updateData.title);

      // 6. Search for the updated post
      const searchResponse = await request(app)
        .get("/api/posts/search?query=updated")
        .expect(200);

      expect(searchResponse.body.length).toBe(1);
      expect(searchResponse.body[0].title).toBe(updateData.title);

      // 7. Update user profile
      const profileUpdate = {
        name: "Charles Newcomer",
        email: "charles@example.com",
      };

      const profileResponse = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${charlieToken}`)
        .send(profileUpdate)
        .expect(200);

      expect(profileResponse.body.user.name).toBe(profileUpdate.name);
      expect(profileResponse.body.user.email).toBe(profileUpdate.email);

      // 8. Logout
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${charlieToken}`)
        .expect(200);

      expect(logoutResponse.body.message).toBe("Logout successful");
    });
  });

  describe("Authorization and Permissions", () => {
    test("should enforce post ownership for updates", async () => {
      // User1 tries to update User2's post
      const updateData = {
        title: "Trying to hack Bob post",
        content: "This should not work",
      };

      const response = await request(app)
        .put(`/api/posts/${post2._id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe(
        "Access denied. You can only update your own posts.",
      );
    });

    test("should allow admin to update any post", async () => {
      const updateData = {
        title: "Admin Updated Post",
        content: "Admin can update any post",
      };

      const response = await request(app)
        .put(`/api/posts/${post1._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Post updated successfully");
      expect(response.body.post.title).toBe(updateData.title);
    });

    test("should enforce post ownership for deletions", async () => {
      // User1 tries to delete User2's post
      const response = await request(app)
        .delete(`/api/posts/${post2._id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(403);

      expect(response.body.error).toBe(
        "Access denied. You can only delete your own posts.",
      );
    });

    test("should allow admin to delete any post", async () => {
      const response = await request(app)
        .delete(`/api/posts/${post1._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe("Post deleted successfully");
    });

    test("should allow author to delete own post", async () => {
      const response = await request(app)
        .delete(`/api/posts/${post2._id}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body.message).toBe("Post deleted successfully");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("should handle invalid post ID formats gracefully", async () => {
      const response = await request(app)
        .get("/api/posts/invalid-id")
        .expect(400);

      expect(response.body.error).toBe("Invalid ID format");
    });

    test("should handle non-existent post updates", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .put(`/api/posts/${fakeId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: "New Title" })
        .expect(404);

      expect(response.body.error).toBe("Post not found");
    });

    test("should handle missing search query", async () => {
      const response = await request(app).get("/api/posts/search").expect(400);

      expect(response.body.error).toBe("Missing query parameter");
    });

    test("should handle expired tokens", async () => {
      // Note: This would require manipulating the token or waiting for expiration
      // For now, we test the error handling with an invalid token
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", "Bearer invalid.token.here")
        .send({ title: "Test", content: "Test" })
        .expect(401);

      expect(response.body.error).toBe("Invalid token format.");
    });

    test("should handle database validation errors", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: "" }) // Missing required content
        .expect(400);

      expect(response.body.error).toBe("Title and content are required");
    });
  });

  describe("Data Consistency and Relationships", () => {
    test("should maintain data consistency between users and posts", async () => {
      // Get all posts
      const postsResponse = await request(app).get("/api/posts").expect(200);

      // Verify post authors exist as users
      for (const post of postsResponse.body) {
        const userResponse = await request(app)
          .get(`/api/users/${post.author}`)
          .expect(200);

        expect(userResponse.body.uuid).toBe(post.author);
      }
    });

    test("should handle case sensitivity properly", async () => {
      // Test login with different email case
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "ALICE@EXAMPLE.COM", // Uppercase
          password: "password123",
        })
        .expect(200);

      expect(loginResponse.body.message).toBe("Login successful");
      expect(loginResponse.body.user.email).toBe("alice@example.com"); // Should be lowercase
    });

    test("should handle concurrent operations", async () => {
      // Simulate concurrent post creation
      const postPromises = [
        request(app)
          .post("/api/posts")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ title: "Concurrent Post 1", content: "Content 1" }),
        request(app)
          .post("/api/posts")
          .set("Authorization", `Bearer ${user2Token}`)
          .send({ title: "Concurrent Post 2", content: "Content 2" }),
      ];

      const results = await Promise.all(postPromises);

      results.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Post created successfully");
      });

      // Verify both posts were created
      const allPosts = await request(app).get("/api/posts").expect(200);

      expect(allPosts.body.length).toBe(4); // 2 original + 2 concurrent
    });
  });

  describe("Performance and Pagination", () => {
    test("should handle large number of posts", async () => {
      // Create multiple posts
      const postPromises = [];
      for (let i = 0; i < 10; i++) {
        postPromises.push(
          global.testUtils.createTestPost(Post, user1, {
            title: `Performance Test Post ${i}`,
            content: `Content for post number ${i}`,
          }),
        );
      }

      await Promise.all(postPromises);

      // Fetch all posts and verify performance
      const start = Date.now();
      const response = await request(app).get("/api/posts").expect(200);
      const duration = Date.now() - start;

      expect(response.body.length).toBe(12); // 2 original + 10 new
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    test("should handle search with multiple results", async () => {
      // Create posts with searchable content
      await global.testUtils.createTestPost(Post, user1, {
        title: "JavaScript Tutorial",
        content: "Learn JavaScript programming",
      });

      await global.testUtils.createTestPost(Post, user2, {
        title: "Advanced JavaScript",
        content: "Advanced JavaScript concepts and patterns",
      });

      const searchResponse = await request(app)
        .get("/api/posts/search?query=javascript")
        .expect(200);

      expect(searchResponse.body.length).toBe(2);
      searchResponse.body.forEach((post) => {
        const hasJavaScriptInTitle = post.title
          .toLowerCase()
          .includes("javascript");
        const hasJavaScriptInContent = post.content
          .toLowerCase()
          .includes("javascript");
        expect(hasJavaScriptInTitle || hasJavaScriptInContent).toBe(true);
      });
    });
  });
});
