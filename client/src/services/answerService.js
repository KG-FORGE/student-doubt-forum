import api from './api.js';

export function getAnswersForQuestion(questionId) {
  return api.get(`/questions/${questionId}/answers`);
}

export function createAnswer(questionId, content) {
  return api.post(`/questions/${questionId}/answers`, { content });
}

export function updateAnswer(id, content) {
  return api.put(`/answers/${id}`, { content });
}

export function deleteAnswer(id) {
  return api.delete(`/answers/${id}`);
}

export function toggleVerifyAnswer(id) {
  return api.put(`/answers/${id}/verify`);
}
