import api from './api';

/**
 * jadwalService.js — Manajemen Jadwal
 */
const jadwalService = {
  /**
   * Ambil jadwal.
   * Params: { kelas_id, hari, guru_id, semester, tahun_ajaran }
   * Response juga berisi `grouped` (dikelompokkan per hari).
   */
  getAll:  (params = {}) => api.get('/jadwal', { params }).then((r) => r.data),

  /**
   * Buat jadwal baru.
   * Payload: { kelas_id, guru_id, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, semester, tahun_ajaran }
   */
  create:  (payload)     => api.post('/jadwal', payload).then((r) => r.data),

  /**
   * Update jadwal.
   * Payload: { guru_id, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan }
   */
  update:  (id, payload) => api.put(`/jadwal/${id}`, payload).then((r) => r.data),

  /** Hapus jadwal */
  delete:  (id)          => api.delete(`/jadwal/${id}`).then((r) => r.data),
};

export default jadwalService;
