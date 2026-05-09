import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  getTasksController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
} from './task.controller';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /tasks
router.get('/', getTasksController);

// POST /tasks
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  createTaskController
);

// PATCH /tasks/:id  — RN uses PATCH (not PUT)
router.patch(
  '/:id',
  [body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')],
  updateTaskController
);

// DELETE /tasks/:id
router.delete('/:id', deleteTaskController);

export default router;
