import express from 'express';
import { getFriends, removeFriend } from '../controllers/FriendShipController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getFriends);
router.delete('/:friendId', removeFriend);

export default router;