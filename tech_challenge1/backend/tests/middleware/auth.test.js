import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import {
  generateToken,
  authenticateUser,
  requireRole,
} from "../../middleware/auth.js";
import User from "../../models/User.js";

describe("Authentication Middleware", () => {
  let mockUser;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockUser = {
      uuid: "test-uuid-123",
      name: "Test User",
      email: "test@example.com",
      role: "author",
    };

    mockReq = {
      header: jest.fn(),
      user: null,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("generateToken", () => {
    test("should generate a valid JWT token", () => {
      const token = generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      // Verify token content
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.uuid).toBe(mockUser.uuid);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.iss).toBe("blog-api");
      expect(decoded.sub).toBe(mockUser.uuid);
    });

    test("should generate token with custom expiration", () => {
      const originalExpiresIn = process.env.JWT_EXPIRES_IN;
      process.env.JWT_EXPIRES_IN = "2h";

      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.exp - decoded.iat).toBe(2 * 60 * 60); // 2 hours in seconds

      process.env.JWT_EXPIRES_IN = originalExpiresIn;
    });
  });

  describe("authenticateUser", () => {
    test("should authenticate valid token successfully", async () => {
      const token = generateToken(mockUser);
      mockReq.header.mockReturnValue(`Bearer ${token}`);

      // Mock User.findOne to return our test user
      const mockFindOne = jest.spyOn(User, "findOne").mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await authenticateUser(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();

      mockFindOne.mockRestore();
    });

    test("should reject request without authorization header", async () => {
      mockReq.header.mockReturnValue(null);

      await authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied. No valid authorization header provided.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should reject request with invalid bearer format", async () => {
      mockReq.header.mockReturnValue("InvalidFormat token");

      await authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied. No valid authorization header provided.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should reject expired token", async () => {
      const expiredToken = jwt.sign(
        { uuid: mockUser.uuid, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" }, // Expired 1 hour ago
      );

      mockReq.header.mockReturnValue(`Bearer ${expiredToken}`);

      await authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Token has expired.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should reject invalid token", async () => {
      mockReq.header.mockReturnValue("Bearer invalid-token");

      await authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid token format.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should reject token for non-existent user", async () => {
      const token = generateToken(mockUser);
      mockReq.header.mockReturnValue(`Bearer ${token}`);

      // Mock User.findOne to return null (user not found)
      const mockFindOne = jest.spyOn(User, "findOne").mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid token - user not found.",
      });
      expect(mockNext).not.toHaveBeenCalled();

      mockFindOne.mockRestore();
    });
  });

  describe("requireRole", () => {
    test("should allow user with required role", () => {
      mockReq.user = { ...mockUser, role: "admin" };
      const middleware = requireRole("admin", "author");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should allow user with one of multiple required roles", () => {
      mockReq.user = { ...mockUser, role: "author" };
      const middleware = requireRole("admin", "author");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should reject user without required role", () => {
      mockReq.user = { ...mockUser, role: "reader" };
      const middleware = requireRole("admin", "author");

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied. Required role: admin or author",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should reject unauthenticated user", () => {
      mockReq.user = null;
      const middleware = requireRole("admin");

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Authentication required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
