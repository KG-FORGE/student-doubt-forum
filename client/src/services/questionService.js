import api from './api.js';

export function getQuestions(params = {}) {
  return api.get('/questions', { params });
}

export function getQuestionById(id) {
  return api.get(`/questions/${id}`);
}

export function createQuestion(data) {
  return api.post('/questions', data);
}

export function updateQuestion(id, data) {
  return api.put(`/questions/${id}`, data);
}

export function deleteQuestion(id) {
  return api.delete(`/questions/${id}`);
}

export function toggleQuestionStatus(id) {
  return api.patch(`/questions/${id}/status`);
}
