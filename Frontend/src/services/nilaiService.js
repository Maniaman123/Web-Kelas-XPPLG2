import api from './api';

/**
 * nilaiService.js — Manajemen Nilai
 */
const nilaiService = {
  /**
   * Ambil data nilai.
   * Params: { siswa_id, kelas_id, mata_pelajaran, semester, tahun_ajaran }
   */
  getAll: (params = {}) => api.get('/nilai', { params }).then((r) => r.data),

  /**
   * Rapor / rata-rata nilai per siswa.
   * Params: { siswa_id, semester, tahun_ajaran }
   */
  getRapor: (params = {}) => api.get('/nilai/rapor', { params }).then((r) => r.data),

  /**
   * Input nilai bulk satu kelas.
   * Payload: {
   *   kelas_id, mata_pelajaran, jenis_ujian, semester, tahun_ajaran,
   *   nilai_list: [{ siswa_id, nilai, keterangan }]
   * }
   */
  input: (payload) => api.post('/nilai', payload).then((r) => r.data),

  /**
   * Koreksi satu nilai.
   * Payload: { nilai, keterangan }
   */
  update: (id, payload) => api.put(`/nilai/${id}`, payload).then((r) => r.data),
};

export default nilaiService;
