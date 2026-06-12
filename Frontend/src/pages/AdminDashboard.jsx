// src/pages/AdminDashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Admin — Firebase Auth + Firestore (Secondary App Pattern)
//
// Teknik Secondary App:
//   Pembuatan akun siswa menggunakan `secondaryAuth` (instance Firebase terisolasi).
//   Ini memastikan sesi Admin di `auth` (instance utama) TIDAK PERNAH terganggu
//   saat Admin membuat 46 akun siswa secara berurutan.
//
// Konvensi Email Siswa:
//   Format: {noabsen}@xpplg2.sch.id (misal: 01@xpplg2.sch.id)
//
// Developer Credit: Reyhan Septianto Ramadhan
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }          from 'framer-motion';
import { useNavigate }                      from 'react-router-dom';
import { createUserWithEmailAndPassword }   from 'firebase/auth';
import { doc, updateDoc }                   from 'firebase/firestore';
import { secondaryAuth, db }                from '../utils/firebase';
import useAuth                              from '../context/useAuth';
import {
  subscribeToStudents,
  subscribeToPending,
  subscribeToSchedule,
  addStudent,
  deleteStudent,
  createUserDoc,
  deleteUserDoc,
  approvePending,
  rejectPending,
  updateSchedule,
  seedSchedule,
} from '../utils/firestoreService';
import { roles, avatarColors, getInitials } from '../data/students';
import {
  UserPlus, Trash2, ShieldAlert, CheckCircle, XCircle,
  Clock, Camera, Rocket, Trophy, Loader2,
  CalendarDays, Pencil, Plus, X, Save, DatabaseZap,
} from 'lucide-react';

const TYPE_LABELS = {
  cinematography: { label: 'Sinematografi', icon: Camera, color: 'text-blue-600 bg-blue-50'   },
  project:        { label: 'Proyek',         icon: Rocket,  color: 'text-green-600 bg-green-50' },
  achievement:    { label: 'Prestasi',        icon: Trophy,  color: 'text-amber-600 bg-amber-50' },
};

