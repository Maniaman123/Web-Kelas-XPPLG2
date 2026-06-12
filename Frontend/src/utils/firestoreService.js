// src/utils/firestoreService.js
// ─────────────────────────────────────────────────────────────────────────────
// Lapisan Data Firestore — X PPLG 2
//
// Modul ini menggantikan storage.js (LocalStorage) sebagai sumber data utama.
// Semua operasi CRUD pada koleksi Firestore dienkapsulasi di sini agar
// komponen React tetap bersih dan tidak perlu tahu detail Firestore SDK.
//
// Pola keamanan yang dipertahankan dari versi LocalStorage:
//   - Siswa hanya bisa update dokumen miliknya sendiri (dicek via userId)
//   - Admin bisa melakukan semua operasi (dicek via Firestore Security Rules)
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

import { db } from './firebase';

// ── Nama Koleksi ────────────────────────────────────────────────────────────
const COL = {
  USERS:          'users',
  STUDENTS:       'students',
  PROJECTS:       'projects',
  ACHIEVEMENTS:   'achievements',
  CINEMATOGRAPHY: 'cinematography',
  PENDING:        'pendingItems',
  SCHEDULE:       'schedule',
};


// ═══════════════════════════════════════════════════════════════════════════════
// USERS COLLECTION
// Menyimpan metadata pengguna: role, name, linkedStudentId
// Document ID = Firebase Auth UID
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ambil satu dokumen user berdasarkan Firebase UID.
 * Dipanggil oleh AuthProvider setelah onAuthStateChanged.
 * @param {string} uid
 * @returns {Promise<Object|null>} Data user atau null jika tidak ditemukan
 */
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, COL.USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Buat dokumen user baru di Firestore.
 * Dipanggil oleh Admin saat membuat akun siswa baru.
 * @param {string} uid  - Firebase Auth UID
 * @param {Object} data - { role, name, studentId? }
 */
