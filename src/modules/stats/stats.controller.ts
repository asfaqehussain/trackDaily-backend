import { Request, Response, NextFunction } from 'express';
import { getStats } from './stats.service';
import { sendSuccess, sendError } from '../../utils/response';
import { StatsPeriod } from './stats.types';

export async function statsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const period = (req.query.period as StatsPeriod) || 'week';
    if (!['week', 'month', 'year'].includes(period)) {
      sendError({ res, message: 'Invalid period. Use: week, month, or year', statusCode: 400 });
      return;
    }
    const stats = await getStats(req.userId, period);
    sendSuccess({ res, data: stats });
  } catch (err) {
    next(err);
  }
}
