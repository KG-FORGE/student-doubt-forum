import { Router } from 'express';
import {
  getPlatformStats,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getReports,
  resolveReport,
  createSubject,
  updateSubject,
  getAdminSubjects,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

// Strict security: ALL admin endpoints require valid JWT authentication and role === 'admin'
router.use(authenticate, requireAdmin);

// Platform stats
router.get('/stats', getPlatformStats);

// User administration
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);

// Moderation & Reports
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

// Subjects management
router.get('/subjects', getAdminSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);

// Announcements management
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Audit logs
router.get('/audit-logs', getAuditLogs);

export default router;
