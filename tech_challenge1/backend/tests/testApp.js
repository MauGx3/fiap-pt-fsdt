import express, { json } from 'express';
import postsRoutes from '../routes/posts.js';
import usersRoutes from '../routes/users.js';
import authRoutes from '../routes/auth.js';
import { generalRateLimit } from '../middleware/rateLimit.js';

export function createTestApp() {
  const app = express();
  
  // CORS configuration for tests - allow all origins in test environment
  const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['*'];
  
  // CORS middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if the origin is in the allowed list
    if (origin && CORS_ALLOWED_ORIGINS.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (CORS_ALLOWED_ORIGINS.includes('*')) {
      // Allow wildcard in test environment
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  // Middleware
  app.use(generalRateLimit); // Apply rate limiting to all routes
  app.use(json({ limit: '10mb' }));
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/users', usersRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  
  // Global error handler
  app.use((err, req, res, _next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
  });
  
  return app;
}
