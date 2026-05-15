import { Router } from 'express';
import { getNilai, inputNilai, updateNilai, getRaporSiswa } from '../controllers/nilaiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { guruOrAdmin } from '../middleware/adminMiddleware.js';

const router = Router();
router.use(protect);

// GET  /api/nilai          → list nilai (filter: ?siswa_id= &kelas_id= &mata_pelajaran= &semester=)
router.get('/',            getNilai);
// GET  /api/nilai/rapor   → rapor siswa (?siswa_id= &semester= &tahun_ajaran=)
router.get('/rapor',       getRaporSiswa);
// POST /api/nilai          → input nilai bulk
router.post('/',           guruOrAdmin, inputNilai);
// PUT  /api/nilai/:id      → koreksi nilai
router.put('/:id',         guruOrAdmin, updateNilai);

export default router;
