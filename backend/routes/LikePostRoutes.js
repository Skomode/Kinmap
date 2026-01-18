import express from 'express';
import { 
  toggleLike, 
  getPostLikes, 
  checkUserLike, 
  getUserLikeStats 
} from '../controllers/LikeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


router.post('/posts/:postId/like', authenticateToken, toggleLike);
router.get('/posts/:postId/likes', authenticateToken, getPostLikes);
router.get('/posts/:postId/like-status', authenticateToken, checkUserLike);
router.get('/user/like-stats', authenticateToken, getUserLikeStats);

export default router;