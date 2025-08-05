import { Router } from 'express';
import { 
  getAllPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost, 
  searchPosts,
  addComment,
  deleteComment
} from '../controllers/postsController.js';

const router = Router();

// Post routes
router.get('/search', searchPosts);     // Search posts - Important: define search BEFORE :id
router.get('/', getAllPosts);           // Get all posts
router.get('/:id', getPostById);        // Get single post
router.post('/', createPost);           // Create post
router.put('/:id', updatePost);         // Update post
router.delete('/:id', deletePost);      // Delete post

// Comment routes
router.post('/:id/comments', addComment);           // Add comment to post
router.delete('/:postId/comments/:commentId', deleteComment); // Delete comment from post

export default router;
