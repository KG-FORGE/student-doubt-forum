import { Router } from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  getBookmarkedIds,
} from '../controllers/bookmarkController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate); // All bookmark routes require authentication

router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:questionId', removeBookmark);
router.get('/ids', getBookmarkedIds);

export default router;
