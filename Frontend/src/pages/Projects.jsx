import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useAuth from '../context/useAuth';
import {
  subscribeToProjects,
  subscribeToMyPending,
  submitPending,
  deleteProject,
  updateProject,
  subscribeToCategories,
} from '../utils/firestoreService';
import { Rocket, Plus, ExternalLink, Clock, X, Upload, Trash2, AlertTriangle, Pencil } from 'lucide-react';

const MAX_FILE_MB = 2;

function getProjectBadge(project) {
  const text = `${project.title ?? ''} ${project.description ?? ''}`.toLowerCase();
  if (/web|html|css|react|javascript|js|website|next|frontend/.test(text)) return 'Web Dev';
  if (/iot|arduino|sensor|hardware|mikro|raspberry|embedded/.test(text)) return 'IoT';
  if (/game|unity|godot|pygame|gaming/.test(text)) return 'Game Dev';
  if (/mobile|android|ios|flutter|kotlin|swift/.test(text)) return 'Mobile';
  if (/ai|ml|machine learning|deep learning|neural|data science/.test(text)) return 'AI / ML';
  return 'Proyek';
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
            <h3 className="text-base font-bold text-white">Hapus Proyek?</h3>
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
function EditProjectDialog({ item, onSave, onCancel, isSaving, categories }) {
  const [title, setTitle]     = useState(item.title || '');
  const [desc, setDesc]       = useState(item.description || '');
  const [category, setCategory] = useState(item.category || (categories[0]?.name || ''));
  const [link, setLink]       = useState(item.link || '');
  const [photos, setPhotos]   = useState(item.photos || []);
  const [fileErr, setFileErr] = useState('');
  const fileRef               = useRef(null);

  const handleFiles = (e) => {
    setFileErr('');
    Array.from(e.target.files).forEach((f) => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) { setFileErr(`File diabaikan, ukurannya lebih dari ${MAX_FILE_MB}MB.`); return; }
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
          <h3 className="text-base font-bold text-white">Edit Proyek</h3>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ title, description: desc, category, link, photos }); }} className="space-y-4">
          <div>
            <label className={lbl}>Judul Proyek</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inp} required />
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
            <label className={lbl}>Link Demo / GitHub <span className="normal-case font-normal tracking-normal text-white/30">(Opsional)</span></label>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className={inp} />
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
export default function Projects() {
  const { user, role, isAuthenticated } = useAuth();

  const [projects, setProjects]         = useState([]);
  const [pending, setPending]           = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [title, setTitle]               = useState('');
  const [category, setCategory]         = useState('');
  const [description, setDescription]   = useState('');
  const [link, setLink]                 = useState('');
  const [photos, setPhotos]             = useState([]);
  const [fileError, setFileError]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [isSaving, setIsSaving]         = useState(false);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    const unsubProjects = subscribeToProjects((approved) => {
      setProjects(approved);
      setLoading(false);
    });
    const unsubPending = subscribeToMyPending(user?.uid ?? null, 'project', (items) => setPending(items));
    const unsubCategories = subscribeToCategories((allCats) => {
      const filtered = allCats.filter((c) => c.module === 'projects');
      setCategories(filtered);
    });
    return () => { unsubProjects(); unsubPending(); unsubCategories(); };
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
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    try {
      await submitPending('project', user.id, user.name, { studentId: user.id, studentName: user.name, title, description, category, link, photos });
      setTitle(''); setDescription(''); setCategory(categories[0]?.name || ''); setLink(''); setPhotos([]); setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowAddForm(false);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit pending project:', err);
      setFileError('Gagal mengirimkan proyek. Coba lagi.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Gagal menghapus proyek. Kamu mungkin tidak memiliki izin.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditSave = async (data) => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      await updateProject(editTarget.id, data);
      setEditTarget(null);
    } catch (err) {
      console.error('Gagal update proyek:', err);
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
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-inverted leading-tight">Proyek Pelajar</h1>
            <p className="text-sm text-outlined">{projects.length} proyek dipublikasikan</p>
          </div>
        </div>
        {isAuthenticated && user?.role === 'student' && (
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Proyek
          </button>
        )}
      </div>

      {/* Submitted notice */}
      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0 text-amber-500" />
          <span>Proyekmu dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
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
            <h2 className="text-lg font-bold text-inverted mb-4">Tambah Proyek Baru</h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">Judul Proyek</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm" required />
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
                <label className="block text-sm font-medium text-[#344054] mb-1">Deskripsi</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none bg-white text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Link Demo / GitHub <span className="font-normal text-outlined">(Opsional)</span>
                </label>
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Foto <span className="font-normal text-outlined">(maks. {MAX_FILE_MB}MB per foto)</span>
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

      {/* Pending — horizontal scroll strip */}
      {isAuthenticated && pending.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-outlined uppercase tracking-wider mb-3">Menunggu Persetujuan</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {pending.map((p) => (
              <div key={p.id} className="shrink-0 w-56 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                {p.data.photos && p.data.photos.length > 0 && (
                  <img src={p.data.photos[0]} alt="" className="w-full h-24 object-cover rounded-xl mb-3 border border-amber-100" />
                )}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-amber-900 leading-snug line-clamp-2">{p.data.title}</h4>
                  <span className="text-[9px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5">⏳</span>
                </div>
                <p className="text-xs text-amber-700 line-clamp-2">{p.data.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Bento Grid Section ══════════════════════════════════════════════ */}
      <div className="bg-primary rounded-3xl p-5 sm:p-7">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/8 rounded-3xl h-56 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/15 rounded-2xl">
            <Rocket className="w-10 h-10 mx-auto mb-3 text-white/20" />
            <p className="text-white/40 font-medium text-sm">Belum ada proyek yang disetujui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {projects.map((project) => {
                const canManage = role === 'admin' || user?.uid === project.userId;
                const badge     = project.category || getProjectBadge(project);
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.93 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.87, transition: { duration: 0.18 } }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="bg-secondary rounded-3xl p-5 flex flex-col group relative border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.22)] overflow-hidden cursor-default"
                  >
                    {/* Badge + action buttons */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/12 text-primary border border-primary/15 shrink-0">
                        {badge}
                      </span>
                      {canManage && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setEditTarget(project)} title="Edit proyek"
                            className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget({ id: project.id, title: project.title })} title="Hapus proyek"
                            className="p-1.5 rounded-lg text-primary/40 hover:text-rose-600 hover:bg-rose-100 transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Photo strip */}
                    {project.photos && project.photos.length > 0 && (
                      <div className="flex overflow-x-auto gap-2 mb-3 pb-1 -mx-1 px-1 scrollbar-hide">
                        {project.photos.map((ph, idx) => (
                          <img key={idx} src={ph} alt="Dokumentasi"
                            className="w-36 h-24 object-cover rounded-xl shrink-0 border border-primary/10" />
                        ))}
                      </div>
                    )}

                    <h3 className="text-[15px] font-bold text-inverted mb-1.5 leading-snug">{project.title}</h3>
                    <p className="text-sm text-[#475467] leading-relaxed flex-1 line-clamp-3">{project.description}</p>

                    <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">{project.studentName}</span>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-all">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
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
          <EditProjectDialog
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
