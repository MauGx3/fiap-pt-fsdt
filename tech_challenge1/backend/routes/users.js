import { Router } from 'express';
const router = Router();
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

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

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
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
    } catch (err) {
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
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
