import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useAuth from '../context/useAuth';
import {
  subscribeToCinematography,
  subscribeToMyPending,
  submitPending,
  deleteCinematography,
  updateCinematography,
} from '../utils/firestoreService';
import { Camera, Plus, Play, Clock, Upload, X, Trash2, AlertTriangle, Pencil } from 'lucide-react';

const MAX_FILE_MB = 2;

// ── Confirmation Dialog ──────────────────────────────────────────────────────
function DeleteConfirmDialog({ itemTitle, onConfirm, onCancel, isDeleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-inverted">Hapus Karya?</h3>
            <p className="text-xs text-outlined mt-0.5">Tindakan ini tidak bisa dibatalkan.</p>
          </div>
        </div>

        <p className="text-sm text-outlined mb-6 leading-relaxed">
          Kamu akan menghapus karya{' '}
          <span className="font-semibold text-inverted">"{itemTitle}"</span> secara permanen.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditCinemaDialog({ item, onSave, onCancel, isSaving }) {
  const [title, setTitle]       = useState(item.title || '');
  const [mediaType, setMediaType] = useState(item.type || 'photo');
  const [photos, setPhotos]     = useState(item.photos || (item.type === 'photo' && item.url ? [item.url] : []));
  const [videoUrl, setVideoUrl] = useState(item.type === 'video' ? (item.url || '') : '');
  const [fileErr, setFileErr]   = useState('');
  const fileRef                 = useRef(null);

  // reset konten media saat tipe diganti
  const handleTypeChange = (newType) => {
    setMediaType(newType);
    setPhotos([]);
    setVideoUrl('');
    setFileErr('');
  };

  const handleFiles = (e) => {
    setFileErr('');
    Array.from(e.target.files).forEach((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setFileErr(`File diabaikan, ukurannya lebih dari ${MAX_FILE_MB}MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mediaType === 'photo' && photos.length === 0) {
      setFileErr('Tambahkan minimal satu foto.');
      return;
    }
    if (mediaType === 'video' && !videoUrl.trim()) {
      setFileErr('Masukkan URL video YouTube.');
      return;
    }
    onSave({
      title,
      type: mediaType,
      url: mediaType === 'photo' ? photos[0] : videoUrl.trim(),
      photos: mediaType === 'photo' ? photos : [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-5">
          <Pencil className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold text-inverted">Edit Karya</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-inverted mb-1">Judul Karya</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-inverted mb-1">Jenis Media</label>
            <select
              value={mediaType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm"
            >
              <option value="photo">Foto</option>
              <option value="video">Video (URL YouTube)</option>
            </select>
          </div>

          {mediaType === 'photo' ? (
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">
                Upload Foto <span className="text-outlined font-normal">(maks. {MAX_FILE_MB}MB per foto)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {photos.map((ph, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group border border-black/10">
                    <img src={ph} alt="foto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:bg-black/5 shrink-0">
                  <Upload className="w-4 h-4 text-outlined" />
                  <span className="text-[10px] text-outlined mt-1">Tambah</span>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </label>
              </div>
              {fileErr && <p className="text-xs text-red-500">{fileErr}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">URL Video (YouTube)</label>
              <input
                type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm"
              />
              {fileErr && <p className="text-xs text-red-500 mt-1">{fileErr}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onCancel} disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit" disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSaving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Cinematography() {
  const { user, role, isAuthenticated } = useAuth();

  const [media, setMedia]               = useState([]);
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [title, setTitle]               = useState('');
  const [type, setType]                 = useState('photo');
  const [photos, setPhotos]             = useState([]);
  const [videoUrl, setVideoUrl]         = useState('');
  const [fileError, setFileError]       = useState('');
  const [submitted, setSubmitted]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [isSaving, setIsSaving]         = useState(false);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    const unsubMedia = subscribeToCinematography((approved) => {
      setMedia(approved);
      setLoading(false);
    });

    const unsubPending = subscribeToMyPending(user?.uid ?? null, 'cinematography', (items) => {
      setPending(items);
    });

    return () => {
      unsubMedia();
      unsubPending();
    };
  }, [user?.uid]);

  const myApproved = media.filter((m) => m.studentId === user?.id);
  const myPending  = pending.filter((p) => p.studentId === user?.id);
  const myTotal    = myApproved.length + myPending.length;
  const canUpload  = isAuthenticated && user?.role === 'student' && myTotal < 1;

  // ── File Handling ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    setFileError('');
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let hasError = false;
    const validFiles = [];
    files.forEach((file) => {
      if (file.size > MAX_FILE_MB * 1024 * 1024) hasError = true;
      else validFiles.push(file);
    });

    if (hasError) setFileError(`Beberapa file diabaikan karena lebih dari ${MAX_FILE_MB}MB.`);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index) => setPhotos((prev) => prev.filter((_, i) => i !== index));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    if (type === 'photo' && photos.length === 0) { setFileError('Pilih file foto terlebih dahulu.'); return; }
    if (type === 'video' && !videoUrl) { setFileError('Masukkan URL video.'); return; }

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
      console.error('Failed to submit cinematography:', err);
      setFileError('Gagal mengirimkan karya. Coba lagi.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCinematography(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete cinematography item:', err);
      alert('Gagal menghapus karya. Kamu mungkin tidak memiliki izin.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditSave = async (data) => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      await updateCinematography(editTarget.id, data);
      setEditTarget(null);
    } catch (err) {
      console.error('Gagal update karya:', err);
      alert('Gagal menyimpan perubahan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const myPendingItems = pending;

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
          <button onClick={() => setSubmitted(false)} className="ml-auto cursor-pointer">
            <X className="w-4 h-4" />
          </button>
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
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPhotos([]); setVideoUrl(''); setFileError(''); }}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white"
              >
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
            {myPendingItems.map((p) => (
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

      {/* Galeri karya yang sudah disetujui */}
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
          <AnimatePresence mode="popLayout">
            {media.map((item) => {
              const canManage = role === 'admin' || user?.uid === item.userId;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.25 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col hover:shadow-md transition-shadow group relative"
                >
                  {/* Tombol edit & hapus */}
                  {canManage && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button
                        onClick={() => setEditTarget(item)}
                        title="Edit karya"
                        className="p-2 rounded-xl text-outlined hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                        title="Hapus karya"
                        className="p-2 rounded-xl text-outlined hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-inverted mb-2 pr-20">{item.title}</h3>
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Confirmation Dialog Portal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmDialog
            itemTitle={deleteTarget.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => !isDeleting && setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* Edit Dialog Portal */}
      <AnimatePresence>
        {editTarget && (
          <EditCinemaDialog
            item={editTarget}
            onSave={handleEditSave}
            onCancel={() => !isSaving && setEditTarget(null)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
