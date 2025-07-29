import { Router } from 'express';
const router = Router();
import { getAllPosts, getPostById, createPost, updatePost, deletePost, searchPosts } from '../postsController';
// Uncomment the line below if you want to use authentication middleware
// const { authenticateUser } = require('../middleware/auth');

// Important: define search BEFORE :id
router.get('/search', searchPosts);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
// Use authentication middleware for protected routes
// router.post('/', authenticateUser, createPost);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;