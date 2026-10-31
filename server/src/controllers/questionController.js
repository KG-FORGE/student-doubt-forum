import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Bookmark from '../models/Bookmark.js';
import Vote from '../models/Vote.js';
import Subject from '../models/Subject.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema,
} from '../validators/questionValidators.js';
import { success, error as apiError } from '../utils/apiResponse.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * GET /api/questions
 * Public. Lists questions with search, filtering, sorting, and pagination.
 */
export async function getQuestions(req, res, next) {
  try {
    const parsed = questionQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return apiError(res, 400, 'Invalid query parameters', parsed.error.errors);
    }

    const { page, limit, search, subject, tags, sort, status } = parsed.data;
    const author = req.query.author;

    const query = {
      status: status ? status : { $ne: 'removed' },
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (subject && mongoose.Types.ObjectId.isValid(subject)) {
      query.subject = subject;
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (tagList.length > 0) {
        query.tags = { $in: tagList };
      }
    }

    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { voteScore: -1, createdAt: -1 };
    } else if (sort === 'unanswered') {
      query.answerCount = 0;
      sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [total, questions] = await Promise.all([
      Question.countDocuments(query),
      Question.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatarUrl role reputation')
        .populate('subject', 'name')
        .lean(),
    ]);

    return success(res, 200, 'Questions retrieved', {
      questions,
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
 * GET /api/questions/:id
 * Public. Returns a question's detail and increments its view count.
 */
export async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid question ID format');
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true },
    )
      .populate('author', 'name avatarUrl role reputation bio createdAt')
      .populate('subject', 'name description')
      .lean();

    if (!question || question.status === 'removed') {
      return apiError(res, 404, 'Question not found');
    }

    return success(res, 200, 'Question retrieved', { question });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/questions
 * Authenticated. Creates a new doubt/question.
 */
export async function createQuestion(req, res, next) {
  try {
    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(
        res,
        400,
        'Validation failed',
        parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      );
    }

    const { title, description, tags, subject } = parsed.data;

    let validSubject = null;
    if (subject) {
      if (mongoose.Types.ObjectId.isValid(subject)) {
        const foundSubject = await Subject.findOne({ _id: subject, isActive: true });
        if (foundSubject) {
          validSubject = foundSubject._id;
        }
      }
    }

    const cleanTags = tags
      ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5)
      : [];

    const newQuestion = await Question.create({
      title,
      description,
      tags: cleanTags,
      subject: validSubject,
      author: req.user._id,
    });

    const populated = await Question.findById(newQuestion._id)
      .populate('author', 'name avatarUrl role reputation')
      .populate('subject', 'name')
      .lean();

    return success(res, 201, 'Question created successfully', { question: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/questions/:id
 * Authenticated. Author or Admin only.
 */
export async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid question ID');
    }

    const parsed = updateQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(res, 400, 'Validation failed', parsed.error.errors);
    }

    const question = await Question.findById(id);
    if (!question || question.status === 'removed') {
      return apiError(res, 404, 'Question not found');
    }

    const isOwner = question.author.toString() === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return apiError(res, 403, 'You are not authorized to update this question');
    }

    if (parsed.data.title) question.title = parsed.data.title;
    if (parsed.data.description) question.description = parsed.data.description;
    if (parsed.data.tags) {
      question.tags = parsed.data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5);
    }
    if (parsed.data.subject) {
      if (mongoose.Types.ObjectId.isValid(parsed.data.subject)) {
        question.subject = parsed.data.subject;
      }
    }

    await question.save();

    const updated = await Question.findById(id)
      .populate('author', 'name avatarUrl role reputation')
      .populate('subject', 'name')
      .lean();

    return success(res, 200, 'Question updated successfully', { question: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/questions/:id
 * Authenticated. Author or Admin only.
 */
export async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid question ID');
    }

    const question = await Question.findById(id);
    if (!question || question.status === 'removed') {
      return apiError(res, 404, 'Question not found');
    }

    const isOwner = question.author.toString() === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return apiError(res, 403, 'You are not authorized to delete this question');
    }

    // Hard delete question and clean up answers, bookmarks, votes
    await Promise.all([
      Question.findByIdAndDelete(id),
      Answer.deleteMany({ question: id }),
      Bookmark.deleteMany({ question: id }),
      Vote.deleteMany({ target: id, targetType: 'Question' }),
    ]);

    return success(res, 200, 'Question deleted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/questions/:id/status
 * Authenticated. Author or Admin. Toggle open/closed status.
 */
export async function toggleQuestionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question || question.status === 'removed') {
      return apiError(res, 404, 'Question not found');
    }

    const isOwner = question.author.toString() === req.user._id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError(res, 403, 'You are not authorized to modify this question');
    }

    question.status = question.status === 'open' ? 'closed' : 'open';
    await question.save();

    return success(res, 200, `Question marked as ${question.status}`, {
      questionId: question._id,
      status: question.status,
    });
  } catch (err) {
    next(err);
  }
}
