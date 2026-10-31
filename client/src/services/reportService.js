import api from './api.js';

export function createReport(data) {
  return api.post('/reports', data);
}
