import { describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "../testApp.js";
import User from "../../models/User.js";
import { generateToken } from "../../middleware/auth.js";

const app = createTestApp();

describe("User Routes", () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create a test user for authentication
    testUser = await global.testUtils.createTestUser(User, {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "author",
    });

    authToken = generateToken(testUser);
  });

  describe("POST /api/users/login", () => {
    test("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        uuid: testUser.uuid,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
      });

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.uuid).toBe(testUser.uuid);
    });

    test("should reject login with invalid email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe("Invalid email or password");
      expect(response.body.token).toBeUndefined();
    });

    test("should reject login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe("Invalid email or password");
      expect(response.body.token).toBeUndefined();
    });

    test("should require email and password", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body.error).toBe("Email and password are required");
    });

    test("should handle case insensitive email login", async () => {
      const loginData = {
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
    });
  });

  describe("POST /api/users/logout", () => {
    test("should logout successfully with valid token", async () => {
      const response = await request(app)
        .post("/api/users/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe("Logout successful");
      expect(response.body.instruction).toBe(
        "Please remove the token from your client storage",
      );
    });

    test("should require authentication", async () => {
      const response = await request(app).post("/api/users/logout").expect(401);

      expect(response.body.error).toBe(
        "Access denied. No valid authorization header provided.",
      );
    });

    test("should reject invalid token", async () => {
      const response = await request(app)
        .post("/api/users/logout")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.error).toBe("Invalid token format.");
    });
  });

  describe("GET /api/users/me", () => {
    test("should get current user profile", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toEqual({
        uuid: testUser.uuid,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
      });
    });

    test("should require authentication", async () => {
      const response = await request(app).get("/api/users/me").expect(401);

      expect(response.body.error).toBe(
        "Access denied. No valid authorization header provided.",
      );
    });
  });

  describe("PUT /api/users/me", () => {
    test("should update user profile", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Profile updated successfully");
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.email).toBe(updateData.email);

      // Verify in database
      const updatedUser = await User.findOne({ uuid: testUser.uuid });
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(updateData.email);
    });

    test("should reject duplicate email", async () => {
      // Create another user
      await global.testUtils.createTestUser(User, {
        name: "Other User",
        email: "other@example.com",
        password: "password123",
      });

      const updateData = {
        email: "other@example.com",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe(
        "Email is already taken by another user",
      );
    });

    test("should allow partial updates", async () => {
      const updateData = {
        name: "Only Name Update",
      };

      const response = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.email).toBe(testUser.email); // Should remain unchanged
    });

    test("should require authentication", async () => {
      const response = await request(app)
        .put("/api/users/me")
        .send({ name: "New Name" })
        .expect(401);

      expect(response.body.error).toBe(
        "Access denied. No valid authorization header provided.",
      );
    });
  });

  describe("PUT /api/users/me/password", () => {
    test("should change password with valid current password", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .put("/api/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe("Password updated successfully");

      // Verify new password works for login
      const loginResponse = await request(app)
        .post("/api/users/login")
        .send({
          email: testUser.email,
          password: "newpassword123",
        })
        .expect(200);

      expect(loginResponse.body.message).toBe("Login successful");
    });

    test("should reject incorrect current password", async () => {
      const passwordData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .put("/api/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe("Current password is incorrect");
    });

    test("should require password minimum length", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "123", // Too short
      };

      const response = await request(app)
        .put("/api/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe(
        "New password must be at least 6 characters long",
      );
    });

    test("should require both current and new password", async () => {
      const response = await request(app)
        .put("/api/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ currentPassword: "password123" })
        .expect(400);

      expect(response.body.error).toBe(
        "Current password and new password are required",
      );
    });

    test("should require authentication", async () => {
      const response = await request(app)
        .put("/api/users/me/password")
        .send({
          currentPassword: "password123",
          newPassword: "newpassword123",
        })
        .expect(401);

      expect(response.body.error).toBe(
        "Access denied. No valid authorization header provided.",
      );
    });
  });

  describe("POST /api/users", () => {
    test("should create a new user", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        role: "reader",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body.uuid).toBeDefined();
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe(userData.role);
      expect(response.body.password).toBeUndefined(); // Should not return password

      // Verify in database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
    });

    test("should create user with default role", async () => {
      const userData = {
        name: "Default Role User",
        email: "defaultrole@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body.role).toBe("author"); // Default role
    });

    test("should reject duplicate email", async () => {
      const userData = {
        name: "Duplicate User",
        email: testUser.email, // Use existing email
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe("User with this email already exists");
    });

    test("should require all required fields", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "Incomplete User" })
        .expect(400);

      expect(response.body.error).toBe(
        "Name, email, and password are required",
      );
    });
  });

  describe("GET /api/users", () => {
    test("should get all users", async () => {
      // Create additional test users
      await global.testUtils.createTestUser(User, {
        name: "User 2",
        email: "user2@example.com",
        password: "password123",
      });

      await global.testUtils.createTestUser(User, {
        name: "User 3",
        email: "user3@example.com",
        password: "password123",
      });

      const response = await request(app).get("/api/users").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3); // Original testUser + 2 new users

      // Ensure passwords are not returned
      response.body.forEach((user) => {
        expect(user.password).toBeUndefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.uuid).toBeDefined();
      });
    });
  });

  describe("GET /api/users/:uuid", () => {
    test("should get user by UUID", async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.uuid}`)
        .expect(200);

      expect(response.body.uuid).toBe(testUser.uuid);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body.password).toBeUndefined(); // Should not return password
    });

    test("should return 404 for non-existent user", async () => {
      const fakeUuid = "550e8400-e29b-41d4-a716-446655440000";

      const response = await request(app)
        .get(`/api/users/${fakeUuid}`)
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });
  });
});
