import { Router } from 'express';
const router = Router();
import User from '../models/User.js';
import { generateToken, authenticateUser } from '../middleware/auth.js';
import { authRateLimit, registrationRateLimit } from '../middleware/rateLimit.js';

// Register new user
router.post('/register', registrationRateLimit, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'author'
    });

    await newUser.save();

    // Generate token for immediate login after registration
    const token = generateToken(newUser);

    // Return user data and token (auto-login after registration)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        uuid: newUser.uuid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', authRateLimit, async (req, res) => {
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

// Logout user (JWT is stateless, so this is mainly for logging purposes)
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Log the logout action
    console.log(`User ${req.user.email} (${req.user.uuid}) logged out at ${new Date().toISOString()}`);
        
    res.json({
      message: 'Logout successful',
      instruction: 'Please remove the token from your client storage'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token and get user info
router.get('/verify', authenticateUser, async (req, res) => {
  try {
    res.json({
      message: 'Token is valid',
      user: {
        uuid: req.user.uuid,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token (generate new token with same payload)
router.post('/refresh', authenticateUser, async (req, res) => {
  try {
    // Generate new token with current user data
    const newToken = generateToken(req.user);
        
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        uuid: req.user.uuid,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
