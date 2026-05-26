import { useState, useRef, useEffect } from 'react';
import useAuth from '../context/useAuth';
import { getCinematography, subscribeToPending, submitPending } from '../utils/firestoreService';
import { Camera, Plus, Play, Clock, Upload, X } from 'lucide-react';

const MAX_FILE_MB = 2;

export default function Cinematography() {
  const { user, isAuthenticated } = useAuth();

  const [media, setMedia]         = useState([]);
  const [pending, setPending]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [title, setTitle]         = useState('');
  const [type, setType]           = useState('photo');
  const [photos, setPhotos]       = useState([]);     // Array of Base64 for photo
  const [videoUrl, setVideoUrl]   = useState('');     // URL for video
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadCinematography() {
      try {
        const approved = await getCinematography();
        setMedia(approved);
      } catch (err) {
        console.error("Failed to load approved cinematography:", err);
      }
    }
    loadCinematography();

    const unsubscribe = subscribeToPending((items) => {
      const cinematographyPending = items.filter(p => p.type === 'cinematography');
      setPending(cinematographyPending);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // How many times THIS user has uploaded (approved + pending)
  const myApproved = media.filter(m => m.studentId === user?.id);
  const myPending  = pending.filter(p => p.studentId === user?.id);
  const myTotal    = myApproved.length + myPending.length;
  const canUpload  = isAuthenticated && user?.role === 'student' && myTotal < 1;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    if (type === 'photo' && photos.length === 0) { setFileError('Pilih file foto terlebih dahulu.'); return; }
    if (type === 'video' && !videoUrl)  { setFileError('Masukkan URL video.'); return; }

    const data = {
      studentId: user.id,
      studentName: user.name,
      title,
      type,
      url: type === 'photo' ? photos[0] : videoUrl,
      photos: type === 'photo' ? photos : undefined,
    };

    try {
      await submitPending('cinematography', user.id, user.name, data);
      setSubmitted(true);
      setShowForm(false);
      setTitle(''); setPhotos([]); setVideoUrl(''); setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Failed to submit cinematography:", err);
      setFileError("Gagal mengirimkan karya. Coba lagi.");
    }
  };

  const myPendingItems = pending.filter(p => p.studentId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Galeri Sinematografi</h1>
        </div>

        {isAuthenticated && user?.role === 'student' && (
          canUpload ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 w-fit cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Upload Karya
            </button>
          ) : (
            <span className="text-xs text-outlined bg-black/5 px-3 py-2 rounded-xl">
              {myPending.length > 0
                ? '⏳ Karyamu sedang menunggu persetujuan admin'
                : '✅ Kamu sudah upload 1 karya (batas maksimal)'}
            </span>
          )
        )}
      </div>

      {/* Success notice */}
      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Karyamu berhasil dikirim dan <strong>menunggu persetujuan admin</strong>. Akan muncul di galeri setelah disetujui.</span>
          <button onClick={() => setSubmitted(false)} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="bg-secondary rounded-3xl p-6 mb-8 border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-4">Upload Karya Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Judul Karya</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Jenis Media</label>
              <select value={type} onChange={(e) => { setType(e.target.value); setPhotos([]); setVideoUrl(''); setFileError(''); }}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white">
                <option value="photo">Foto</option>
                <option value="video">Video (URL YouTube)</option>
              </select>
            </div>

            {type === 'photo' ? (
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">
                  Upload Foto <span className="text-outlined font-normal">(tiap foto maks. {MAX_FILE_MB}MB)</span>
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
                    <Upload className="w-6 h-6 text-outlined" />
                    <span className="text-[10px] text-outlined mt-1">Tambah Foto</span>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">URL Video (YouTube)</label>
                <input
                  type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white"
                />
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5 transition-all cursor-pointer">
                Batal
              </button>
              <button type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all cursor-pointer">
                Kirim untuk Disetujui
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My pending item (visible only to uploader) */}
      {isAuthenticated && myPendingItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-outlined mb-3">Karyamu (Menunggu Persetujuan)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPendingItems.map(p => (
              <div key={p.id} className="bg-amber-50 border-2 border-dashed border-amber-300 p-6 rounded-3xl flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-inverted">{p.data.title}</h3>
                  <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">⏳ Pending</span>
                </div>
                {p.data.type === 'photo' && p.data.photos && p.data.photos.length > 0 ? (
                  <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                    {p.data.photos.map((ph, idx) => (
                      <img key={idx} src={ph} alt="Dokumentasi" className="w-32 h-24 object-cover rounded-xl shrink-0 border border-black/5" />
                    ))}
                  </div>
                ) : p.data.type === 'photo' && p.data.url ? (
                  <img src={p.data.url} alt="Dokumentasi" className="w-full h-32 object-cover rounded-xl mb-3 border border-black/5" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-black/10 rounded-xl mb-3">
                    <Play className="w-8 h-8 text-black/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 h-48 animate-pulse" />
          ))
        ) : media.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada karya yang disetujui.
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-inverted mb-2">{item.title}</h3>
              {item.type === 'photo' ? (
                item.photos && item.photos.length > 0 ? (
                  <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
                    {item.photos.map((ph, idx) => (
                      <img key={idx} src={ph} alt="Dokumentasi" className="w-40 h-28 object-cover rounded-xl shrink-0 border border-black/5" />
                    ))}
                  </div>
                ) : (
                  <img src={item.url} alt="Dokumentasi" className="w-full h-40 object-cover rounded-xl mb-3 border border-black/5" />
                )
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-black/80 rounded-xl mb-3 relative overflow-hidden">
                  <Play className="w-12 h-12 text-white/50" />
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label="Play video" />
                </div>
              )}
              <div className="pt-4 border-t border-black/5 flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-md">Oleh {item.studentName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
