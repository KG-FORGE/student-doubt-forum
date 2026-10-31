import { Router } from 'express';
import { castVote, getUserVotes } from '../controllers/voteController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/', authenticate, castVote);
router.get('/user', authenticate, getUserVotes);

export default router;
