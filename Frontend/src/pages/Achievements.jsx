import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useAuth from '../context/useAuth';
import {
  subscribeToAchievements,
  subscribeToMyPending,
  submitPending,
  deleteAchievement,
  updateAchievement,
  subscribeToCategories,
} from '../utils/firestoreService';
import { Trophy, Plus, Clock, X, Upload, Trash2, AlertTriangle, Pencil } from 'lucide-react';

const MAX_FILE_MB = 2;

function getAchievementBadge(item) {
  const text = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
  if (/olimpiade|olim/.test(text)) return 'Olimpiade';
  if (/lomba|lkti|lks|kompetisi|contest/.test(text)) return 'Kompetisi';
  if (/seni|art|musik|tari|lukis|desain/.test(text)) return 'Seni';
  if (/olahraga|sport|futsal|basket|voli|renang|atletik/.test(text)) return 'Olahraga';
  if (/akademik|sains|matematika|fisika|kimia|biologi/.test(text)) return 'Akademik';
  return 'Prestasi';
}

// ── Delete Dialog — dark teal theme ──────────────────────────────────────────
function DeleteConfirmDialog({ itemTitle, onConfirm, onCancel, isDeleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="bg-primary-dark rounded-3xl shadow-2xl p-7 max-w-sm w-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-rose-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Hapus Prestasi?</h3>
            <p className="text-xs text-white/50 mt-0.5">Tindakan ini tidak bisa dibatalkan.</p>
          </div>
        </div>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Kamu akan menghapus{' '}
          <span className="font-semibold text-white">"{itemTitle}"</span> secara permanen.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2">
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

// ── Edit Dialog — dark teal theme ─────────────────────────────────────────────
function EditAchievementDialog({ item, onSave, onCancel, isSaving, categories }) {
  const [title, setTitle]     = useState(item.title || '');
  const [date, setDate]       = useState(item.date || '');
  const [desc, setDesc]       = useState(item.description || '');
  const [category, setCategory] = useState(item.category || (categories[0]?.name || ''));
  const [photos, setPhotos]   = useState(item.photos || []);
  const [fileErr, setFileErr] = useState('');
  const fileRef               = useRef(null);

  const handleFiles = (e) => {
    setFileErr('');
    Array.from(e.target.files).forEach((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) { setFileErr(`File diabaikan, lebih dari ${MAX_FILE_MB}MB.`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const inp = "w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:border-[#DCEEFA]/50 focus:bg-white/15 outline-none text-sm transition-colors";
  const lbl = "block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="bg-primary-dark rounded-3xl shadow-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-6">
          <Pencil className="w-4 h-4 text-secondary" />
          <h3 className="text-base font-bold text-white">Edit Prestasi</h3>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ title, date, description: desc, category, photos }); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nama Prestasi</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Bulan/Tahun</label>
              <input type="text" value={date} onChange={(e) => setDate(e.target.value)}
                placeholder="Agustus 2025" className={inp} required />
            </div>
          </div>
          <div>
            <label className={lbl}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-primary-dark text-white">{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Deskripsi</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className={`${inp} resize-none`} required />
          </div>
          <div>
            <label className={lbl}>Foto <span className="normal-case font-normal tracking-normal text-white/30">(maks. {MAX_FILE_MB}MB/foto)</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((ph, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group border border-white/20">
                  <img src={ph} alt="foto" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 shrink-0">
                <Upload className="w-4 h-4 text-white/40" />
                <span className="text-[10px] text-white/40 mt-1">Tambah</span>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              </label>
            </div>
            {fileErr && <p className="text-xs text-rose-400">{fileErr}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel} disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-primary font-bold hover:bg-white transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2">
              {isSaving && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Achievements() {
  const { user, role, isAuthenticated } = useAuth();

  const [achievements, setAchievements] = useState([]);
  const [pending, setPending]           = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [title, setTitle]               = useState('');
  const [date, setDate]                 = useState('');
  const [category, setCategory]         = useState('');
  const [description, setDescription]   = useState('');
  const [photos, setPhotos]             = useState([]);
  const [fileError, setFileError]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [isSaving, setIsSaving]         = useState(false);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    const unsubAchievements = subscribeToAchievements((approved) => {
      setAchievements(approved);
      setLoading(false);
    });
    const unsubPending = subscribeToMyPending(user?.uid ?? null, 'achievement', (items) => setPending(items));
    const unsubCategories = subscribeToCategories((allCats) => {
      const filtered = allCats.filter((c) => c.module === 'achievements');
      setCategories(filtered);
    });
    return () => { unsubAchievements(); unsubPending(); unsubCategories(); };
  }, [user?.uid]);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // ── File Handling ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    setFileError('');
    const files = Array.from(e.target.files);
    if (!files.length) return;
    let hasError = false;
    const valid = [];
    files.forEach((f) => { if (f.size > MAX_FILE_MB * 1024 * 1024) hasError = true; else valid.push(f); });
    if (hasError) setFileError(`Beberapa file diabaikan karena lebih dari ${MAX_FILE_MB}MB.`);
    valid.forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result]);
      r.readAsDataURL(f);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!title || !date || !description) return;
    try {
      await submitPending('achievement', user.id, user.name, { studentId: user.id, studentName: user.name, title, date, description, category, photos });
      setTitle(''); setDate(''); setCategory(categories[0]?.name || ''); setDescription(''); setPhotos([]); setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowAddForm(false);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit achievement:', err);
      setFileError('Gagal mengirimkan prestasi. Coba lagi.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAchievement(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete achievement:', err);
      alert('Gagal menghapus prestasi. Kamu mungkin tidak memiliki izin.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditSave = async (data) => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      await updateAchievement(editTarget.id, data);
      setEditTarget(null);
    } catch (err) {
      console.error('Gagal update prestasi:', err);
      alert('Gagal menyimpan perubahan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-inverted leading-tight">Prestasi Pelajar</h1>
            <p className="text-sm text-outlined">{achievements.length} prestasi dipublikasikan</p>
          </div>
        </div>
        {isAuthenticated && user?.role === 'student' && (
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Prestasi
          </button>
        )}
      </div>

      {/* Submitted notice */}
      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0 text-amber-500" />
          <span>Prestasimu dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
          <button onClick={() => setSubmitted(false)} className="ml-auto cursor-pointer hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="bg-primary/6 border border-primary/12 rounded-3xl p-6 mb-8"
          >
            <h2 className="text-lg font-bold text-inverted mb-4">Tambah Prestasi Baru</h2>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">Nama Prestasi / Lomba</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">Bulan/Tahun</label>
                  <input type="text" value={date} onChange={(e) => setDate(e.target.value)}
                    placeholder="Agustus 2025"
                    className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">Deskripsi Singkat</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none bg-white text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Foto <span className="font-normal text-outlined">(maks. {MAX_FILE_MB}MB per foto, Opsional)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-1">
                  {photos.map((ph, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl border border-black/10 overflow-hidden shrink-0 group">
                      <img src={ph} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:bg-black/5 shrink-0">
                    <Upload className="w-4 h-4 text-outlined" />
                    <span className="text-[10px] text-outlined mt-1">Tambah</span>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {fileError && <p className="text-xs text-red-500">{fileError}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-outlined text-sm font-medium hover:bg-black/5 cursor-pointer">
                  Batal
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark cursor-pointer">
                  Kirim untuk Disetujui
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending strip */}
      {isAuthenticated && pending.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-outlined uppercase tracking-wider mb-3">Menunggu Persetujuan</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {pending.map((p) => (
              <div key={p.id} className="shrink-0 w-64 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-amber-900 leading-snug line-clamp-2">{p.data.title}</h4>
                  <span className="text-[9px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5">⏳</span>
                </div>
                <p className="text-xs text-amber-600 mb-2">{p.data.date}</p>
                <p className="text-xs text-amber-700 line-clamp-2">{p.data.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Bento Grid Section ══════════════════════════════════════════════ */}
      <div className="bg-primary rounded-3xl p-5 sm:p-7">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/8 rounded-3xl h-48 animate-pulse" />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/15 rounded-2xl">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-white/20" />
            <p className="text-white/40 font-medium text-sm">Belum ada prestasi yang disetujui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {achievements.map((item) => {
                const canManage = role === 'admin' || user?.uid === item.userId;
                const badge     = item.category || getAchievementBadge(item);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.93 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.87, transition: { duration: 0.18 } }}
                    whileHover={{ y: -5, scale: 1.015 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="bg-secondary rounded-3xl p-5 flex flex-col group relative border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.22)] overflow-hidden cursor-default"
                  >
                    {/* Top row: icon + badge + date + actions */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-500/15 rounded-2xl flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/12 text-primary border border-primary/15">
                            {badge}
                          </span>
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 border border-amber-500/20">
                            {item.date}
                          </span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setEditTarget(item)} title="Edit prestasi"
                            className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget({ id: item.id, title: item.title })} title="Hapus prestasi"
                            className="p-1.5 rounded-lg text-primary/40 hover:text-rose-600 hover:bg-rose-100 transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-[15px] font-bold text-inverted mb-1.5 leading-snug">{item.title}</h3>
                    <p className="text-sm text-[#475467] leading-relaxed flex-1 line-clamp-2">{item.description}</p>

                    {/* Photo strip */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex overflow-x-auto gap-2 mt-3 pb-1 -mx-1 px-1 scrollbar-hide">
                        {item.photos.map((ph, idx) => (
                          <img key={idx} src={ph} alt="Dokumentasi"
                            className="w-32 h-20 object-cover rounded-xl shrink-0 border border-primary/10" />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-primary/10">
                      <span className="text-xs font-semibold text-primary">{item.studentName}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

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
          <EditAchievementDialog
            item={editTarget}
            onSave={handleEditSave}
            onCancel={() => !isSaving && setEditTarget(null)}
            isSaving={isSaving}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
