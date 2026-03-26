import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  googleAuth,
  refreshToken,
  logout,
  getMe,
} from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be 8+ chars with uppercase, lowercase, and number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  login
);

router.post('/google', body('idToken').notEmpty(), validate, googleAuth);

router.post('/refresh', body('refreshToken').notEmpty(), validate, refreshToken);

router.post('/logout', authenticate, logout);

router.get('/me', authenticate, getMe);

export default router;