import { useState } from 'react';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { Trophy, Plus, Clock, X } from 'lucide-react';

const MAX_ACHIEVEMENTS = 3;

export default function Achievements() {
  const { user, isAuthenticated } = useAuth();

  const allApproved = storage.getAchievements();
  const allPending  = storage.getPendingItems().filter(p => p.type === 'achievement');
  const myApproved  = allApproved.filter(a => a.studentId === user?.id);
  const myPending   = allPending.filter(p => p.studentId === user?.id);
  const myTotal     = myApproved.length + myPending.length;
  const canAdd      = isAuthenticated && user?.role === 'student' && myTotal < MAX_ACHIEVEMENTS;

  const [achievements, setAchievements] = useState(allApproved);
  const [pending, setPending]           = useState(allPending);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [title, setTitle]               = useState('');
  const [date, setDate]                 = useState('');
  const [description, setDescription]   = useState('');

  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (!title || !date || !description) return;
    const data = { studentId: user.id, studentName: user.name, title, date, description };
    const newPending = storage.submitPending('achievement', user.id, user.name, data);
    setPending(prev => [...prev, newPending]);
    setTitle(''); setDate(''); setDescription('');
    setShowAddForm(false); setSubmitted(true);
  };

  const myPendingItems = pending.filter(p => p.studentId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Prestasi Pelajar</h1>
        </div>
        {isAuthenticated && user?.role === 'student' && (
          <div className="flex flex-col items-end gap-1">
            {canAdd ? (
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Prestasi
              </button>
            ) : (
              <span className="text-xs text-outlined bg-black/5 px-3 py-2 rounded-xl">
                ✅ Batas prestasi tercapai (maks. {MAX_ACHIEVEMENTS})
              </span>
            )}
            <span className="text-[10px] text-outlined">{myTotal}/{MAX_ACHIEVEMENTS} prestasi kamu</span>
          </div>
        )}
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Prestasimu dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
          <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-secondary rounded-3xl p-6 mb-8 border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-4">Tambah Prestasi Baru</h2>
          <form onSubmit={handleAddAchievement} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Nama Prestasi / Lomba</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Bulan/Tahun (contoh: Agustus 2025)</label>
                <input type="text" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Deskripsi Singkat</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none" required />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5">Batal</button>
              <button type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90">Kirim untuk Disetujui</button>
            </div>
          </form>
        </div>
      )}

      {isAuthenticated && myPendingItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-outlined mb-3">Prestasimu (Menunggu Persetujuan)</h3>
          <div className="space-y-4">
            {myPendingItems.map(p => (
              <div key={p.id} className="bg-amber-50 border-2 border-dashed border-amber-300 p-5 rounded-3xl flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-inverted">{p.data.title}</h3>
                    <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full">⏳ Pending</span>
                  </div>
                  <p className="text-xs text-outlined mb-1">{p.data.date}</p>
                  <p className="text-sm text-outlined">{p.data.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {achievements.length === 0 ? (
          <div className="py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada prestasi yang disetujui.
          </div>
        ) : (
          achievements.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-inverted">{item.title}</h3>
                  <span className="text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md w-fit">{item.date}</span>
                </div>
                <p className="text-sm text-outlined mb-3">{item.description}</p>
                <p className="text-xs font-medium text-outlined">
                  Oleh <span className="text-primary">{item.studentName}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
