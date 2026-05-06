import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import { roles, avatarColors, getInitials } from '../data/students';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState(() => storage.getStudents());
  const [users, setUsers] = useState(() => storage.getUsers());
  
  // Form state
  const [name, setName] = useState('');
  const [absentNumber, setAbsentNumber] = useState('');
  const [gender, setGender] = useState('L');
  const [tempPassword, setTempPassword] = useState('student123');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!name || !absentNumber || !tempPassword) return;

    // 1. Create Login Account
    const newUserId = `user-${Date.now()}`;
    const newUser = {
      id: newUserId,
      username: name.toLowerCase().replace(/\s+/g, ''),
      password: tempPassword,
      role: 'student',
      name: name
    };
    const updatedUsers = [...users, newUser];
    storage.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    // 2. Create Student Directory Profile
    const newStudent = {
      id: `student-${Date.now()}`,
      userId: newUserId,
      name,
      absentNumber: parseInt(absentNumber),
      gender,
      initials: getInitials(name),
      role: roles[Math.floor(Math.random() * roles.length)], // Random initial role
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      about: '',
      ig: '',
      github: '',
      portfolio: ''
    };
    
    const updatedStudents = [...students, newStudent];
    storage.saveStudents(updatedStudents);
    setStudents(updatedStudents);

    // Reset form
    setName('');
    setAbsentNumber('');
  };

  const handleDelete = (userId, studentId) => {
    if (!window.confirm('Yakin ingin menghapus pelajar ini?')) return;
    
    const updatedUsers = users.filter(u => u.id !== userId);
    const updatedStudents = students.filter(s => s.id !== studentId);
    
    storage.saveUsers(updatedUsers);
    storage.saveStudents(updatedStudents);
    
    setUsers(updatedUsers);
    setStudents(updatedStudents);
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-inverted">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="bg-secondary rounded-3xl p-6 h-fit border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Tambah Pelajar Baru
          </h2>
          
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
              <p className="text-[10px] text-outlined mt-1">Username otomatis: {name.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">No Absen</label>
                <input
                  type="number"
                  value={absentNumber}
                  onChange={(e) => setAbsentNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
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
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all"
            >
              Buat Akun & Profil
            </button>
          </form>
        </div>

        {/* List Card */}
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
                {students.sort((a,b) => a.absentNumber - b.absentNumber).map(student => {
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
                        <button
                          onClick={() => handleDelete(student.userId, student.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pelajar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-outlined">Belum ada data pelajar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
