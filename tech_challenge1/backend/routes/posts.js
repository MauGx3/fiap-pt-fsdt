import { Router } from 'express';
const router = Router();
import { getAllPosts, getPostById, createPost, updatePost, deletePost, searchPosts } from '../postsController.js';
import { authenticateUser } from '../middleware/auth.js';
import { createPostRateLimit } from '../middleware/rateLimit.js';

// Public routes (no authentication required)
router.get('/search', searchPosts);  // Search posts - Important: define search BEFORE :id
router.get('/', getAllPosts);        // Get all posts
router.get('/:id', getPostById);     // Get single post

// Protected routes (require authentication)
router.post('/', authenticateUser, createPostRateLimit, createPost);                                    // Create post
router.put('/:id', authenticateUser, updatePost);                                  // Update post (author or admin only)
router.delete('/:id', authenticateUser, deletePost); // Delete post (admin or author only)

export default router;
