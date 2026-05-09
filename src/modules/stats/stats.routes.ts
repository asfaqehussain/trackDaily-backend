import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { statsController } from './stats.controller';

const router = Router();

router.get('/', authenticate, statsController);

export default router;
