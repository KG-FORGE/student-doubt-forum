import api from './api.js';

export function getStats() {
  return api.get('/admin/stats');
}

export function getUsers(params = {}) {
  return api.get('/admin/users', { params });
}

export function updateUserRole(id, role) {
  return api.put(`/admin/users/${id}/role`, { role });
}

export function updateUserStatus(id, status, reason) {
  return api.put(`/admin/users/${id}/status`, { status, reason });
}

export function getReports(params = {}) {
  return api.get('/admin/reports', { params });
}

export function resolveReport(id, data) {
  return api.put(`/admin/reports/${id}`, data);
}

export function getAdminSubjects() {
  return api.get('/admin/subjects');
}

export function createSubject(data) {
  return api.post('/admin/subjects', data);
}

export function updateSubject(id, data) {
  return api.put(`/admin/subjects/${id}`, data);
}

export function getAnnouncements() {
  return api.get('/admin/announcements');
}

export function createAnnouncement(data) {
  return api.post('/admin/announcements', data);
}

export function updateAnnouncement(id, data) {
  return api.put(`/admin/announcements/${id}`, data);
}

export function deleteAnnouncement(id) {
  return api.delete(`/admin/announcements/${id}`);
}

export function getAuditLogs(params = {}) {
  return api.get('/admin/audit-logs', { params });
}
