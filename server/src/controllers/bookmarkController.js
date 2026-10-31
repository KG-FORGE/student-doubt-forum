import mongoose from 'mongoose';
import Bookmark from '../models/Bookmark.js';
import Question from '../models/Question.js';
import { success, error as apiError } from '../utils/apiResponse.js';

/**
 * GET /api/bookmarks
 * Authenticated. Lists questions bookmarked by the current user.
 */
export async function getBookmarks(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [total, bookmarks] = await Promise.all([
      Bookmark.countDocuments({ user: req.user._id }),
      Bookmark.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'question',
          populate: [
            { path: 'author', select: 'name avatarUrl role reputation' },
            { path: 'subject', select: 'name' },
          ],
        })
        .lean(),
    ]);

    // Filter out bookmarks where the question might have been deleted
    const validQuestions = bookmarks
      .map((b) => b.question)
      .filter((q) => q && q.status !== 'removed');

    return success(res, 200, 'Bookmarks retrieved', {
      bookmarks: validQuestions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookmarks
 * Authenticated. Adds a question to user bookmarks.
 */
export async function addBookmark(req, res, next) {
  try {
    const { questionId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return apiError(res, 400, 'Invalid question ID');
    }

    const question = await Question.findById(questionId);
    if (!question || question.status === 'removed') {
      return apiError(res, 404, 'Question not found');
    }

    // Upsert bookmark
    await Bookmark.findOneAndUpdate(
      { user: req.user._id, question: questionId },
      { user: req.user._id, question: questionId },
      { upsert: true, new: true },
    );

    return success(res, 201, 'Question bookmarked', { isBookmarked: true, questionId });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/bookmarks/:questionId
 * Authenticated. Removes a question from user bookmarks.
 */
export async function removeBookmark(req, res, next) {
  try {
    const { questionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return apiError(res, 400, 'Invalid question ID');
    }

    await Bookmark.findOneAndDelete({ user: req.user._id, question: questionId });

    return success(res, 200, 'Bookmark removed', { isBookmarked: false, questionId });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookmarks/ids
 * Authenticated. Returns all bookmarked question IDs for current user.
 */
export async function getBookmarkedIds(req, res, next) {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).select('question').lean();
    const ids = bookmarks.map((b) => b.question.toString());
    return success(res, 200, 'Bookmarked IDs retrieved', { bookmarkedIds: ids });
  } catch (err) {
    next(err);
  }
}
