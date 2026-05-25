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
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate }             from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc }          from 'firebase/firestore';
import { secondaryAuth, db }       from '../utils/firebase';
import useAuth                     from '../context/useAuth';
import {
  subscribeToStudents,
  subscribeToPending,
  addStudent,
  deleteStudent,
  createUserDoc,
  deleteUserDoc,
  approvePending,
  rejectPending,
} from '../utils/firestoreService';
import { roles, avatarColors, getInitials } from '../data/students';
import {
  UserPlus, Trash2, ShieldAlert, CheckCircle, XCircle,
  Clock, Camera, Rocket, Trophy, Loader2,
} from 'lucide-react';

const TYPE_LABELS = {
  cinematography: { label: 'Sinematografi', icon: Camera, color: 'text-blue-600 bg-blue-50'   },
  project:        { label: 'Proyek',         icon: Rocket,  color: 'text-green-600 bg-green-50' },
  achievement:    { label: 'Prestasi',        icon: Trophy,  color: 'text-amber-600 bg-amber-50' },
};

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
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'approval'

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

    return () => {
      unsubStudents();
      unsubPending();
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

    // Simpan kredensial admin untuk re-auth nanti
    const adminEmail    = user.email;
    const adminPassword = null; // kita tidak punya password admin di client — gunakan cara lain

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
  }, [name, absentNumber, gender, tempPassword, user?.email]);

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
      <div className="flex gap-2 mb-8 border-b border-black/10 pb-0">
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
    </div>
  );
}
