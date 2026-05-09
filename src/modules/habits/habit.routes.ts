import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  getHabitsController,
  createHabitController,
  updateHabitController,
  deleteHabitController,
  checkInController,
} from './habit.controller';

const router = Router();

// All habit routes require authentication
router.use(authenticate);

// GET /habits
router.get('/', getHabitsController);

// POST /habits
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Habit name is required')],
  createHabitController
);

// PATCH /habits/:id
router.patch(
  '/:id',
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  updateHabitController
);

// DELETE /habits/:id
router.delete('/:id', deleteHabitController);

// POST /habits/:id/checkin — RN calls this endpoint (not /complete)
router.post(
  '/:id/checkin',
  [body('date').notEmpty().withMessage('date is required (YYYY-MM-DD)')],
  checkInController
);

export default router;
