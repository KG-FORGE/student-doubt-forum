import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { success, error as apiError } from '../utils/apiResponse.js';

/**
 * GET /api/notifications
 * Authenticated. Lists recent notifications for current user.
 */
export async function getNotifications(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return success(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount,
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
 * GET /api/notifications/unread-count
 * Authenticated. Quick unread counter.
 */
export async function getUnreadCount(req, res, next) {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    return success(res, 200, 'Unread count retrieved', { unreadCount });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/:id/read
 * Authenticated. Marks a single notification as read.
 */
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError(res, 400, 'Invalid notification ID');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return apiError(res, 404, 'Notification not found');
    }

    return success(res, 200, 'Notification marked as read', { notification });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/read-all
 * Authenticated. Marks all notifications for user as read.
 */
export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true },
    );

    return success(res, 200, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}
