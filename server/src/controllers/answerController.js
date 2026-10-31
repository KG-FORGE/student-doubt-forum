import mongoose from 'mongoose';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { createAnswerSchema, updateAnswerSchema } from '../validators/answerValidators.js';
import { success, error as apiError } from '../utils/apiResponse.js';

/**
 * GET /api/questions/:questionId/answers or /api/answers?questionId=...
 * Public. Returns answers for a question, with verified answers at the top.
 */
export async function getAnswersForQuestion(req, res, next) {
  try {
    const questionId = req.params.questionId || req.query.questionId;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return apiError(res, 400, 'Invalid question ID');
    }

    const answers = await Answer.find({
      question: questionId,
      status: 'visible',
    })
      .sort({ isVerified: -1, voteScore: -1, createdAt: 1 })
      .populate('author', 'name avatarUrl role reputation')
      .populate('verifiedBy', 'name role')
      .lean();

    return success(res, 200, 'Answers retrieved', { answers });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/questions/:questionId/answers
 * Authenticated. Post an answer to a question.
 */
export async function createAnswer(req, res, next) {
  try {
    const questionId = req.params.questionId || req.body.questionId;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return apiError(res, 400, 'Invalid question ID');
    }

    const parsed = createAnswerSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(res, 400, 'Validation failed', parsed.error.errors);
    }

    const question = await Question.findById(questionId);
    if (!question || question.status === 'removed') {
      return apiError(res, 404, 'Question not found');
    }

    if (question.status === 'closed') {
      return apiError(res, 400, 'This question is closed and cannot accept new answers');
    }

    const answer = await Answer.create({
      question: questionId,
      author: req.user._id,
      content: parsed.data.content,
    });

    // Increment question answer count
    question.answerCount += 1;
    await question.save();

    // Notify question author if different from answer author
    if (question.author.toString() !== req.user._id) {
      try {
        const actor = await User.findById(req.user._id).select('name').lean();
        await Notification.create({
          recipient: question.author,
          type: 'new_answer',
          message: `${actor?.name || 'Someone'} answered your question "${question.title.slice(0, 40)}..."`,
          relatedType: 'Question',
          relatedId: question._id,
        });
      } catch (notifyErr) {
        console.error('Failed to create notification:', notifyErr.message);
      }
    }

    const populated = await Answer.findById(answer._id)
      .populate('author', 'name avatarUrl role reputation')
      .lean();

    return success(res, 201, 'Answer posted successfully', { answer: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/answers/:id
 * Authenticated. Author or Admin only.
 */
export async function updateAnswer(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid answer ID');
    }

    const parsed = updateAnswerSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(res, 400, 'Validation failed', parsed.error.errors);
    }

    const answer = await Answer.findById(id);
    if (!answer || answer.status === 'removed') {
      return apiError(res, 404, 'Answer not found');
    }

    const isOwner = answer.author.toString() === req.user._id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError(res, 403, 'You are not authorized to update this answer');
    }

    answer.content = parsed.data.content;
    await answer.save();

    const populated = await Answer.findById(id)
      .populate('author', 'name avatarUrl role reputation')
      .populate('verifiedBy', 'name role')
      .lean();

    return success(res, 200, 'Answer updated successfully', { answer: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/answers/:id
 * Authenticated. Author or Admin only.
 */
export async function deleteAnswer(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid answer ID');
    }

    const answer = await Answer.findById(id);
    if (!answer) {
      return apiError(res, 404, 'Answer not found');
    }

    const isOwner = answer.author.toString() === req.user._id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError(res, 403, 'You are not authorized to delete this answer');
    }

    const questionId = answer.question;

    await Promise.all([
      Answer.findByIdAndDelete(id),
      Vote.deleteMany({ target: id, targetType: 'Answer' }),
      Question.findByIdAndUpdate(questionId, { $inc: { answerCount: -1 } }),
    ]);

    // Check if question still has any verified answers
    const hasOtherVerified = await Answer.exists({ question: questionId, isVerified: true });
    if (!hasOtherVerified) {
      await Question.findByIdAndUpdate(questionId, { hasVerifiedAnswer: false });
    }

    return success(res, 200, 'Answer deleted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/answers/:id/verify
 * Authenticated. Teacher or Admin only.
 */
export async function toggleVerifyAnswer(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid answer ID');
    }

    const answer = await Answer.findById(id);
    if (!answer || answer.status === 'removed') {
      return apiError(res, 404, 'Answer not found');
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return apiError(res, 404, 'Associated question not found');
    }

    const willVerify = !answer.isVerified;

    if (willVerify) {
      answer.isVerified = true;
      answer.verifiedBy = req.user._id;
      answer.verifiedAt = new Date();
      await answer.save();

      // Update question flag
      question.hasVerifiedAnswer = true;
      await question.save();

      // Award reputation to answer author (+15 points)
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } });

      // Notify answer author
      try {
        await Notification.create({
          recipient: answer.author,
          type: 'answer_verified',
          message: `Your answer was verified by an instructor! (+15 reputation)`,
          relatedType: 'Question',
          relatedId: question._id,
        });
      } catch (notifyErr) {
        console.error('Notification error:', notifyErr.message);
      }
    } else {
      // Unverify
      answer.isVerified = false;
      answer.verifiedBy = null;
      answer.verifiedAt = null;
      await answer.save();

      // Check if any other answer is verified
      const otherVerified = await Answer.exists({ question: question._id, isVerified: true });
      question.hasVerifiedAnswer = Boolean(otherVerified);
      await question.save();

      // Deduct reputation from answer author (-15 points, min 0)
      const authorUser = await User.findById(answer.author);
      if (authorUser) {
        authorUser.reputation = Math.max(0, authorUser.reputation - 15);
        await authorUser.save();
      }
    }

    const populated = await Answer.findById(id)
      .populate('author', 'name avatarUrl role reputation')
      .populate('verifiedBy', 'name role')
      .lean();

    return success(
      res,
      200,
      willVerify ? 'Answer verified successfully' : 'Answer verification removed',
      { answer: populated },
    );
  } catch (err) {
    next(err);
  }
}
