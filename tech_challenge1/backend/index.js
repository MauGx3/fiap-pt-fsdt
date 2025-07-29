// Framework imports
import express, { json } from 'express';
import { connect } from 'mongoose';

// Route imports
import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(json({ limit: '10mb' })); // Add payload size limit

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/posts', postsRoutes); // Posts routes  
app.use('/api/users', usersRoutes); // User management routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// Database connection and server startup
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ MONGO_URI environment variable not set.');
    process.exit(1);
}

const startServer = async () => {
    try {
        await connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📝 Environment: ${NODE_ENV}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
            });
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();