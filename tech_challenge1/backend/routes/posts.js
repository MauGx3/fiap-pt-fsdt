import { Router } from 'express';
const router = Router();
import { getAllPosts, getPostById, createPost, updatePost, deletePost, searchPosts } from '../postsController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';

// Important: define search BEFORE :id
router.get('/search', searchPosts);
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes - require authentication
router.post('/', authenticateUser, createPost);
router.put('/:id', authenticateUser, updatePost);
router.delete('/:id', authenticateUser, requireRole('admin', 'author'), deletePost);

export default router;