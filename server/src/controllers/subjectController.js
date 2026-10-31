import Subject from '../models/Subject.js';
import { success } from '../utils/apiResponse.js';

/**
 * GET /api/subjects
 * Public. Returns all active subjects for dropdowns and filtering.
 */
export async function getSubjects(req, res, next) {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 }).lean();
    return success(res, 200, 'Subjects retrieved', { subjects });
  } catch (err) {
    next(err);
  }
}
