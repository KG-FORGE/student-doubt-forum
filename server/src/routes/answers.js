import { Router } from 'express';
import {
  getAnswersForQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  toggleVerifyAnswer,
} from '../controllers/answerController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireTeacherOrAdmin } from '../middleware/authorize.js';

const router = Router({ mergeParams: true });

// Mounted at both /api/answers and /api/questions/:questionId/answers
router.get('/', getAnswersForQuestion);
router.post('/', authenticate, createAnswer);
router.put('/:id', authenticate, updateAnswer);
router.delete('/:id', authenticate, deleteAnswer);
router.put('/:id/verify', authenticate, requireTeacherOrAdmin, toggleVerifyAnswer);

export default router;
