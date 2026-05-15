import api from './api';

/**
 * absensiService.js — Manajemen Absensi
 */
const absensiService = {
  /**
   * Ambil data absensi.
   * Params: { kelas_id, siswa_id, tanggal, bulan, tahun }
   */
  getAll: (params = {}) => api.get('/absensi', { params }).then((r) => r.data),

  /**
   * Rekap kehadiran per siswa.
   * Params: { siswa_id, bulan, tahun }
   */
  getRekap: (params = {}) => api.get('/absensi/rekap', { params }).then((r) => r.data),

  /**
   * Catat absensi satu kelas satu hari.
   * Payload: {
   *   kelas_id, tanggal,
   *   absensi: [{ siswa_id, status, keterangan }]
   * }
   */
  catat: (payload) => api.post('/absensi', payload).then((r) => r.data),

  /**
   * Koreksi satu entri absensi.
   * Payload: { status, keterangan }
   */
  update: (id, payload) => api.put(`/absensi/${id}`, payload).then((r) => r.data),
};

export default absensiService;
