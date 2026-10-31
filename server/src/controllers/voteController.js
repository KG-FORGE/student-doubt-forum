import mongoose from 'mongoose';
import Vote from '../models/Vote.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { voteSchema } from '../validators/answerValidators.js';
import { success, error as apiError } from '../utils/apiResponse.js';

/**
 * POST /api/votes
 * Authenticated. Casts, changes, or toggles off a vote on a Question or Answer.
 */
export async function castVote(req, res, next) {
  try {
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(res, 400, 'Invalid vote payload', parsed.error.errors);
    }

    const { targetType, targetId, value } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return apiError(res, 400, 'Invalid target ID format');
    }

    const TargetModel = targetType === 'Question' ? Question : Answer;
    const target = await TargetModel.findById(targetId);

    if (!target || target.status === 'removed') {
      return apiError(res, 404, `${targetType} not found`);
    }

    // Security: Prevent self-voting
    if (target.author.toString() === req.user._id) {
      return apiError(res, 400, 'You cannot vote on your own post');
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,
      targetType,
      target: targetId,
    });

    let scoreDelta = 0;
    let repDelta = 0;
    let currentVote = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off (remove vote)
        scoreDelta = -value;
        repDelta = value === 1 ? -10 : 5;
        currentVote = 0;
        await Vote.findByIdAndDelete(existingVote._id);
      } else {
        // Switch vote (e.g. +1 -> -1 or -1 -> +1)
        scoreDelta = value - existingVote.value; // e.g. -1 - 1 = -2
        repDelta = value === 1 ? 15 : -15; // from -5 to +10 is +15
        currentVote = value;
        existingVote.value = value;
        await existingVote.save();
      }
    } else {
      // New vote
      scoreDelta = value;
      repDelta = value === 1 ? 10 : -5;
      currentVote = value;
      await Vote.create({
        user: req.user._id,
        targetType,
        target: targetId,
        value,
      });

      // Notify post author on positive upvote
      if (value === 1) {
        try {
          const voter = await User.findById(req.user._id).select('name').lean();
          await Notification.create({
            recipient: target.author,
            type: 'vote_received',
            message: `${voter?.name || 'Someone'} upvoted your ${targetType.toLowerCase()}`,
            relatedType: targetType,
            relatedId: targetType === 'Question' ? target._id : target.question,
          });
        } catch (_) {}
      }
    }

    // Update target voteScore atomically
    target.voteScore = (target.voteScore || 0) + scoreDelta;
    await target.save();

    // Update target author's reputation
    const authorUser = await User.findById(target.author);
    if (authorUser) {
      authorUser.reputation = Math.max(0, (authorUser.reputation || 0) + repDelta);
      await authorUser.save();
    }

    return success(res, 200, 'Vote recorded', {
      voteScore: target.voteScore,
      userVote: currentVote,
      targetId,
      targetType,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/votes/user
 * Authenticated. Returns current user's votes for requested target IDs or all recent votes.
 */
export async function getUserVotes(req, res, next) {
  try {
    const { targetIds } = req.query;

    const query = { user: req.user._id };
    if (targetIds) {
      const ids = targetIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ids.length > 0) {
        query.target = { $in: ids };
      }
    }

    const votes = await Vote.find(query).lean();

    // Map by target ID for O(1) lookup in frontend: { [targetId]: value }
    const voteMap = {};
    votes.forEach((v) => {
      voteMap[v.target.toString()] = v.value;
    });

    return success(res, 200, 'User votes retrieved', { votes: voteMap });
  } catch (err) {
    next(err);
  }
}
