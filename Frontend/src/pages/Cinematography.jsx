import { useState, useRef } from 'react';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { Camera, Plus, Play, Clock, Upload, X } from 'lucide-react';

const MAX_FILE_MB = 2;

export default function Cinematography() {
  const { user, isAuthenticated } = useAuth();

  const allApproved  = storage.getCinematography();
  const allPending   = storage.getPendingItems().filter(p => p.type === 'cinematography');

  // How many times THIS user has uploaded (approved + pending)
  const myApproved = allApproved.filter(m => m.studentId === user?.id);
  const myPending  = allPending.filter(p => p.studentId === user?.id);
  const myTotal    = myApproved.length + myPending.length;
  const canUpload  = isAuthenticated && user?.role === 'student' && myTotal < 1;

  const [media, setMedia]         = useState(allApproved);
  const [pending, setPending]     = useState(allPending);
  const [showForm, setShowForm]   = useState(false);
  const [title, setTitle]         = useState('');
  const [type, setType]           = useState('photo');
  const [fileData, setFileData]   = useState(null);   // Base64 for photo
  const [videoUrl, setVideoUrl]   = useState('');     // URL for video
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Ukuran file maksimal ${MAX_FILE_MB}MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFileData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    if (type === 'photo' && !fileData) { setFileError('Pilih file foto terlebih dahulu.'); return; }
    if (type === 'video' && !videoUrl)  { setFileError('Masukkan URL video.'); return; }

    const data = {
      studentId: user.id,
      studentName: user.name,
      title,
      type,
      url: type === 'photo' ? fileData : videoUrl,
    };

    const newPending = storage.submitPending('cinematography', user.id, user.name, data);
    setPending(prev => [...prev, newPending]);
    setSubmitted(true);
    setShowForm(false);
    setTitle(''); setFileData(null); setVideoUrl(''); setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const myPendingItems = pending.filter(p => p.studentId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 w-fit"
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
          <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="w-4 h-4" /></button>
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
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Jenis Media</label>
              <select value={type} onChange={(e) => { setType(e.target.value); setFileData(null); setVideoUrl(''); setFileError(''); }}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none">
                <option value="photo">Foto</option>
                <option value="video">Video (URL YouTube)</option>
              </select>
            </div>

            {type === 'photo' ? (
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">
                  Upload Foto <span className="text-outlined font-normal">(maks. {MAX_FILE_MB}MB)</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
                  {fileData ? (
                    <img src={fileData} className="h-full w-full object-contain rounded-xl" alt="preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-outlined">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Klik untuk pilih foto</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">URL Video (YouTube)</label>
                <input
                  type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                />
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5 transition-all">
                Batal
              </button>
              <button type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all">
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
              <div key={p.id} className="relative rounded-3xl overflow-hidden aspect-video bg-black/5 border-2 border-dashed border-amber-300">
                {p.data.type === 'photo' && p.data.url
                  ? <img src={p.data.url} alt={p.data.title} className="w-full h-full object-cover opacity-60" />
                  : <div className="w-full h-full flex items-center justify-center bg-black/20"><Play className="w-10 h-10 text-white/40" /></div>
                }
                <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm font-semibold truncate">{p.data.title}</p>
                </div>
                <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ⏳ Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada karya yang disetujui.
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="group relative rounded-3xl overflow-hidden aspect-video bg-black/5 border border-black/5">
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/80">
                  <Play className="w-12 h-12 text-white/50" />
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label="Play video" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold mb-1 truncate">{item.title}</h3>
                <p className="text-white/70 text-xs">Oleh {item.studentName}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
