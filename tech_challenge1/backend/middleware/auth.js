const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate and extract user UUID from JWT token
exports.authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not set.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ uuid: decoded.uuid });

        if (!user) {
            return res.status(401).json({ error: 'Invalid token - user not found.' });
        }

        req.user = {
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
}
