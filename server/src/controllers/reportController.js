import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { reportSchema } from '../validators/answerValidators.js';
import { success, error as apiError } from '../utils/apiResponse.js';

/**
 * POST /api/reports
 * Authenticated. Submit a moderation report on a Question or Answer.
 */
export async function createReport(req, res, next) {
  try {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(res, 400, 'Validation failed', parsed.error.errors);
    }

    const { targetType, targetId, reason, description } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return apiError(res, 400, 'Invalid target ID format');
    }

    const TargetModel = targetType === 'Question' ? Question : Answer;
    const target = await TargetModel.findById(targetId);

    if (!target) {
      return apiError(res, 404, `${targetType} not found`);
    }

    // Check if user already reported this item and it's still pending
    const existing = await Report.findOne({
      reporter: req.user._id,
      target: targetId,
      status: 'pending',
    });

    if (existing) {
      return apiError(res, 409, 'You have already reported this item and it is currently pending review');
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      target: targetId,
      reason,
      description: description || '',
      status: 'pending',
    });

    return success(res, 201, 'Report submitted successfully. Our team will review it.', {
      reportId: report._id,
    });
  } catch (err) {
    next(err);
  }
}
