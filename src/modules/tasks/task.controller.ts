import { Request, Response, NextFunction } from 'express';
import * as taskService from './task.service';
import { sendSuccess, sendError } from '../../utils/response';
import { validationResult } from 'express-validator';

function handleValidation(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError({ res, message: errors.array()[0].msg as string, statusCode: 400 });
    return false;
  }
  return true;
}

export async function getTasksController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await taskService.getTasks(req.userId);
    sendSuccess({ res, data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function createTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const task = await taskService.createTask(req.userId, req.body);
    sendSuccess({ res, data: task, message: 'Task created', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const task = await taskService.updateTask(req.userId, req.params.id, req.body);
    if (!task) {
      sendError({ res, message: 'Task not found', statusCode: 404 });
      return;
    }
    sendSuccess({ res, data: task, message: 'Task updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await taskService.deleteTask(req.userId, req.params.id);
    if (!deleted) {
      sendError({ res, message: 'Task not found', statusCode: 404 });
      return;
    }
    sendSuccess({ res, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}
