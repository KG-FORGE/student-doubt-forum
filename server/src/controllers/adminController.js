import mongoose from 'mongoose';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Report from '../models/Report.js';
import Subject from '../models/Subject.js';
import Announcement from '../models/Announcement.js';
import AuditLog from '../models/AuditLog.js';
import RefreshToken from '../models/RefreshToken.js';
import Notification from '../models/Notification.js';
import { writeAuditLog } from '../utils/audit.js';
import { success, error as apiError } from '../utils/apiResponse.js';

// ── Stats ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 */
export async function getPlatformStats(_req, res, next) {
  try {
    const [
      totalUsers,
      studentsCount,
      teachersCount,
      adminsCount,
      suspendedUsersCount,
      totalQuestions,
      openQuestions,
      verifiedDoubtsCount,
      totalAnswers,
      verifiedAnswers,
      pendingReportsCount,
      totalSubjects,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'suspended' }),
      Question.countDocuments({ status: { $ne: 'removed' } }),
      Question.countDocuments({ status: 'open' }),
      Question.countDocuments({ hasVerifiedAnswer: true, status: { $ne: 'removed' } }),
      Answer.countDocuments({ status: 'visible' }),
      Answer.countDocuments({ isVerified: true, status: 'visible' }),
      Report.countDocuments({ status: 'pending' }),
      Subject.countDocuments({ isActive: true }),
    ]);

    return success(res, 200, 'Platform statistics retrieved', {
      stats: {
        users: {
          total: totalUsers,
          students: studentsCount,
          teachers: teachersCount,
          admins: adminsCount,
          suspended: suspendedUsersCount,
        },
        questions: {
          total: totalQuestions,
          open: openQuestions,
          verified: verifiedDoubtsCount,
        },
        answers: {
          total: totalAnswers,
          verified: verifiedAnswers,
        },
        moderation: {
          pendingReports: pendingReportsCount,
        },
        subjects: {
          active: totalSubjects,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Users Management ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 */
export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const { search, role, status } = req.query;

    const query = {};
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      query.role = role;
    }
    if (status && ['active', 'suspended'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash')
        .lean(),
    ]);

    return success(res, 200, 'Users retrieved', {
      users,
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
 * PUT /api/admin/users/:id/role
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return apiError(res, 400, 'Invalid role. Must be student, teacher, or admin');
    }

    if (id === req.user._id) {
      return apiError(res, 400, 'You cannot modify your own administrator role');
    }

    const user = await User.findById(id);
    if (!user) {
      return apiError(res, 404, 'User not found');
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await writeAuditLog({
      actor: req.user._id,
      action: 'role_change',
      targetType: 'User',
      targetId: user._id,
      metadata: { oldRole, newRole: role, targetEmail: user.email },
    });

    return success(res, 200, `User role updated to ${role}`, { user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/users/:id/status
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return apiError(res, 400, 'Invalid status. Must be active or suspended');
    }

    if (id === req.user._id) {
      return apiError(res, 400, 'You cannot suspend your own account');
    }

    const user = await User.findById(id);
    if (!user) {
      return apiError(res, 404, 'User not found');
    }

    user.status = status;
    if (status === 'suspended') {
      user.suspendedAt = new Date();
      user.suspendedReason = reason || 'Suspended by administrator';
      // Invalidate all active sessions for suspended user
      await RefreshToken.deleteMany({ user: id });
    } else {
      user.suspendedAt = null;
      user.suspendedReason = '';
    }

    await user.save();

    await writeAuditLog({
      actor: req.user._id,
      action: status === 'suspended' ? 'account_suspended' : 'account_reactivated',
      targetType: 'User',
      targetId: user._id,
      metadata: { status, reason, targetEmail: user.email },
    });

    try {
      await Notification.create({
        recipient: user._id,
        type: status === 'suspended' ? 'account_suspended' : 'account_reactivated',
        message:
          status === 'suspended'
            ? `Your account has been suspended: ${reason || 'Terms violation'}`
            : 'Your account has been reactivated. You may now participate in discussions.',
      });
    } catch (_) {}

    return success(res, 200, `User account ${status}`, { user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
}

// ── Moderation / Reports ───────────────────────────────────────────────────────

/**
 * GET /api/admin/reports
 */
export async function getReports(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const { status } = req.query;

    const query = {};
    if (status && ['pending', 'resolved', 'dismissed'].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [total, reports] = await Promise.all([
      Report.countDocuments(query),
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reporter', 'name email role')
        .populate('resolvedBy', 'name role')
        .lean(),
    ]);

    // Populate targets dynamically
    const enrichedReports = await Promise.all(
      reports.map(async (rep) => {
        let targetContent = null;
        if (rep.targetType === 'Question') {
          targetContent = await Question.findById(rep.target)
            .select('title description status author')
            .populate('author', 'name email')
            .lean();
        } else if (rep.targetType === 'Answer') {
          targetContent = await Answer.findById(rep.target)
            .select('content status question author')
            .populate('author', 'name email')
            .populate('question', 'title')
            .lean();
        }
        return { ...rep, targetItem: targetContent };
      }),
    );

    return success(res, 200, 'Reports retrieved', {
      reports: enrichedReports,
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
 * PUT /api/admin/reports/:id
 */
export async function resolveReport(req, res, next) {
  try {
    const { id } = req.params;
    const { status, actionTaken, moderatorNote } = req.body;

    if (!['resolved', 'dismissed'].includes(status)) {
      return apiError(res, 400, 'Status must be resolved or dismissed');
    }

    const report = await Report.findById(id);
    if (!report) {
      return apiError(res, 404, 'Report not found');
    }

    report.status = status;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    report.moderatorNote = moderatorNote || '';
    await report.save();

    // If requested, take action on content
    if (actionTaken === 'remove_content') {
      const TargetModel = report.targetType === 'Question' ? Question : Answer;
      const target = await TargetModel.findById(report.target);
      if (target) {
        target.status = 'removed';
        await target.save();

        await writeAuditLog({
          actor: req.user._id,
          action: 'content_removed',
          targetType: report.targetType,
          targetId: report.target,
          metadata: { reportId: report._id, reason: report.reason },
        });

        // Notify author
        try {
          await Notification.create({
            recipient: target.author,
            type: 'moderation',
            message: `Your ${report.targetType.toLowerCase()} was removed by moderators for: ${report.reason}`,
          });
        } catch (_) {}
      }
    }

    await writeAuditLog({
      actor: req.user._id,
      action: status === 'resolved' ? 'report_resolved' : 'report_dismissed',
      targetType: 'Report',
      targetId: report._id,
      metadata: { actionTaken, moderatorNote },
    });

    return success(res, 200, `Report marked as ${status}`, { report });
  } catch (err) {
    next(err);
  }
}

// ── Subjects Management ────────────────────────────────────────────────────────

export async function createSubject(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length < 2) {
      return apiError(res, 400, 'Subject name must be at least 2 characters');
    }

    const existing = await Subject.findOne({ name: name.trim() });
    if (existing) {
      return apiError(res, 409, 'A subject with this name already exists');
    }

    const subject = await Subject.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      isActive: true,
    });

    await writeAuditLog({
      actor: req.user._id,
      action: 'subject_created',
      targetType: 'Subject',
      targetId: subject._id,
      metadata: { name: subject.name },
    });

    return success(res, 201, 'Subject created successfully', { subject });
  } catch (err) {
    next(err);
  }
}

export async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return apiError(res, 404, 'Subject not found');
    }

    if (name) subject.name = name.trim();
    if (description !== undefined) subject.description = description.trim();
    if (isActive !== undefined) subject.isActive = Boolean(isActive);

    await subject.save();

    return success(res, 200, 'Subject updated successfully', { subject });
  } catch (err) {
    next(err);
  }
}

export async function getAdminSubjects(_req, res, next) {
  try {
    const subjects = await Subject.find().sort({ name: 1 }).lean();
    return success(res, 200, 'Subjects retrieved', { subjects });
  } catch (err) {
    next(err);
  }
}

// ── Announcements Management ───────────────────────────────────────────────────

export async function getAnnouncements(_req, res, next) {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name role')
      .lean();
    return success(res, 200, 'Announcements retrieved', { announcements });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(req, res, next) {
  try {
    const { title, content, isPublished } = req.body;
    if (!title || !content) {
      return apiError(res, 400, 'Title and content are required');
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      author: req.user._id,
    });

    await writeAuditLog({
      actor: req.user._id,
      action: 'announcement_published',
      targetType: 'Announcement',
      targetId: announcement._id,
      metadata: { title: announcement.title, isPublished: announcement.isPublished },
    });

    return success(res, 201, 'Announcement created', { announcement });
  } catch (err) {
    next(err);
  }
}

export async function updateAnnouncement(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, isPublished } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return apiError(res, 404, 'Announcement not found');
    }

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (isPublished !== undefined) {
      announcement.isPublished = Boolean(isPublished);
      if (announcement.isPublished && !announcement.publishedAt) {
        announcement.publishedAt = new Date();
      }
    }

    await announcement.save();
    return success(res, 200, 'Announcement updated', { announcement });
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnouncement(req, res, next) {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    return success(res, 200, 'Announcement deleted');
  } catch (err) {
    next(err);
  }
}

// ── Audit Logs ─────────────────────────────────────────────────────────────────

export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email role')
        .lean(),
    ]);

    return success(res, 200, 'Audit logs retrieved', {
      logs,
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
