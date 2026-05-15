import { createClient } from '@supabase/supabase-js';
import supabase from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Client dengan Anon Key → untuk operasi Auth (signUp, signIn)
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { email, password, nama, role = 'guru' } = req.body;

    if (!email || !password || !nama) {
      return res.status(400).json({ error: 'Email, password, dan nama wajib diisi.' });
    }

    if (!['admin', 'guru'].includes(role)) {
      return res.status(400).json({ error: 'Role hanya boleh: admin atau guru.' });
    }

    // 1. Daftarkan ke Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 2. Simpan profil ke tabel `profiles`
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id:    authData.user.id,
        nama,
        email,
        role,
      });

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }
    }

    res.status(201).json({
      message: 'Registrasi berhasil! Cek email untuk verifikasi akun.',
      user:    { id: authData.user?.id, email, nama, role },
    });
  } catch (err) {
    console.error('[AUTH] register:', err.message);
    res.status(500).json({ error: 'Gagal mendaftarkan pengguna.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Ambil profil dari tabel profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message:       'Login berhasil.',
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
      user:          { ...data.user, profile },
    });
  } catch (err) {
    console.error('[AUTH] login:', err.message);
    res.status(500).json({ error: 'Gagal melakukan login.' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    // Supabase invalidasi token di sisi server
    await supabaseAuth.auth.signOut();
    res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    console.error('[AUTH] logout:', err.message);
    res.status(500).json({ error: 'Gagal melakukan logout.' });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      user:    req.user,
      profile,
    });
  } catch (err) {
    console.error('[AUTH] getMe:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
  }
};
