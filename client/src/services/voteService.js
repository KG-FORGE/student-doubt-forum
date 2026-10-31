import api from './api.js';

export function castVote(targetType, targetId, value) {
  return api.post('/votes', { targetType, targetId, value });
}

export function getUserVotes(targetIds) {
  const params = targetIds ? { targetIds: targetIds.join(',') } : {};
  return api.get('/votes/user', { params });
}
