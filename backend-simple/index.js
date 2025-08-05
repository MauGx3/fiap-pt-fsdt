
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';

import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// middleware
app.use(cors()); // Enable CORS for all routes
app.use(json({ limit: '10mb' })); // Parse JSON bodies with size limit

// routes
app.use('/api/posts', postsRoutes); // Posts routes
app.use('/api/users', usersRoutes); // User management routes

// health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '0.1',
    environment: NODE_ENV
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'API blog alunos e professores',
    version: '1.0.0',
    description: 'API para gestão do blog de alunos e professores',
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

app.use('*', (req, res) => {
  res.status(404).json({
    error: '404',
    message: 'not found',
    availableRoutes: ['/api', '/health', '/api/posts', '/api/users']
  });
});

// database
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/simple-blog';
    await connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

startServer();
