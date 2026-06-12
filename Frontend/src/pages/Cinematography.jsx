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
import {
  Camera, Plus, Play, Clock, Upload, X,
  Trash2, AlertTriangle, Pencil, Clapperboard,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_MB  = 2;
const CATEGORIES   = ['Film Pendek', 'Dokumentasi', 'Tutorial / Edukasi', 'Seni & Kreatif'];

const BADGE_STYLES = {
  'Film Pendek':        'bg-violet-500/80 text-white border-violet-400/50',
  'Dokumentasi':        'bg-sky-500/80 text-white border-sky-400/50',
  'Tutorial / Edukasi': 'bg-emerald-500/80 text-white border-emerald-400/50',
  'Seni & Kreatif':     'bg-rose-500/80 text-white border-rose-400/50',
};
const badgeClass = (cat) => BADGE_STYLES[cat] || 'bg-black/60 text-white border-white/25';

// ── Shared dark-teal form styles ───────────────────────────────────────────────
const INP = [
  'w-full px-4 py-2.5 rounded-xl',
  'bg-white/10 border border-white/15 text-white',
  'placeholder:text-white/30',
  'focus:border-[#DCEEFA]/60 focus:bg-white/15',
  'outline-none text-sm transition-colors',
].join(' ');

const LBL = 'block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider';

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────
function DeleteConfirmDialog({ itemTitle, onConfirm, onCancel, isDeleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="bg-[#1a2c2d] border border-white/10 rounded-3xl shadow-2xl p-7 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-rose-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Hapus Karya?</h3>
            <p className="text-xs text-white/40 mt-0.5">Tindakan ini tidak bisa dibatalkan.</p>
          </div>
        </div>

        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Karya <span className="font-semibold text-[#DCEEFA]">"{itemTitle}"</span> akan dihapus secara permanen dari galeri.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isDeleting
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditCinemaDialog({ item, onSave, onCancel, isSaving }) {
  const [title,    setTitle]    = useState(item.title    || '');
  const [category, setCategory] = useState(item.category || CATEGORIES[0]);
  const [mediaType, setMediaType] = useState(item.type   || 'photo');
  const [photos,   setPhotos]   = useState(
    item.photos?.length > 0 ? item.photos : (item.type === 'photo' && item.url ? [item.url] : [])
  );
  const [videoUrl, setVideoUrl] = useState(item.type === 'video' ? (item.url || '') : '');
  const [fileErr,  setFileErr]  = useState('');
  const fileRef = useRef(null);

  const handleTypeSwitch = (t) => {
    setMediaType(t);
    setPhotos([]);
    setVideoUrl('');
    setFileErr('');
  };

  const handleFiles = (e) => {
    setFileErr('');
    Array.from(e.target.files).forEach((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setFileErr(`File diabaikan, ukurannya melebihi ${MAX_FILE_MB}MB.`);
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
    if (mediaType === 'photo' && photos.length === 0) { setFileErr('Tambahkan minimal satu foto.'); return; }
    if (mediaType === 'video' && !videoUrl.trim())    { setFileErr('Masukkan URL video YouTube.'); return; }
    onSave({
      title,
      category,
      type:   mediaType,
      url:    mediaType === 'photo' ? photos[0] : videoUrl.trim(),
      photos: mediaType === 'photo' ? photos : [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="bg-[#1a2c2d] border border-white/10 rounded-3xl shadow-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-6">
          <Pencil className="w-4 h-4 text-[#DCEEFA]" />
          <h3 className="text-base font-bold text-white">Edit Karya</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className={LBL}>Judul Karya</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INP}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className={LBL}>Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INP}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1a2c2d] text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Media type toggle */}
          <div>
            <label className={LBL}>Jenis Media</label>
            <div className="flex gap-2">
              {[{ val: 'photo', label: '📷  Foto' }, { val: 'video', label: '🎬  Video' }].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleTypeSwitch(val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    mediaType === val
                      ? 'bg-[#DCEEFA] text-[#243B3C] border-[#DCEEFA]'
                      : 'bg-white/8 text-white/55 border-white/15 hover:bg-white/15'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          {mediaType === 'photo' && (
            <div>
              <label className={LBL}>
                Upload Foto{' '}
                <span className="normal-case font-normal tracking-normal text-white/30">
                  (maks. {MAX_FILE_MB}MB / foto)
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {photos.map((ph, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group border border-white/15">
                    <img src={ph} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 shrink-0 transition-colors">
                  <Upload className="w-4 h-4 text-white/40" />
                  <span className="text-[10px] text-white/40 mt-1">Tambah</span>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </label>
              </div>
              {fileErr && <p className="text-xs text-rose-400">{fileErr}</p>}
            </div>
          )}

          {/* Video URL */}
          {mediaType === 'video' && (
            <div>
              <label className={LBL}>URL Video (YouTube)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className={INP}
              />
              {fileErr && <p className="text-xs text-rose-400 mt-1">{fileErr}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#DCEEFA] text-[#243B3C] font-bold hover:bg-white transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSaving && (
                <span className="w-4 h-4 border-2 border-[#243B3C]/30 border-t-[#243B3C] rounded-full animate-spin" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Cinematography() {
  const { user, role, isAuthenticated } = useAuth();

  const [media,        setMedia]        = useState([]);
  const [pending,      setPending]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  // Form state
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type,     setType]     = useState('photo');
  const [photos,   setPhotos]   = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [fileError, setFileError] = useState('');

  // Action state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [isSaving,     setIsSaving]     = useState(false);

  const fileInputRef = useRef(null);

  // ── Subscriptions ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubMedia = subscribeToCinematography((approved) => {
      setMedia(approved);
      setLoading(false);
    });
    const unsubPending = subscribeToMyPending(
      user?.uid ?? null,
      'cinematography',
      (items) => setPending(items)
    );
    return () => { unsubMedia(); unsubPending(); };
  }, [user?.uid]);

  // ── Upload permission check ───────────────────────────────────────────────
  const myApprovedCount = media.filter((m) => m.studentId === user?.id).length;
  const myPendingCount  = pending.filter((p) => p.studentId === user?.id).length;
  const canUpload       = isAuthenticated && user?.role === 'student' && (myApprovedCount + myPendingCount) < 1;

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    setFileError('');
    const files  = Array.from(e.target.files);
    if (!files.length) return;
    let errFlag  = false;
    const valid  = [];
    files.forEach((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) errFlag = true;
      else valid.push(f);
    });
    if (errFlag) setFileError(`Beberapa file diabaikan karena melebihi ${MAX_FILE_MB}MB.`);
    valid.forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result]);
      r.readAsDataURL(f);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setTitle(''); setCategory(CATEGORIES[0]); setType('photo');
    setPhotos([]); setVideoUrl(''); setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    if (type === 'photo' && photos.length === 0) { setFileError('Pilih file foto terlebih dahulu.'); return; }
    if (type === 'video' && !videoUrl.trim())    { setFileError('Masukkan URL video YouTube.'); return; }

    try {
      await submitPending('cinematography', user.id, user.name, {
        studentId:   user.id,
        studentName: user.name,
        title,
        category,
        type,
        url:    type === 'photo' ? photos[0] : videoUrl.trim(),
        photos: type === 'photo' ? photos : [],
      });
      resetForm();
      setShowForm(false);
      setSubmitted(true);
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
      console.error('Gagal update karya sinematografi:', err);
      alert('Gagal menyimpan perubahan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#243B3C] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEEFA]/10 border border-[#DCEEFA]/20 flex items-center justify-center">
              <Clapperboard className="w-6 h-6 text-[#DCEEFA]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Galeri Sinematografi
              </h1>
              <p className="text-sm text-white/40 mt-0.5">{media.length} karya dipublikasikan</p>
            </div>
          </div>

          {isAuthenticated && user?.role === 'student' && (
            canUpload ? (
              <button
                onClick={() => setShowForm((v) => !v)}
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-[#DCEEFA] text-[#243B3C] font-bold text-sm hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20"
              >
                <Plus className="w-4 h-4" /> Upload Karya
              </button>
            ) : (
              <span className="text-xs text-white/40 bg-white/8 border border-white/10 px-3 py-2 rounded-xl self-start sm:self-auto">
                {myPendingCount > 0
                  ? '⏳ Karyamu sedang menunggu persetujuan'
                  : '✅ Sudah upload 1 karya (batas maks.)'}
              </span>
            )
          )}
        </div>

        {/* ── Submitted notice ────────────────────────────────────────────── */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-amber-900/30 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-300 text-sm"
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span>Karyamu berhasil dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
            <button onClick={() => setSubmitted(false)} className="ml-auto cursor-pointer hover:text-amber-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── Upload Form ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="bg-white/6 border border-white/10 rounded-3xl p-6 mb-10"
            >
              <h2 className="text-lg font-bold text-white mb-5">Upload Karya Baru</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className={LBL}>Judul Karya</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={INP}
                    placeholder="Nama karya kamu..."
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={LBL}>Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={INP}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1a2c2d] text-white">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Media type toggle */}
                <div>
                  <label className={LBL}>Jenis Media</label>
                  <div className="flex gap-2">
                    {[{ val: 'photo', label: '📷  Foto' }, { val: 'video', label: '🎬  Video (YouTube)' }].map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => { setType(val); setPhotos([]); setVideoUrl(''); setFileError(''); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                          type === val
                            ? 'bg-[#DCEEFA] text-[#243B3C] border-[#DCEEFA]'
                            : 'bg-white/8 text-white/55 border-white/15 hover:bg-white/15'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo upload */}
                {type === 'photo' && (
                  <div>
                    <label className={LBL}>
                      Upload Foto{' '}
                      <span className="normal-case font-normal tracking-normal text-white/30">
                        (maks. {MAX_FILE_MB}MB / foto)
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {photos.map((ph, i) => (
                        <div key={i} className="relative w-24 h-16 rounded-xl border border-white/15 overflow-hidden shrink-0 group">
                          <img src={ph} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center w-24 h-16 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 shrink-0 transition-colors">
                        <Upload className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] text-white/40 mt-1">Tambah</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {fileError && <p className="text-xs text-rose-400">{fileError}</p>}
                  </div>
                )}

                {/* Video URL */}
                {type === 'video' && (
                  <div>
                    <label className={LBL}>URL Video (YouTube)</label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className={INP}
                    />
                    {fileError && <p className="text-xs text-rose-400 mt-1">{fileError}</p>}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-medium hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#DCEEFA] text-[#243B3C] text-sm font-bold hover:bg-white cursor-pointer transition-colors shadow-lg shadow-black/20"
                  >
                    Kirim untuk Disetujui
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending strip ────────────────────────────────────────────────── */}
        {isAuthenticated && pending.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Menunggu Persetujuan</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {pending.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-52 bg-white/6 border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* 16:9 thumbnail */}
                  <div className="relative aspect-video w-full bg-white/5 overflow-hidden">
                    {p.data.type === 'photo' && p.data.photos?.[0] ? (
                      <img src={p.data.photos[0]} alt="" className="w-full h-full object-cover opacity-70" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] bg-amber-500/80 text-amber-900 font-bold px-2.5 py-1 rounded-full">
                        ⏳ Pending
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-white/80 truncate">{p.data.title}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{p.data.category || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Card Grid ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/8 rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-video w-full bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/10 rounded-lg w-3/4" />
                  <div className="h-3 bg-white/6 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Camera className="w-12 h-12 mx-auto mb-4 text-white/15" />
            <p className="text-white/30 font-medium">Belum ada karya yang disetujui.</p>
            <p className="text-white/20 text-sm mt-1">Karya yang disetujui admin akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {media.map((item) => {
                const canDelete  = role === 'admin' || user?.uid === item.userId;
                const canEdit    = canDelete;
                const isPhoto    = item.type === 'photo';
                const coverPhoto = isPhoto
                  ? (item.photos?.length > 0 ? item.photos[0] : item.url)
                  : null;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.93 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className="bg-[#DCEEFA] rounded-3xl overflow-hidden group border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.4)] cursor-default"
                  >
                    {/* 16:9 Media Cover */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      {isPhoto && coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-[#0f1a1b] to-[#243B3C] flex items-center justify-center relative overflow-hidden">
                          {/* Decorative scanlines */}
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-10"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                            }}
                          />
                          {/* Play ring */}
                          <motion.div
                            whileHover={{ scale: 1.12 }}
                            className="w-16 h-16 rounded-full bg-white/10 border border-white/25 flex items-center justify-center backdrop-blur-sm z-10 relative"
                          >
                            <Play className="w-7 h-7 text-white/80 ml-1 fill-white/80" />
                          </motion.div>
                          {/* Clickable overlay for video link */}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 z-20"
                              aria-label={`Tonton ${item.title}`}
                            />
                          )}
                        </div>
                      )}

                      {/* Dark gradient overlay at bottom for badge readability */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                      {/* Category badge — bottom left */}
                      {item.category && (
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${badgeClass(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                      )}

                      {/* Action buttons — top right, reveal on hover */}
                      {(canEdit || canDelete) && (
                        <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {canEdit && (
                            <button
                              onClick={() => setEditTarget(item)}
                              title="Edit karya"
                              className="p-2 rounded-xl bg-black/50 backdrop-blur-sm text-white/70 hover:text-[#DCEEFA] hover:bg-black/70 transition-all cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                              title="Hapus karya"
                              className="p-2 rounded-xl bg-black/50 backdrop-blur-sm text-white/70 hover:text-rose-300 hover:bg-rose-900/70 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Extra photo thumbnails strip (if multiple photos) */}
                      {isPhoto && item.photos && item.photos.length > 1 && (
                        <div className="absolute bottom-3 right-3 z-10 flex gap-1 overflow-x-auto scrollbar-hide max-w-[120px]">
                          {item.photos.slice(1, 4).map((ph, idx) => (
                            <img
                              key={idx}
                              src={ph}
                              alt=""
                              className="w-8 h-8 object-cover rounded-lg shrink-0 border border-white/40 shadow-md"
                            />
                          ))}
                          {item.photos.length > 4 && (
                            <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-white">+{item.photos.length - 4}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info panel */}
                    <div className="px-5 pt-4 pb-4">
                      <h3 className="text-[15px] font-bold text-[#101828] leading-snug mb-3">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between border-t border-[#243B3C]/10 pt-3">
                        <span className="text-xs font-semibold text-[#243B3C]">
                          {item.studentName}
                        </span>
                        <div className="flex items-center gap-1">
                          {isPhoto
                            ? <Camera className="w-3.5 h-3.5 text-[#243B3C]/40" />
                            : <Play  className="w-3.5 h-3.5 text-[#243B3C]/40" />}
                          <span className="text-[10px] text-[#243B3C]/40 font-medium">
                            {isPhoto ? 'Foto' : 'Video'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Dialog Portals ─────────────────────────────────────────────────── */}
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
