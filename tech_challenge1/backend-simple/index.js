// Framework imports
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';

// Route imports
import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(json({ limit: '10mb' })); // Parse JSON bodies with size limit

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/posts', postsRoutes); // Posts routes  
app.use('/api/users', usersRoutes); // User management routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-simple',
    environment: NODE_ENV
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Simple Blog API',
    version: '1.0.0',
    description: 'A simplified blog API without authentication',
    endpoints: {
      posts: {
        'GET /api/posts': 'Get all posts',
        'GET /api/posts/:id': 'Get post by ID',
        'POST /api/posts': 'Create new post',
        'PUT /api/posts/:id': 'Update post',
        'DELETE /api/posts/:id': 'Delete post',
        'GET /api/posts/search?query=text': 'Search posts',
        'POST /api/posts/:id/comments': 'Add comment to post',
        'DELETE /api/posts/:postId/comments/:commentId': 'Delete comment'
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:uuid': 'Get user by UUID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:uuid': 'Update user',
        'DELETE /api/users/:uuid': 'Delete user'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
    availableRoutes: ['/api', '/health', '/api/posts', '/api/users']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      details: err.message
    });
  }
  
  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Database connection
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/simple-blog';
    await connect(mongoUri);
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Simple Blog API Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Start the application
startServer();
