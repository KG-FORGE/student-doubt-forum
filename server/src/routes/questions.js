import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleQuestionStatus,
} from '../controllers/questionController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', authenticate, createQuestion);
router.put('/:id', authenticate, updateQuestion);
router.delete('/:id', authenticate, deleteQuestion);
router.patch('/:id/status', authenticate, toggleQuestionStatus);

export default router;