// ── Seed Data: X PPLG 2 — Grouped slots + isEvent breaks ─────────────────
const SCHEDULE_SEED = [
  {
    id: 'senin', day: 'Senin',
    subjects: [
      { timeSlot: '07:30 - 09:30', name: 'PRO PPLG',          teacherName: '', isEvent: false },
      { timeSlot: '09:30 - 10:00', name: 'Istirahat',          teacherName: null, isEvent: true  },
      { timeSlot: '10:00 - 12:00', name: 'PRO PPLG',          teacherName: '', isEvent: false },
      { timeSlot: '12:00 - 13:00', name: 'Istirahat / ISOMA', teacherName: null, isEvent: true  },
      { timeSlot: '13:00 - 15:00', name: 'PRO PPLG',          teacherName: '', isEvent: false },
    ],
  },
  {
    id: 'selasa', day: 'Selasa',
    subjects: [
      { timeSlot: '07:30 - 08:10', name: 'PRO PPLG',          teacherName: '', isEvent: false },
      { timeSlot: '08:10 - 09:30', name: 'IPAS',              teacherName: '', isEvent: false },
      { timeSlot: '09:30 - 10:00', name: 'Istirahat',          teacherName: null, isEvent: true  },
      { timeSlot: '10:00 - 12:00', name: 'IPAS',              teacherName: '', isEvent: false },
      { timeSlot: '12:00 - 13:00', name: 'Istirahat / ISOMA', teacherName: null, isEvent: true  },
      { timeSlot: '13:00 - 15:00', name: 'B. INDO',           teacherName: '', isEvent: false },
    ],
  },
  {
    id: 'rabu', day: 'Rabu',
    subjects: [
      { timeSlot: '07:30 - 09:30', name: 'INFORMATIKA',       teacherName: '', isEvent: false },
      { timeSlot: '09:30 - 10:00', name: 'Istirahat',          teacherName: null, isEvent: true  },
      { timeSlot: '10:00 - 10:40', name: 'INFORMATIKA',       teacherName: '', isEvent: false },
      { timeSlot: '10:40 - 11:20', name: 'B. SUNDA',          teacherName: '', isEvent: false },
      { timeSlot: '11:20 - 12:00', name: 'ENGLISH',           teacherName: '', isEvent: false },
      { timeSlot: '12:00 - 13:00', name: 'Istirahat / ISOMA', teacherName: null, isEvent: true  },
      { timeSlot: '13:00 - 15:00', name: 'PJOK',              teacherName: '', isEvent: false },
    ],
  },
  {
    id: 'kamis', day: 'Kamis',
    subjects: [
      { timeSlot: '07:30 - 08:50', name: 'SEJARAH',           teacherName: '', isEvent: false },
      { timeSlot: '08:50 - 09:30', name: 'B. SUNDA',          teacherName: '', isEvent: false },
      { timeSlot: '09:30 - 10:00', name: 'Istirahat',          teacherName: null, isEvent: true  },
      { timeSlot: '10:00 - 11:20', name: 'SENBUD',            teacherName: '', isEvent: false },
      { timeSlot: '11:20 - 13:40', name: 'ENGLISH',           teacherName: '', isEvent: false },
      { timeSlot: '13:40 - 15:00', name: 'PPKN',              teacherName: '', isEvent: false },
    ],
  },
  {
    id: 'jumat', day: 'Jumat',
    subjects: [
      { timeSlot: '07:30 - 09:30', name: 'PAI',                teacherName: '', isEvent: false },
      { timeSlot: '09:30 - 09:45', name: 'Istirahat',          teacherName: null, isEvent: true  },
      { timeSlot: '09:45 - 11:45', name: 'MTK',               teacherName: '', isEvent: false },
      { timeSlot: '11:45 - 13:00', name: 'Sholat Jumat & Pulang', teacherName: null, isEvent: true  },
    ],
  },
];

const DAY_ORDER = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];

