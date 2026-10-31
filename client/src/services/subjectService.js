import api from './api.js';

export function getSubjects() {
  return api.get('/subjects');
}
