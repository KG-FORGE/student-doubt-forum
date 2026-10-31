import { Router } from 'express';
import { createReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/', authenticate, createReport);

export default router;
