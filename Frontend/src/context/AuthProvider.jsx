// src/context/AuthProvider.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Firebase Authentication Provider — X PPLG 2
//
// Menggantikan implementasi mock berbasis LocalStorage dengan Firebase Auth.
//
// Alur Autentikasi:
//   1. onAuthStateChanged() dipanggil saat komponen mount — sesi dipersisten
//      secara otomatis oleh Firebase SDK (tidak perlu localStorage manual).
//   2. Setelah Firebase Auth mengembalikan firebaseUser, kita fetch dokumen
//      dari koleksi Firestore `users/{uid}` untuk mendapatkan role & studentId.
//   3. Context shape identik dengan versi lama sehingga TIDAK ADA komponen
//      consumer (Navbar, AdminDashboard, StudentModal, dll.) yang perlu diubah.
//
// Context Value yang diekspor:
//   { user, isAuthenticated, role, loading, login, logout, showLogin, setShowLogin }
//
// user object shape (setelah login berhasil):
//   {
//     id:        string,  ← Firebase UID (digunakan untuk pencocokan userId)
//     uid:       string,  ← sama dengan id (alias eksplisit)
//     email:     string,
//     name:      string,
//     role:      'admin' | 'student',
//     studentId: string | undefined,  ← ID dokumen students/ jika role=student
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { auth }       from '../utils/firebase';
import { getUserDoc } from '../utils/firestoreService';
import AuthContext    from './AuthContext';

// ── Peta kode error Firebase → pesan Bahasa Indonesia ───────────────────────
const FIREBASE_ERROR_MESSAGES = {
  'auth/user-not-found':      'Akun dengan email ini tidak ditemukan.',
  'auth/wrong-password':      'Password yang kamu masukkan salah.',
  'auth/invalid-credential':  'Email atau password tidak valid.',
  'auth/invalid-email':       'Format email tidak valid.',
  'auth/user-disabled':       'Akun ini telah dinonaktifkan oleh admin.',
  'auth/too-many-requests':   'Terlalu banyak percobaan login. Coba lagi nanti.',
  'auth/network-request-failed': 'Gagal terhubung ke jaringan. Periksa koneksi internetmu.',
};

function friendlyError(code) {
  return FIREBASE_ERROR_MESSAGES[code] || 'Terjadi kesalahan. Silakan coba lagi.';
}

// ── Provider Component ───────────────────────────────────────────────────────
export default function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);   // true saat cek sesi awal
  const [showLogin, setShowLogin] = useState(false);

  // ── Listener sesi Firebase ─────────────────────────────────────────────────
  // onAuthStateChanged dipanggil:
  //   • Saat komponen mount → memeriksa sesi yang tersimpan
  //   • Saat login berhasil → firebaseUser terisi
  //   • Saat logout → firebaseUser = null
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Pengguna terautentikasi — ambil data role dari Firestore
        try {
          const userDoc = await getUserDoc(firebaseUser.uid);

          setUser({
            id:        firebaseUser.uid,   // ← kunci: dipakai canEdit check
            uid:       firebaseUser.uid,
            email:     firebaseUser.email,
            name:      userDoc?.name      || firebaseUser.displayName || firebaseUser.email,
            role:      userDoc?.role      || 'student',
            studentId: userDoc?.studentId || null,
          });
        } catch (err) {
          // Jika Firestore tidak bisa dibaca (offline/rules), fallback minimal
          console.error('[AuthProvider] Gagal fetch user doc:', err);
          setUser({
            id:    firebaseUser.uid,
            uid:   firebaseUser.uid,
            email: firebaseUser.email,
            name:  firebaseUser.email,
            role:  'student',
          });
        }
      } else {
        // Tidak ada sesi aktif
        setUser(null);
      }

      setLoading(false);  // ← selesai memeriksa sesi, UI boleh render
    });

    // Cleanup: batalkan listener saat AuthProvider unmount
    return unsubscribe;
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  // Menggantikan mock login yang mencari user di LocalStorage.
  // Mengembalikan { success: true } atau { success: false, error: string }
  // agar LoginModal.jsx tidak perlu diubah strukturnya.
  const login = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: friendlyError(err.code),
      };
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('[AuthProvider] Logout gagal:', err);
    }
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const isAuthenticated = !!user && !loading;
  const role            = user?.role || 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        loading,         // ← baru: konsumen bisa tampilkan loading state
        login,
        logout,
        showLogin,
        setShowLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
