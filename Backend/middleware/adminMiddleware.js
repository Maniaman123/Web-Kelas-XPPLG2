import supabase from '../config/database.js';

/**
 * Middleware: adminOnly
 * ─────────────────────
 * Digunakan SETELAH middleware `protect`.
 * Mengecek apakah user yang login memiliki role 'admin' di tabel profiles.
 *
 * Contoh pemakaian di route:
 *   router.delete('/:id', protect, adminOnly, deleteKelas);
 */
export const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Tidak terautentikasi.' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Profil pengguna tidak ditemukan.' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({
        error: 'Akses ditolak. Halaman ini hanya untuk admin.',
      });
    }

    req.userRole = profile.role;
    next();
  } catch (err) {
    console.error('[ADMIN MIDDLEWARE]', err.message);
    res.status(500).json({ error: 'Gagal memverifikasi hak akses.' });
  }
};

/**
 * Middleware: guruOrAdmin
 * ─────────────────────────
 * Mengizinkan akses untuk role 'guru' dan 'admin'.
 */
export const guruOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Tidak terautentikasi.' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Profil pengguna tidak ditemukan.' });
    }

    if (!['admin', 'guru'].includes(profile.role)) {
      return res.status(403).json({
        error: 'Akses ditolak. Hanya guru dan admin yang diizinkan.',
      });
    }

    req.userRole = profile.role;
    next();
  } catch (err) {
    console.error('[GURU_OR_ADMIN MIDDLEWARE]', err.message);
    res.status(500).json({ error: 'Gagal memverifikasi hak akses.' });
  }
};
