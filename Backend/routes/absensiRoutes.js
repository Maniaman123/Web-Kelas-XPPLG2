import { Router } from 'express';
import {
  getAbsensi, catatAbsensi, updateAbsensi, getRekapAbsensi,
} from '../controllers/absensiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { guruOrAdmin } from '../middleware/adminMiddleware.js';

const router = Router();
router.use(protect);

// GET   /api/absensi         → list absensi (filter: ?kelas_id= &tanggal= &bulan= &tahun=)
router.get('/',              getAbsensi);
// GET   /api/absensi/rekap  → rekap kehadiran siswa (?siswa_id= &bulan= &tahun=)
router.get('/rekap',         getRekapAbsensi);
// POST  /api/absensi        → catat absensi bulk satu kelas
router.post('/',             guruOrAdmin, catatAbsensi);
// PUT   /api/absensi/:id    → koreksi satu data absensi
router.put('/:id',           guruOrAdmin, updateAbsensi);

export default router;
