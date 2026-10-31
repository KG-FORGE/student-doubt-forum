import api from './api.js';

export function getNotifications(params = {}) {
  return api.get('/notifications', { params });
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count');
}

export function markAsRead(id) {
  return api.put(`/notifications/${id}/read`);
}

export function markAllAsRead() {
  return api.put('/notifications/read-all');
}
