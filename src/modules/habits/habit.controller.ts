import { Request, Response, NextFunction } from 'express';
import * as habitService from './habit.service';
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

export async function getHabitsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const habits = await habitService.getHabits(req.userId);
    sendSuccess({ res, data: habits });
  } catch (err) {
    next(err);
  }
}

export async function createHabitController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const habit = await habitService.createHabit(req.userId, req.body);
    sendSuccess({ res, data: habit, message: 'Habit created', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateHabitController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const habit = await habitService.updateHabit(req.userId, req.params.id, req.body);
    if (!habit) {
      sendError({ res, message: 'Habit not found', statusCode: 404 });
      return;
    }
    sendSuccess({ res, data: habit, message: 'Habit updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteHabitController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await habitService.deleteHabit(req.userId, req.params.id);
    if (!deleted) {
      sendError({ res, message: 'Habit not found', statusCode: 404 });
      return;
    }
    sendSuccess({ res, message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
}

export async function checkInController(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!handleValidation(req, res)) return;
  try {
    const habit = await habitService.checkIn(req.userId, req.params.id, req.body);
    if (!habit) {
      sendError({ res, message: 'Habit not found', statusCode: 404 });
      return;
    }
    sendSuccess({ res, data: habit, message: 'Check-in recorded' });
  } catch (err) {
    next(err);
  }
}
