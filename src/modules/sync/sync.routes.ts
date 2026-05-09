import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { syncController } from './sync.controller';

const router = Router();

// POST /sync — batch offline queue replay
router.post('/', authenticate, syncController);

export default router;
