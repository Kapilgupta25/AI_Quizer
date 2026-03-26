import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createRoom, joinRoom, getRoom, getLeaderboard } from '../controllers/roomController.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  [
    body('topic').trim().isLength({ min: 2, max: 100 }).withMessage('Topic must be 2-100 characters'),
    body('questionCount').isInt({ min: 3, max: 20 }).withMessage('Question count must be 3-20'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('timeLimitSeconds').isInt({ min: 10, max: 60 }).withMessage('Time limit must be 10-60 seconds'),
  ],
  validate,
  createRoom
);

router.post('/:code/join', authenticate, joinRoom);
router.get('/:code', authenticate, getRoom);
router.get('/:code/leaderboard', authenticate, getLeaderboard);

export default router;