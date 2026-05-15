import { Router } from 'express';
import {
  getAllSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa, pindahKelas,
} from '../controllers/siswaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, guruOrAdmin } from '../middleware/adminMiddleware.js';

const router = Router();
router.use(protect);

// GET    /api/siswa             → daftar siswa (filter: ?kelas_id= &search=)
router.get('/',                getAllSiswa);
// GET    /api/siswa/:id         → detail siswa + riwayat absensi & nilai
router.get('/:id',             getSiswaById);
// POST   /api/siswa             → tambah siswa
router.post('/',               guruOrAdmin, createSiswa);
// PUT    /api/siswa/:id         → update data siswa
router.put('/:id',             guruOrAdmin, updateSiswa);
// PATCH  /api/siswa/:id/pindah  → pindah kelas
router.patch('/:id/pindah',    guruOrAdmin, pindahKelas);
// DELETE /api/siswa/:id         → hapus siswa (admin only)
router.delete('/:id',          adminOnly, deleteSiswa);

export default router;
