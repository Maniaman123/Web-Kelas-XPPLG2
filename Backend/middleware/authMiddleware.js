import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Gunakan Anon Key untuk memverifikasi token dari sisi user.
 * (Berbeda dengan Service Role Key di config/database.js)
 */
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Middleware: protect
 * ───────────────────
 * Memastikan request memiliki Bearer Token yang valid dari Supabase Auth.
 * Jika valid → menyimpan data user ke `req.user` dan lanjut ke handler.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Akses ditolak. Token tidak ditemukan, silakan login terlebih dahulu.',
      });
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.',
      });
    }

    req.user  = user;   // { id, email, ... }
    req.token = token;
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE]', err.message);
    res.status(500).json({ error: 'Gagal memverifikasi autentikasi.' });
  }
};
