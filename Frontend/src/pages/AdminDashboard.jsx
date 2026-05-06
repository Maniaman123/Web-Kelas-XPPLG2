import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { UserPlus, Trash2, ShieldAlert, CheckCircle, XCircle, Clock, Camera, Rocket, Trophy } from 'lucide-react';
import { roles, avatarColors, getInitials } from '../data/students';

const TYPE_LABELS = {
  cinematography: { label: 'Sinematografi', icon: Camera, color: 'text-blue-600 bg-blue-50' },
  project:        { label: 'Proyek',         icon: Rocket,  color: 'text-green-600 bg-green-50' },
  achievement:    { label: 'Prestasi',        icon: Trophy,  color: 'text-amber-600 bg-amber-50' },
};

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState(() => storage.getStudents());
  const [users, setUsers]       = useState(() => storage.getUsers());
  const [pending, setPending]   = useState(() => storage.getPendingItems());
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'approval'

  const [name, setName]               = useState('');
  const [absentNumber, setAbsentNumber] = useState('');
  const [gender, setGender]           = useState('L');
  const [tempPassword, setTempPassword] = useState('student123');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') navigate('/');
  }, [isAuthenticated, user, navigate]);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!name || !absentNumber || !tempPassword) return;

    const newUserId = `user-${Date.now()}`;
    const newUser = {
      id: newUserId,
      username: name.toLowerCase().replace(/\s+/g, ''),
      password: tempPassword,
      role: 'student',
      name,
    };
    const updatedUsers = [...users, newUser];
    storage.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    const newStudent = {
      id: `student-${Date.now()}`,
      userId: newUserId,
      name,
      absentNumber: parseInt(absentNumber),
      gender,
      initials: getInitials(name),
      role: roles[Math.floor(Math.random() * roles.length)],
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      about: '', ig: '', github: '', portfolio: '',
    };
    const updatedStudents = [...students, newStudent];
    storage.saveStudents(updatedStudents);
    setStudents(updatedStudents);

    setName(''); setAbsentNumber('');
  };

  const handleDelete = (userId, studentId) => {
    if (!window.confirm('Yakin ingin menghapus pelajar ini?')) return;
    const updatedUsers    = users.filter(u => u.id !== userId);
    const updatedStudents = students.filter(s => s.id !== studentId);
    storage.saveUsers(updatedUsers);
    storage.saveStudents(updatedStudents);
    setUsers(updatedUsers);
    setStudents(updatedStudents);
  };

  const handleApprove = (pendingId) => {
    storage.approvePending(pendingId);
    setPending(storage.getPendingItems());
  };

  const handleReject = (pendingId) => {
    if (!window.confirm('Tolak konten ini?')) return;
    storage.rejectPending(pendingId);
    setPending(storage.getPendingItems());
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-inverted">Admin Dashboard</h1>
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

      {/* === TAB: STUDENTS === */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add form */}
          <div className="bg-secondary rounded-3xl p-6 h-fit border border-secondary-dark/30">
            <h2 className="text-xl font-bold text-inverted mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Tambah Pelajar Baru
            </h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Nama Lengkap</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" required />
                <p className="text-[10px] text-outlined mt-1">Username: {name.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-inverted mb-1">No Absen</label>
                  <input type="number" value={absentNumber} onChange={(e) => setAbsentNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-inverted mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none">
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Password Sementara</label>
                <input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none" required />
              </div>
              <button type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all">
                Buat Akun & Profil
              </button>
            </form>
          </div>

          {/* Student list */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-black/5">
            <h2 className="text-xl font-bold text-inverted mb-6">Daftar Pelajar ({students.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-outlined">
                    <th className="pb-3 font-medium">Absen</th>
                    <th className="pb-3 font-medium">Nama & Username</th>
                    <th className="pb-3 font-medium">Gender</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {[...students].sort((a, b) => a.absentNumber - b.absentNumber).map(student => {
                    const studentUser = users.find(u => u.id === student.userId);
                    return (
                      <tr key={student.id} className="border-b border-black/5 last:border-0">
                        <td className="py-3 text-primary font-bold">{student.absentNumber}</td>
                        <td className="py-3">
                          <p className="font-semibold text-inverted">{student.name}</p>
                          <p className="text-xs text-outlined">@{studentUser?.username}</p>
                        </td>
                        <td className="py-3">{student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleDelete(student.userId, student.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Pelajar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-outlined">Belum ada data pelajar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === TAB: APPROVAL === */}
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
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-inverted truncate">{item.data.title}</p>
                        <span className="text-[10px] text-outlined shrink-0">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
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
                      <button onClick={() => handleApprove(item.id)}
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
