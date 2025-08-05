import { Router } from 'express';
const router = Router();
import User from '../models/User.js';
import { generateToken, authenticateUser } from '../middleware/auth.js';

// User login/authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User logout (since JWT is stateless, this is mainly for client-side token removal)
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // Here we can log the logout action and provide confirmation
    console.log(`User ${req.user.email} logged out at ${new Date().toISOString()}`);

    res.json({
      message: 'Logout successful',
      instruction: 'Please remove the token from your client storage'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile (requires authentication)
router.get('/me', authenticateUser, async (req, res) => {
  try {
    // User info is already attached to req.user by the authenticateUser middleware
    res.json({
      user: {
        uuid: req.user.uuid,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile (requires authentication)
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        uuid: { $ne: req.user.uuid } // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email is already taken by another user'
        });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { uuid: req.user.uuid },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        uuid: updatedUser.uuid,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password (requires authentication)
router.put('/me/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // Find user with password field
    const user = await User.findOne({ uuid: req.user.uuid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Validate email is a string to prevent NoSQL injection
    if (typeof email !== 'string') {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'author'
    });

    await newUser.save();

    // Don't return password
    const userResponse = {
      uuid: newUser.uuid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    res.status(201).json(userResponse);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by UUID
router.get('/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.params.uuid }, '-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
