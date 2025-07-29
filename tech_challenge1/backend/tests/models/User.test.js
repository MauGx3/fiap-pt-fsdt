import { describe, expect } from '@jest/globals';
import User from '../../models/User.js';

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'author'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.uuid).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should create user with default role', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('author'); // Default role
    });

    test('should automatically generate UUID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.uuid).toBeDefined();
      expect(savedUser.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should convert email to lowercase', async () => {
      const userData = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });
  });

  describe('User Validation', () => {
    test('should require name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should require email', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should require password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate password minimum length', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345' // Too short
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate role enum', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should enforce unique email', async () => {
      const userData1 = {
        name: 'User One',
        email: 'same@example.com',
        password: 'password123'
      };

      const userData2 = {
        name: 'User Two',
        email: 'same@example.com',
        password: 'password123'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    test('should enforce unique UUID', async () => {
      const testUuid = 'test-uuid-123';
      
      const userData1 = {
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123',
        uuid: testUuid
      };

      const userData2 = {
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123',
        uuid: testUuid
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Password Handling', () => {
    test('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainPassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    test('should not rehash password if not modified', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // Update non-password field
      savedUser.name = 'Updated Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).toBe(originalHash);
    });

    test('should compare password correctly', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const isValidPassword = await savedUser.comparePassword(password);
      const isInvalidPassword = await savedUser.comparePassword('wrongPassword');

      expect(isValidPassword).toBe(true);
      expect(isInvalidPassword).toBe(false);
    });
  });

  describe('User Methods', () => {
    test('comparePassword should work with saved user', async () => {
      const user = await global.testUtils.createTestUser(User, {
        password: 'mySecretPassword'
      });

      const isCorrect = await user.comparePassword('mySecretPassword');
      const isIncorrect = await user.comparePassword('wrongPassword');

      expect(isCorrect).toBe(true);
      expect(isIncorrect).toBe(false);
    });
  });
});
