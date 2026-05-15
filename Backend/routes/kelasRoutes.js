import { Router } from 'express';
import {
  getAllKelas,
  getKelasById,
  createKelas,
  updateKelas,
  deleteKelas,
} from '../controllers/kelasController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = Router();

// Semua route kelas butuh login
router.use(protect);

// GET    /api/kelas          → daftar semua kelas
router.get('/',    getAllKelas);

// GET    /api/kelas/:id      → detail kelas + siswa
router.get('/:id', getKelasById);

// POST   /api/kelas          → buat kelas baru (admin only)
router.post('/',   adminOnly, createKelas);

// PUT    /api/kelas/:id      → update kelas (admin only)
router.put('/:id', adminOnly, updateKelas);

// DELETE /api/kelas/:id      → hapus kelas (admin only)
router.delete('/:id', adminOnly, deleteKelas);

export default router;
