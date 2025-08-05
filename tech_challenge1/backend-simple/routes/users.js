import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/usersController.js';

const router = Router();

// User routes
router.get('/', getAllUsers);           // Get all users
router.get('/:uuid', getUserById);      // Get user by UUID
router.post('/', createUser);           // Create user
router.put('/:uuid', updateUser);       // Update user
router.delete('/:uuid', deleteUser);    // Delete user

export default router;
