import api from './api';

/**
 * kelasService.js — CRUD Kelas
 */
const kelasService = {
  getAll:  (params = {}) => api.get('/kelas', { params }).then((r) => r.data),
  getById: (id)           => api.get(`/kelas/${id}`).then((r) => r.data),
  create:  (payload)      => api.post('/kelas', payload).then((r) => r.data),
  update:  (id, payload)  => api.put(`/kelas/${id}`, payload).then((r) => r.data),
  delete:  (id)           => api.delete(`/kelas/${id}`).then((r) => r.data),
};

export default kelasService;
