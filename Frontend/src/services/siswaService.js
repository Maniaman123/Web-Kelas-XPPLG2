import api from './api';

/**
 * siswaService.js — CRUD Siswa
 */
const siswaService = {
  /** Ambil semua siswa. Params: { kelas_id, search } */
  getAll:     (params = {}) => api.get('/siswa', { params }).then((r) => r.data),

  /** Detail siswa + absensi & nilai */
  getById:    (id)          => api.get(`/siswa/${id}`).then((r) => r.data),

  /** Tambah siswa baru */
  create:     (payload)     => api.post('/siswa', payload).then((r) => r.data),

  /** Update data siswa */
  update:     (id, payload) => api.put(`/siswa/${id}`, payload).then((r) => r.data),

  /** Pindah kelas → payload: { kelas_id_baru } */
  pindahKelas: (id, kelas_id_baru) =>
    api.patch(`/siswa/${id}/pindah`, { kelas_id_baru }).then((r) => r.data),

  /** Hapus siswa */
  delete:     (id)          => api.delete(`/siswa/${id}`).then((r) => r.data),
};

export default siswaService;
