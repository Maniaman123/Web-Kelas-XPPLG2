import { useState, useRef, useEffect } from 'react';
import useAuth from '../context/useAuth';
import { subscribeToAchievements, subscribeToMyPending, submitPending } from '../utils/firestoreService';
import { Trophy, Plus, Clock, X, Upload } from 'lucide-react';

const MAX_FILE_MB = 2;

export default function Achievements() {
  const { user, isAuthenticated } = useAuth();

  const [achievements, setAchievements] = useState([]);
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [title, setTitle]               = useState('');
  const [date, setDate]                 = useState('');
  const [description, setDescription]   = useState('');
  
  const [photos, setPhotos]             = useState([]);
  const [fileError, setFileError]       = useState('');
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    const unsubAchievements = subscribeToAchievements((approved) => {
      setAchievements(approved);
      setLoading(false);
    });

    const unsubPending = subscribeToMyPending(user?.uid ?? null, 'achievement', (items) => {
      setPending(items);
    });

    return () => {
      unsubAchievements();
      unsubPending();
    };
  }, [user?.uid]);

  const handleFileChange = (e) => {
    setFileError('');
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    let hasError = false;
    const validFiles = [];
    files.forEach(file => {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        hasError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (hasError) {
      setFileError(`Beberapa file diabaikan karena lebih dari ${MAX_FILE_MB}MB.`);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!title || !date || !description) return;
    const data = { studentId: user.id, studentName: user.name, title, date, description, photos };
    
    try {
      await submitPending('achievement', user.id, user.name, data);
      setTitle(''); setDate(''); setDescription(''); setPhotos([]); setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowAddForm(false); setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit achievement:", err);
      setFileError("Gagal mengirimkan prestasi. Coba lagi.");
    }
  };

  const myPendingItems = pending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Prestasi Pelajar</h1>
        </div>
        {isAuthenticated && user?.role === 'student' && (
          <div className="flex flex-col items-end gap-1">
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
              <Plus className="w-4 h-4" /> Tambah Prestasi
            </button>
          </div>
        )}
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Prestasimu dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
          <button onClick={() => setSubmitted(false)} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
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
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Bulan/Tahun (contoh: Agustus 2025)</label>
                <input type="text" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Deskripsi Singkat</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">
                Foto Dokumentasi (Opsional) <span className="text-outlined font-normal">(tiap foto maks. {MAX_FILE_MB}MB)</span>
              </label>
              <div className="flex flex-wrap gap-3 mb-1">
                {photos.map((photo, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl border border-black/10 overflow-hidden shrink-0 group">
                    <img src={photo} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} 
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:bg-black/5 transition-colors shrink-0">
                  <Upload className="w-5 h-5 text-outlined" />
                  <span className="text-[10px] text-outlined mt-1">Tambah Foto</span>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5 cursor-pointer">Batal</button>
              <button type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 cursor-pointer">Kirim untuk Disetujui</button>
            </div>
          </form>
        </div>
      )}

      {isAuthenticated && myPendingItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-outlined mb-3">Prestasimu (Menunggu Persetujuan)</h3>
          <div className="space-y-4">
            {myPendingItems.map(p => (
              <div key={p.id} className="bg-amber-50 border-2 border-dashed border-amber-300 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-inverted">{p.data.title}</h3>
                    <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full">⏳ Pending</span>
                  </div>
                  <p className="text-xs text-outlined mb-2">{p.data.date}</p>
                  <p className="text-sm text-outlined mb-3">{p.data.description}</p>
                  {p.data.photos && p.data.photos.length > 0 && (
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                      {p.data.photos.map((ph, idx) => (
                        <img key={idx} src={ph} alt="Dokumentasi" className="w-32 h-24 object-cover rounded-xl shrink-0 border border-black/5" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 h-32 animate-pulse" />
          ))
        ) : achievements.length === 0 ? (
          <div className="py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada prestasi yang disetujui.
          </div>
        ) : (
          achievements.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 items-start hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-inverted">{item.title}</h3>
                  <span className="text-sm font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-md w-fit">{item.date}</span>
                </div>
                <p className="text-sm text-outlined mb-3 leading-relaxed">{item.description}</p>
                {item.photos && item.photos.length > 0 && (
                  <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
                    {item.photos.map((ph, idx) => (
                      <img key={idx} src={ph} alt="Dokumentasi" className="w-40 h-28 object-cover rounded-xl shrink-0 border border-black/5" />
                    ))}
                  </div>
                )}
                <p className="text-xs font-medium text-outlined mt-2">
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