export async function createUserDoc(uid, data) {
  await setDoc(doc(db, COL.USERS, uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Hapus dokumen user dari Firestore.
 * @param {string} uid
 */
export async function deleteUserDoc(uid) {
  await deleteDoc(doc(db, COL.USERS, uid));
}

/**
 * Perbarui email dan/atau password Firebase Auth milik pengguna yang sedang login.
 *
 * Firebase Auth mengharuskan re-autentikasi sebelum operasi sensitif ini dapat
 * dilakukan. Jika sesi sudah terlalu lama, Firebase akan melempar
 * `auth/requires-recent-login` — fungsi ini menanganinya dengan membuat kredensial
 * baru dari currentPassword yang dimasukkan pengguna.
 *
 * Alur:
 *   1. Ambil currentUser dari Firebase Auth instance utama.
 *   2. Buat AuthCredential menggunakan email + currentPassword saat ini.
 *   3. Panggil reauthenticateWithCredential() → verifikasi sesi.
 *   4a. Jika newEmail berbeda, panggil updateEmail() + sinkronisasi Firestore.
 *   4b. Jika newPassword tidak kosong, panggil updatePassword().
 *
 * @param {import('firebase/auth').Auth} auth    - Instance Firebase Auth utama
 * @param {string} currentPassword               - Password lama pengguna (untuk re-auth)
 * @param {string} newEmail                      - Email baru (kosong = tidak diubah)
 * @param {string} newPassword                   - Password baru (kosong = tidak diubah)
 * @returns {Promise<{ emailChanged: boolean, passwordChanged: boolean }>}
 * @throws FirebaseError dengan code auth/wrong-password, auth/requires-recent-login, dll.
 */
export async function updateUserCredentials(auth, currentPassword, newEmail, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Tidak ada pengguna yang sedang login.');

  // Langkah 3: Re-autentikasi dengan password saat ini
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  let emailChanged    = false;
  let passwordChanged = false;

  // Langkah 4a: Update email jika berbeda dari yang sekarang
  const trimmedEmail = newEmail?.trim();
  if (trimmedEmail && trimmedEmail !== user.email) {
    await updateEmail(user, trimmedEmail);

    // Sinkronisasi email ke dokumen Firestore users/{uid}
    await updateDoc(doc(db, COL.USERS, user.uid), { email: trimmedEmail });

    emailChanged = true;
  }

  // Langkah 4b: Update password jika ada input baru
  if (newPassword && newPassword.length >= 6) {
    await updatePassword(user, newPassword);
    passwordChanged = true;
  }

  return { emailChanged, passwordChanged };
}


// ═══════════════════════════════════════════════════════════════════════════════
// STUDENTS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * [REAL-TIME] Subscribe ke koleksi students, diurutkan berdasarkan nomor absen.
 * Digunakan di halaman Students.jsx untuk auto-update grid tanpa reload.
 *
 * @param {Function} callback - Dipanggil dengan array students setiap ada perubahan
 * @returns {Function} Fungsi unsubscribe — panggil saat komponen unmount
 */
export function subscribeToStudents(callback) {
  const q = query(
    collection(db, COL.STUDENTS),
    orderBy('absentNumber', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(students);
  });
}

/**
 * [SATU KALI] Ambil semua data students.
 * Alternatif ringan jika real-time tidak diperlukan.
 * @returns {Promise<Object[]>}
 */
export async function getStudents() {
  const q = query(collection(db, COL.STUDENTS), orderBy('absentNumber', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Ambil satu profil siswa berdasarkan Firebase UID pemiliknya.
 * Digunakan di StudentProfileEdit dan AdminDashboard.
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getStudentByUserId(uid) {
  // Tidak bisa query langsung tanpa index — kita ambil semua lalu filter
  // Untuk skala 46 siswa ini sangat efisien
  const students = await getStudents();
  return students.find(s => s.userId === uid) || null;
}

/**
 * Tambah profil siswa baru ke Firestore.
 * Dipanggil oleh Admin Dashboard.
 * @param {Object} studentData
 * @returns {Promise<string>} ID dokumen yang baru dibuat
 */
export async function addStudent(studentData) {
  const ref = await addDoc(collection(db, COL.STUDENTS), {
    ...studentData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update profil siswa — boleh dipanggil oleh siswa (self-edit) atau admin.
 * Keamanan tambahan dijaga di Firestore Security Rules (isStudentOwner).
 *
 * @param {string} studentId - ID dokumen Firestore
 * @param {Object} data      - Field yang diperbarui (partial update)
 */
export async function updateStudentProfile(studentId, data) {
  await updateDoc(doc(db, COL.STUDENTS, studentId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Hapus profil siswa dari Firestore.
 * Hanya Admin yang diperbolehkan (dijaga di Security Rules).
 * @param {string} studentId
 */
export async function deleteStudent(studentId) {
  await deleteDoc(doc(db, COL.STUDENTS, studentId));
}


// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Ambil semua proyek (satu kali fetch). */
export async function getProjects() {
  const snap = await getDocs(collection(db, COL.PROJECTS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * [REAL-TIME] Subscribe ke koleksi projects.
 * Digunakan di Projects.jsx dan StatsCard.jsx untuk pembaruan instan.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function subscribeToProjects(callback) {
  return onSnapshot(collection(db, COL.PROJECTS), (snapshot) => {
    const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(projects);
  });
}

/** Tambah proyek baru (hanya Admin). */
export async function addProject(data) {
  const ref = await addDoc(collection(db, COL.PROJECTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Hapus proyek (hanya Admin). */
export async function deleteProject(projectId) {
  await deleteDoc(doc(db, COL.PROJECTS, projectId));
}


// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Ambil semua prestasi. */
export async function getAchievements() {
  const snap = await getDocs(collection(db, COL.ACHIEVEMENTS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * [REAL-TIME] Subscribe ke koleksi achievements.
 * Digunakan di Achievements.jsx dan StatsCard.jsx untuk pembaruan instan.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function subscribeToAchievements(callback) {
  return onSnapshot(collection(db, COL.ACHIEVEMENTS), (snapshot) => {
    const achievements = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(achievements);
  });
}

/** Tambah prestasi baru (hanya Admin). */
export async function addAchievement(data) {
  const ref = await addDoc(collection(db, COL.ACHIEVEMENTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Hapus prestasi (hanya Admin). */
export async function deleteAchievement(achievementId) {
  await deleteDoc(doc(db, COL.ACHIEVEMENTS, achievementId));
}


// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATOGRAPHY COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Ambil semua item sinematografi. */
export async function getCinematography() {
  const snap = await getDocs(collection(db, COL.CINEMATOGRAPHY));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Tambah item sinematografi baru (hanya Admin). */
export async function addCinematography(data) {
  const ref = await addDoc(collection(db, COL.CINEMATOGRAPHY), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Hapus item sinematografi (hanya Admin). */
export async function deleteCinematography(id) {
  await deleteDoc(doc(db, COL.CINEMATOGRAPHY, id));
}


// ═══════════════════════════════════════════════════════════════════════════════
// PENDING ITEMS COLLECTION — Sistem Persetujuan Konten
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * [REAL-TIME] Subscribe ke antrian pending items.
 * Admin Dashboard menampilkan badge notifikasi dari sini.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function subscribeToPending(callback) {
  const q = query(
    collection(db, COL.PENDING),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

/**
 * [REAL-TIME] Subscribe ke pending items MILIK SISWA SENDIRI.
 * Hanya mengambil dokumen di mana studentId == uid — aman untuk halaman
 * non-admin karena Firestore rules mengizinkan self-read.
 *
 * @param {string}   uid      - Firebase Auth UID siswa yang sedang login
 * @param {string}   type     - 'project' | 'achievement' | 'cinematography'
 * @param {Function} callback - Dipanggil setiap ada perubahan data
 * @returns {Function} unsubscribe
 */
export function subscribeToMyPending(uid, type, callback) {
  if (!uid) {
    // Tidak login → langsung kembalikan data kosong, tidak buka listener
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COL.PENDING),
    where('studentId', '==', uid),
    where('type',      '==', type),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

/**
 * Submit konten untuk persetujuan admin.
 * Dipanggil oleh siswa dari halaman Projects, Achievements, atau Cinematography.
 *
 * @param {'cinematography'|'project'|'achievement'} type
 * @param {string} studentId
 * @param {string} studentName
 * @param {Object} data  - Payload konten
 * @returns {Promise<string>} ID pending item
 */
export async function submitPending(type, studentId, studentName, data) {
  const ref = await addDoc(collection(db, COL.PENDING), {
    type,
    studentId,
    studentName,
    data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Admin menyetujui pending item:
 * 1. Salin data ke koleksi tujuan (projects/achievements/cinematography)
 * 2. Hapus dari pendingItems
 * Menggunakan Firestore batch write untuk atomisitas.
 *
 * @param {Object} pendingItem - Dokumen pending lengkap (termasuk id)
 */
export async function approvePending(pendingItem) {
  const batch = writeBatch(db);

  // Tentukan koleksi tujuan
  const targetCol = {
    cinematography: COL.CINEMATOGRAPHY,
    project:        COL.PROJECTS,
    achievement:    COL.ACHIEVEMENTS,
  }[pendingItem.type];

  if (!targetCol) throw new Error(`Tipe tidak dikenal: ${pendingItem.type}`);

  // 1. Tambah ke koleksi tujuan
  const newRef = doc(collection(db, targetCol));
  batch.set(newRef, {
    ...pendingItem.data,
    approvedAt: serverTimestamp(),
    submittedBy: pendingItem.studentId,
  });

  // 2. Hapus dari pending
  batch.delete(doc(db, COL.PENDING, pendingItem.id));

  await batch.commit();
}

/**
 * Admin menolak pending item — hapus dari antrian.
 * @param {string} pendingId
 */
export async function rejectPending(pendingId) {
  await deleteDoc(doc(db, COL.PENDING, pendingId));
}


// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULE COLLECTION
// Koleksi `schedule` menyimpan jadwal pelajaran X PPLG 2.
// Setiap dokumen = satu hari (id: 'senin', 'selasa', ..., 'jumat').
// Struktur dokumen: { day: string, subjects: SubjectItem[] }
// SubjectItem: { jamKe: number, timeSlot: string, name: string, teacherCode: string }
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * [REAL-TIME] Subscribe ke seluruh koleksi schedule.
 * ScheduleCard.jsx menggunakan ini untuk auto-update tanpa reload.
 *
 * @param {Function} callback - Dipanggil dengan array { id, day, subjects }[]
 * @returns {Function} Fungsi unsubscribe — panggil saat komponen unmount
 */
export function subscribeToSchedule(callback) {
  return onSnapshot(collection(db, COL.SCHEDULE), (snapshot) => {
    const days = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Urutkan: senin → selasa → rabu → kamis → jumat
    const ORDER = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
    days.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
    callback(days);
  });
}

/**
 * Update subjects untuk satu hari tertentu.
 * Hanya Admin yang boleh memanggil ini (dijaga via Firestore Security Rules).
 *
 * @param {string}   dayId           - ID dokumen, misal 'senin'
 * @param {Object[]} updatedSubjects  - Array SubjectItem baru
 */
export async function updateSchedule(dayId, updatedSubjects) {
  await setDoc(
    doc(db, COL.SCHEDULE, dayId),
    { subjects: updatedSubjects, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Seed awal — tulis semua 5 hari sekaligus menggunakan batch write.
 * Dipanggil SEKALI dari Admin Dashboard saat koleksi schedule masih kosong.
 * Aman untuk dipanggil ulang (setDoc dengan merge: false → overwrite).
 *
 * @param {Object[]} scheduleArray - Array of { id, day, subjects }
 */
export async function seedSchedule(scheduleArray) {
  const batch = writeBatch(db);
  scheduleArray.forEach(({ id, day, subjects }) => {
    batch.set(doc(db, COL.SCHEDULE, id), {
      day,
      subjects,
      seededAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
