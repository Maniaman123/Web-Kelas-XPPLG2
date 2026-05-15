import api from './api';

/**
 * authService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Semua fungsi yang berhubungan dengan autentikasi.
 * Token & data user disimpan di localStorage setelah login berhasil.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const authService = {
  /** Daftar akun baru */
  register: async ({ email, password, nama, role }) => {
    const { data } = await api.post('/auth/register', { email, password, nama, role });
    return data;
  },

  /** Login & simpan token */
  login: async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  /** Logout & bersihkan storage */
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  /** Ambil profil user yang sedang login */
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  /** Ambil user dari localStorage (tanpa fetch) */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /** Cek apakah user sudah login */
  isLoggedIn: () => Boolean(localStorage.getItem('access_token')),
};

export default authService;