// Helper: format absent number jadi 2 digit (01, 02, ..., 46)
function padAbsen(n) {
  return String(n).padStart(2, '0');
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ── Data state (real-time dari Firestore) ──────────────────────────────────
  const [students,  setStudents]  = useState([]);
  const [pending,   setPending]   = useState([]);
  const [schedule,  setSchedule]  = useState([]);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'approval' | 'schedule'

  // ── Schedule modal state ───────────────────────────────────────────────────
  const [editModal,    setEditModal]    = useState(false);
  const [editingDay,   setEditingDay]   = useState(null);   // { id, day }
  const [editSubjects, setEditSubjects] = useState([]);     // local mutable copy
  const [saveLoading,  setSaveLoading]  = useState(false);
  const [seedLoading,  setSeedLoading]  = useState(false);
  const [seedDone,     setSeedDone]     = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name,         setName]         = useState('');
  const [absentNumber, setAbsentNumber] = useState('');
  const [gender,       setGender]       = useState('L');
  const [tempPassword, setTempPassword] = useState('student123');
  const [formLoading,  setFormLoading]  = useState(false);
  const [formError,    setFormError]    = useState('');
  const [formSuccess,  setFormSuccess]  = useState('');

  // Guard: redirect jika bukan admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') navigate('/');
  }, [isAuthenticated, user, navigate]);

  // ── Real-time listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    const unsubStudents = subscribeToStudents(setStudents);
    const unsubPending  = subscribeToPending(setPending);
    const unsubSchedule = subscribeToSchedule(setSchedule);

    return () => {
      unsubStudents();
      unsubPending();
      unsubSchedule();
    };
  }, [isAuthenticated, user?.role]);

  // ── Tambah Siswa Baru ──────────────────────────────────────────────────────
  // Alur:
  //   1. Buat Firebase Auth account dengan email konvensi xpplg2.sch.id
  //   2. Simpan dokumen user di Firestore users/{uid}
  //   3. Simpan dokumen profil di Firestore students/{newId}
  //   4. Sign kembali sebagai admin (createUserWithEmailAndPassword otomatis
  //      mem-switch sesi ke user baru, jadi kita perlu re-auth admin)
  const handleAddStudent = useCallback(async (e) => {
    e.preventDefault();
    if (!name || !absentNumber || !tempPassword) return;
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    const studentEmail = `${padAbsen(absentNumber)}@xpplg2.sch.id`;

    try {
      // 1. Buat Firebase Auth account untuk siswa menggunakan secondaryAuth.
      //    secondaryAuth adalah instance terisolasi — sesi Admin di auth utama aman.
      const credential = await createUserWithEmailAndPassword(secondaryAuth, studentEmail, tempPassword);
      const newUid = credential.user.uid;

      // 2. Buat dokumen user di Firestore
      await createUserDoc(newUid, {
        role:  'student',
        name,
        email: studentEmail,
      });

      // 3. Buat profil siswa di Firestore
      const newStudentId = await addStudent({
        userId:       newUid,
        name,
        absentNumber: parseInt(absentNumber),
        gender,
        initials:     getInitials(name),
        role:         roles[Math.floor(Math.random() * roles.length)],
        avatarColor:  avatarColors[Math.floor(Math.random() * avatarColors.length)],
        about: '', ig: '', github: '', portfolio: '',
      });

      // 4. Update dokumen user dengan studentId yang baru dibuat
      await updateDoc(doc(db, 'users', newUid), { studentId: newStudentId });

      setFormSuccess(`✓ Akun ${name} berhasil dibuat! Email: ${studentEmail}`);
      setName(''); setAbsentNumber('');
      // Sesi Admin tidak terganggu — lanjutkan membuat akun berikutnya.

    } catch (err) {
      console.error('[AdminDashboard] Gagal membuat akun:', err);
      const ERR_MAP = {
        'auth/email-already-in-use': `Email ${studentEmail} sudah terdaftar. Gunakan nomor absen yang berbeda.`,
        'auth/weak-password':        'Password terlalu lemah. Gunakan minimal 6 karakter.',
        'auth/invalid-email':        'Format email tidak valid.',
      };
      setFormError(ERR_MAP[err.code] || `Gagal: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  }, [name, absentNumber, gender, tempPassword]);

  // ── Hapus Siswa ────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (student) => {
    if (!window.confirm(`Yakin ingin menghapus profil ${student.name}?`)) return;

    try {
      await deleteStudent(student.id);
      await deleteUserDoc(student.userId);
      // Catatan: Menghapus Firebase Auth account memerlukan Admin SDK.
      // Akun Auth masih ada tapi tidak punya dokumen Firestore → tidak bisa login efektif.
    } catch (err) {
      console.error('[AdminDashboard] Gagal menghapus siswa:', err);
      alert('Gagal menghapus. Periksa koneksi dan coba lagi.');
    }
  }, []);

  // ── Approval ───────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async (item) => {
    try {
      await approvePending(item);
    } catch (err) {
      console.error('[AdminDashboard] Gagal approve:', err);
      alert('Gagal menyetujui konten. Coba lagi.');
    }
  }, []);

  const handleReject = useCallback(async (pendingId) => {
    if (!window.confirm('Tolak konten ini?')) return;
    try {
      await rejectPending(pendingId);
    } catch (err) {
      console.error('[AdminDashboard] Gagal reject:', err);
    }
  }, []);

  // ── Schedule handlers ─────────────────────────────────────────────────────
  const handleOpenEdit = useCallback((dayDoc) => {
    setEditingDay({ id: dayDoc.id, day: dayDoc.day });
    // Deep-clone subjects so edits don't mutate real-time state
    setEditSubjects(dayDoc.subjects.map(s => ({ ...s })));
    setEditModal(true);
  }, []);

  const handleSubjectChange = useCallback((idx, field, value) => {
    setEditSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }, []);

  const handleAddRow = useCallback(() => {
    setEditSubjects(prev => [
      ...prev,
      { timeSlot: '', name: '', teacherName: '', isEvent: false },
    ]);
  }, []);

  const handleRemoveRow = useCallback((idx) => {
    setEditSubjects(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSaveSchedule = useCallback(async () => {
    if (!editingDay) return;
    setSaveLoading(true);
    try {
      await updateSchedule(editingDay.id, editSubjects);
      setEditModal(false);
    } catch (err) {
      console.error('[AdminDashboard] Gagal simpan jadwal:', err);
      alert('Gagal menyimpan jadwal. Periksa koneksi dan coba lagi.');
    } finally {
      setSaveLoading(false);
    }
  }, [editingDay, editSubjects]);

  const handleSeed = useCallback(async () => {
    if (!window.confirm('Seed jadwal X PPLG 2 dari data gambar ke Firestore? (Akan overwrite data jadwal yang sudah ada)')) return;
    setSeedLoading(true);
    try {
      await seedSchedule(SCHEDULE_SEED);
      setSeedDone(true);
    } catch (err) {
      console.error('[AdminDashboard] Gagal seed jadwal:', err);
      alert('Gagal seed jadwal.');
    } finally {
      setSeedLoading(false);
    }
  }, []);

  // ── Guard render ──────────────────────────────────────────────────────────
  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-inverted">Admin Dashboard</h1>
        <span className="ml-auto text-xs text-outlined bg-black/5 px-3 py-1 rounded-full">
          Firebase Firestore • Real-time
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-black/10 pb-0 flex-wrap">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors -mb-px border-b-2 ${
            activeTab === 'students'
              ? 'text-primary border-primary bg-white'
              : 'text-outlined border-transparent hover:text-inverted'
          }`}
        >
          👤 Pelajar ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors -mb-px border-b-2 flex items-center gap-2 ${
            activeTab === 'approval'
              ? 'text-primary border-primary bg-white'
              : 'text-outlined border-transparent hover:text-inverted'
          }`}
        >
          <Clock className="w-4 h-4" />
          Persetujuan
          {pending.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors -mb-px border-b-2 flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'text-primary border-primary bg-white'
              : 'text-outlined border-transparent hover:text-inverted'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Jadwal
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: STUDENTS
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Add Student Form */}
          <div className="bg-secondary rounded-3xl p-6 h-fit border border-secondary-dark/30">
            <h2 className="text-xl font-bold text-inverted mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Tambah Pelajar Baru
            </h2>

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {formSuccess}
              </div>
            )}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Nama Lengkap</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
                <p className="text-[10px] text-outlined mt-1">
                  Email akun: <code className="bg-black/5 px-1 rounded">{absentNumber ? `${padAbsen(absentNumber)}@xpplg2.sch.id` : '??@xpplg2.sch.id'}</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-inverted mb-1">No Absen</label>
                  <input
                    type="number" min="1" max="99"
                    value={absentNumber} onChange={(e) => setAbsentNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-inverted mb-1">Gender</label>
                  <select
                    value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Password Sementara</label>
                <input
                  type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                  required minLength={6}
                />
                <p className="text-[10px] text-outlined mt-1">Min. 6 karakter (Firebase requirement)</p>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 mt-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {formLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Membuat Akun...</>
                ) : (
                  'Buat Akun & Profil'
                )}
              </button>
            </form>
          </div>

          {/* Student List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-black/5">
            <h2 className="text-xl font-bold text-inverted mb-6">
              Daftar Pelajar ({students.length})
              <span className="ml-2 text-xs font-normal text-outlined">• live</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-outlined">
                    <th className="pb-3 font-medium">Absen</th>
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Gender</th>
                    <th className="pb-3 font-medium">Email Akun</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {[...students].sort((a, b) => a.absentNumber - b.absentNumber).map(student => (
                    <tr key={student.id} className="border-b border-black/5 last:border-0">
                      <td className="py-3 text-primary font-bold">{student.absentNumber}</td>
                      <td className="py-3">
                        <p className="font-semibold text-inverted">{student.name}</p>
                        <p className="text-xs text-outlined font-mono">{student.userId?.slice(0, 8)}…</p>
                      </td>
                      <td className="py-3">{student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                      <td className="py-3 text-xs text-outlined font-mono">
                        {padAbsen(student.absentNumber)}@xpplg2.sch.id
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pelajar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-outlined">
                        Belum ada data pelajar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: APPROVAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'approval' && (
        <div>
          {pending.length === 0 ? (
            <div className="py-24 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Tidak ada konten yang menunggu persetujuan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(item => {
                const meta = TYPE_LABELS[item.type] || {};
                const Icon = meta.icon || Clock;
                return (
                  <div key={item.id} className="bg-white rounded-3xl border border-black/5 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
                    {/* Type badge + preview */}
                    <div className="flex flex-col items-center gap-2 shrink-0 w-20">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold ${meta.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </span>
                      {item.type === 'cinematography' && item.data.type === 'photo' && item.data.url && (
                        <img src={item.data.url} alt={item.data.title}
                          className="w-16 h-16 object-cover rounded-xl border border-black/5" />
                      )}
                      {(item.type === 'project' || item.type === 'achievement') && item.data.photos?.length > 0 && (
                        <img src={item.data.photos[0]} alt={item.data.title}
                          className="w-16 h-16 object-cover rounded-xl border border-black/5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-inverted truncate">{item.data.title}</p>
                        <span className="text-[10px] text-outlined shrink-0">
                          {item.createdAt?.toDate
                            ? item.createdAt.toDate().toLocaleDateString('id-ID')
                            : '—'}
                        </span>
                      </div>
                      <p className="text-xs text-primary font-medium mb-2">Oleh {item.studentName}</p>
                      {item.data.description && (
                        <p className="text-sm text-outlined line-clamp-2">{item.data.description}</p>
                      )}
                      {item.data.date && (
                        <p className="text-xs text-outlined mt-1">📅 {item.data.date}</p>
                      )}
                      {item.data.link && (
                        <a href={item.data.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-accent underline mt-1 block truncate">{item.data.link}</a>
                      )}
                      {item.type === 'cinematography' && item.data.type === 'video' && item.data.url && (
                        <a href={item.data.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-accent underline mt-1 block truncate">{item.data.url}</a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 justify-end shrink-0">
                      <button onClick={() => handleApprove(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Setujui
                      </button>
                      <button onClick={() => handleReject(item.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors border border-rose-200">
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: SCHEDULE MANAGEMENT
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'schedule' && (
        <div>
          {/* Header + Seed button */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-inverted">Manajemen Jadwal Pelajaran</h2>
              <p className="text-sm text-outlined mt-0.5">Klik hari untuk edit mata pelajaran secara langsung.</p>
            </div>
            <button
              onClick={handleSeed}
              disabled={seedLoading || seedDone}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {seedLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                : seedDone
                ? <><CheckCircle className="w-4 h-4" /> Seed Berhasil</>
                : <><DatabaseZap className="w-4 h-4" /> Seed Jadwal dari Gambar</>}
            </button>
          </div>

          {/* Day cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-black/10 rounded-3xl text-outlined">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Koleksi jadwal kosong.</p>
                <p className="text-xs mt-1">Klik <strong>Seed Jadwal dari Gambar</strong> untuk mengisi data awal.</p>
              </div>
            ) : (
              DAY_ORDER.filter(id => schedule.some(d => d.id === id)).map(dayId => {
                const dayDoc = schedule.find(d => d.id === dayId);
                if (!dayDoc) return null;
                return (
                  <motion.div
                    key={dayId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Day header */}
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ background: 'linear-gradient(135deg, #243B3C, #2d5253)' }}
                    >
                      <span className="text-white font-bold text-sm tracking-wide">{dayDoc.day}</span>
                      <button
                        onClick={() => handleOpenEdit(dayDoc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>

                    {/* Subject preview list */}
                    <div className="divide-y divide-black/5">
                      {dayDoc.subjects?.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2">
                          <span className="text-[10px] font-mono text-outlined w-16 shrink-0">{s.timeSlot?.split(' - ')[0]}</span>
                          <span className="text-xs font-medium text-inverted flex-1 truncate">{s.name}</span>
                          <span className="text-[10px] text-outlined bg-black/5 px-1.5 py-0.5 rounded">{s.teacherCode}</span>
                        </div>
                      ))}
                      {(dayDoc.subjects?.length ?? 0) > 5 && (
                        <div className="px-4 py-2 text-[11px] text-outlined">
                          +{dayDoc.subjects.length - 5} mata pelajaran lainnya
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* ── Edit Modal ── */}
          <AnimatePresence>
            {editModal && editingDay && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditModal(false)}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal panel */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                  className="fixed inset-x-4 top-8 bottom-8 z-50 max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                  {/* Modal header */}
                  <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #243B3C, #2d5253)' }}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-white/80" />
                      <h3 className="text-white font-bold">Edit Jadwal — {editingDay.day}</h3>
                    </div>
                    <button
                      onClick={() => setEditModal(false)}
                      className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable table */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-outlined text-xs border-b border-black/10">
                          <th className="pb-2 text-left w-36">Waktu</th>
                          <th className="pb-2 text-left">Nama / Event</th>
                          <th className="pb-2 text-left w-36">Nama Guru</th>
                          <th className="pb-2 text-center w-20">Tipe</th>
                          <th className="pb-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {editSubjects.map((s, idx) => (
                          <tr key={idx} className={s.isEvent ? 'bg-amber-50/60' : ''}>
                            {/* Waktu */}
                            <td className="py-2 pr-2">
                              <input
                                type="text" placeholder="07:30 - 09:30"
                                value={s.timeSlot ?? ''}
                                onChange={e => handleSubjectChange(idx, 'timeSlot', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs focus:border-primary outline-none font-mono"
                              />
                            </td>
                            {/* Nama / Event */}
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                placeholder={s.isEvent ? 'Nama event (Istirahat…)' : 'Nama Mata Pelajaran'}
                                value={s.name ?? ''}
                                onChange={e => handleSubjectChange(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs focus:border-primary outline-none"
                              />
                            </td>
                            {/* Nama Guru — disabled for events */}
                            <td className="py-2 pr-2">
                              {s.isEvent ? (
                                <span className="block px-2 py-1.5 rounded-lg bg-black/5 text-[10px] text-outlined italic">
                                  — event, no guru —
                                </span>
                              ) : (
                                <input
                                  type="text" placeholder="Nama guru..."
                                  value={s.teacherName ?? ''}
                                  onChange={e => handleSubjectChange(idx, 'teacherName', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs focus:border-primary outline-none"
                                />
                              )}
                            </td>
                            {/* isEvent toggle */}
                            <td className="py-2 pr-2 text-center">
                              <button
                                onClick={() => handleSubjectChange(idx, 'isEvent', !s.isEvent)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                                  s.isEvent
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                              >
                                {s.isEvent ? 'EVENT' : 'PELAJARAN'}
                              </button>
                            </td>
                            {/* Delete */}
                            <td className="py-2">
                              <button
                                onClick={() => handleRemoveRow(idx)}
                                className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Add row */}
                    <button
                      onClick={handleAddRow}
                      className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Tambah Baris
                    </button>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/8 shrink-0">
                    <button
                      onClick={() => setEditModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-outlined hover:text-inverted transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveSchedule}
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #243B3C, #2d5253)' }}
                    >
                      {saveLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                        : <><Save className="w-4 h-4" /> Simpan Jadwal</>}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
