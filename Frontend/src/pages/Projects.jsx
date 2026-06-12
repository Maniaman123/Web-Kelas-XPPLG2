import { useState, useRef, useEffect } from 'react';
import useAuth from '../context/useAuth';
import { subscribeToProjects, subscribeToMyPending, submitPending } from '../utils/firestoreService';
import { Rocket, Plus, ExternalLink, Clock, X, Upload } from 'lucide-react';

const MAX_FILE_MB = 2;

export default function Projects() {
  const { user, isAuthenticated } = useAuth();

  const [projects, setProjects]       = useState([]);
  const [pending, setPending]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink]               = useState('');
  
  const [photos, setPhotos]           = useState([]);
  const [fileError, setFileError]     = useState('');
  const fileInputRef                  = useRef(null);

  useEffect(() => {
    const unsubProjects = subscribeToProjects((approved) => {
      setProjects(approved);
      setLoading(false);
    });

    // subscribeToMyPending hanya membaca dokumen milik user sendiri
    // (studentId == uid) — aman untuk halaman non-admin.
    // Jika user belum login, langsung kembalikan array kosong.
    const unsubPending = subscribeToMyPending(user?.uid ?? null, 'project', (items) => {
      setPending(items);
    });

    return () => {
      unsubProjects();
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

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    const data = { studentId: user.id, studentName: user.name, title, description, link, photos };
    
    try {
      await submitPending('project', user.id, user.name, data);
      setTitle(''); setDescription(''); setLink(''); setPhotos([]); setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowAddForm(false); setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit pending project:", err);
      setFileError("Gagal mengirimkan proyek. Coba lagi.");
    }
  };

  // Listener sudah scoped ke uid — tidak perlu filter manual lagi
  const myPendingItems = pending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Proyek Pelajar</h1>
        </div>
        {isAuthenticated && user?.role === 'student' && (
          <div className="flex flex-col items-end gap-1">
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
              <Plus className="w-4 h-4" /> Tambah Proyek
            </button>
          </div>
        )}
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Proyekmu dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
          <button onClick={() => setSubmitted(false)} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-secondary rounded-3xl p-6 mb-8 border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-4">Tambah Proyek Baru</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Judul Proyek</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Deskripsi</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Link Demo / GitHub (Opsional)</label>
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white" />
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
          <h3 className="text-sm font-semibold text-outlined mb-3">Proyekmu (Menunggu Persetujuan)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPendingItems.map(p => (
              <div key={p.id} className="bg-amber-50 border-2 border-dashed border-amber-300 p-6 rounded-3xl flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-inverted">{p.data.title}</h3>
                  <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">⏳ Pending</span>
                </div>
                {p.data.photos && p.data.photos.length > 0 && (
                  <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
                    {p.data.photos.map((ph, idx) => (
                      <img key={idx} src={ph} alt="Dokumentasi" className="w-32 h-24 object-cover rounded-xl shrink-0 border border-black/5" />
                    ))}
                  </div>
                )}
                <p className="text-sm text-outlined flex-1">{p.data.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 h-48 animate-pulse" />
          ))
        ) : projects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada proyek yang disetujui.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-inverted mb-2">{project.title}</h3>
              {project.photos && project.photos.length > 0 && (
                <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
                  {project.photos.map((ph, idx) => (
                    <img key={idx} src={ph} alt="Dokumentasi" className="w-32 h-24 object-cover rounded-xl shrink-0 border border-black/5" />
                  ))}
                </div>
              )}
              <p className="text-sm text-outlined mb-4 flex-1 leading-relaxed">{project.description}</p>
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-md">Oleh {project.studentName}</span>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-outlined hover:text-primary hover:bg-primary/5 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
