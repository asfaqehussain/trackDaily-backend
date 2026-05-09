import { Request, Response, NextFunction } from 'express';
import { processBatchSync } from './sync.service';
import { sendSuccess } from '../../utils/response';

export async function syncController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await processBatchSync(req.userId, req.body);
    sendSuccess({
      res,
      data: result,
      message: `Sync complete — tasks: ${result.tasks.synced} synced, habits: ${result.habits.synced} synced`,
    });
  } catch (err) {
    next(err);
  }
}
