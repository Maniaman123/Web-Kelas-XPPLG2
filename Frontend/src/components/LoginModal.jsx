// src/components/LoginModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal Login — Diperbarui untuk Firebase Authentication
//
// Perubahan dari versi sebelumnya:
//   • login() sekarang async (Firebase Auth adalah operasi jaringan)
//   • Error ditangani langsung dari AuthProvider (sudah diterjemahkan ke BI)
//   • Tidak ada lagi "simulate network delay" — Firebase menanganinya sendiri
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';
import useAuth from '../context/useAuth';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // login() kini async dan mengembalikan { success, error }
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    // Jika sukses, AuthProvider sudah menutup modal via setShowLogin(false)

    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-inverted/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header gradient */}
            <div className="h-2 bg-linear-to-r from-primary via-accent to-primary" />

            <div className="p-6 sm:p-8">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-outlined hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-inverted mb-1">Masuk ke Akun</h2>
              <p className="text-outlined text-sm mb-6">
                Login untuk mengelola profil dan data kelas
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-inverted mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outlined" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-inverted mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outlined" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-light transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Memproses...
                    </span>
                  ) : 'Masuk'}
                </button>
              </form>

              {/* Info credentials */}
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-secondary-dark/30">
                <p className="text-xs font-semibold text-primary mb-2">🔑 Info Login</p>
                <div className="space-y-1 text-xs text-outlined">
                  <p><span className="font-medium">Admin:</span> Gunakan email & password dari Firebase Console</p>
                  <p><span className="font-medium">Siswa:</span> Email format <code className="bg-black/5 px-1 rounded">noabsen@xpplg2.sch.id</code></p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
