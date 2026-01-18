import express from 'express';
import { 
  register, 
  login, 
  verifyToken, 
  logout, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rutas protegidas
router.get('/verify-token', authenticateToken, verifyToken);
router.post('/logout', authenticateToken, logout);

export default router;