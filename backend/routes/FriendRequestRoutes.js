import express from 'express';
import { 
  sendFriendRequest, 
  getReceivedFriendRequests, 
  getSentFriendRequests, 
  respondToFriendRequest 
} from '../controllers/FriendRequestController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


router.use(authenticateToken);
router.post('/', sendFriendRequest);
router.get('/received', getReceivedFriendRequests);
router.get('/sent', getSentFriendRequests);
router.put('/:requestId/respond', respondToFriendRequest);

export default router; 