// src/utils/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase App Initialization — X PPLG 2
//
// Semua konfigurasi dimuat secara aman dari variabel lingkungan (.env)
// menggunakan import.meta.env (Vite). Tidak ada nilai sensitif yang
// ditulis langsung di source code ini.
//
// Ekspor:
//   app           → Firebase App instance (utama)
//   auth          → Firebase Auth instance (utama, untuk sesi pengguna aktif)
//   db            → Cloud Firestore instance
//   secondaryApp  → Firebase App instance sekunder (KHUSUS admin buat akun siswa)
//   secondaryAuth → Firebase Auth instance sekunder (terisolasi dari sesi utama)
//
// Teknik Secondary App:
//   Saat Admin membuat akun siswa dengan createUserWithEmailAndPassword(),
//   Firebase Auth secara default mem-switch sesi aktif ke akun yang baru dibuat.
//   Dengan menggunakan secondaryAuth (dari instance app terpisah bernama 'SecondaryApp'),
//   pembuatan akun siswa terjadi di instance yang TERISOLASI sehingga sesi Admin
//   di `auth` (instance utama) tidak pernah terganggu.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp }  from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';
import { getStorage }     from 'firebase/storage';

// ── Firebase Project Config ─────────────────────────────────────────────────
// Isi nilai-nilai ini di file .env di root folder Frontend/
// Format: VITE_FIREBASE_XXXX=nilai_dari_firebase_console
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── 1. Main Application ─────────────────────────────────────────────────────
// Digunakan untuk tracking sesi pengguna aktif (admin/student login).
// onAuthStateChanged di AuthProvider.jsx hanya listen ke instance ini.
export const app     = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// ── 2. Secondary Application ────────────────────────────────────────────────
// KHUSUS untuk Admin membuat akun siswa baru tanpa mengganggu sesi utama.
// Firebase SDK memungkinkan several App instance selama diberi nama berbeda.
// Instance ini TIDAK memiliki listener onAuthStateChanged sehingga aman digunakan
// untuk createUserWithEmailAndPassword() tanpa mempengaruhi sesi Admin.
export const secondaryApp  = initializeApp(firebaseConfig, 'SecondaryApp');
export const secondaryAuth = getAuth(secondaryApp);

export default app;
