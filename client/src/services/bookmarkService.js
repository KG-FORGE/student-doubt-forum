import api from './api.js';

export function getBookmarks(params = {}) {
  return api.get('/bookmarks', { params });
}

export function addBookmark(questionId) {
  return api.post('/bookmarks', { questionId });
}

export function removeBookmark(questionId) {
  return api.delete(`/bookmarks/${questionId}`);
}

export function getBookmarkedIds() {
  return api.get('/bookmarks/ids');
}
