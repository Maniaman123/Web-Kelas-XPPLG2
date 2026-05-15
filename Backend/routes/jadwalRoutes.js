import { Router } from 'express';
import { getJadwal, createJadwal, updateJadwal, deleteJadwal } from '../controllers/jadwalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, guruOrAdmin } from '../middleware/adminMiddleware.js';

const router = Router();
router.use(protect);

// GET    /api/jadwal       → list jadwal (filter: ?kelas_id= &hari= &guru_id= &semester=)
router.get('/',            getJadwal);
// POST   /api/jadwal       → buat jadwal (admin)
router.post('/',           adminOnly, createJadwal);
// PUT    /api/jadwal/:id   → update jadwal (admin)
router.put('/:id',         adminOnly, updateJadwal);
// DELETE /api/jadwal/:id   → hapus jadwal (admin)
router.delete('/:id',      adminOnly, deleteJadwal);

export default router;
