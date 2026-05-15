import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Save, ExternalLink } from 'lucide-react';
import { storage } from '../utils/storage';
import { getInitials, roles } from '../data/students';
import useAuth from '../context/useAuth';

// ── Theme ──────────────────────────────────────────────────────
const TEAL  = '#243B3C';
const AZURE = '#DCEEFA';

// ── Inline SVG brand icons ─────────────────────────────────────
const Instagram = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const GithubIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

// ── Small input/textarea helpers ───────────────────────────────
const Input = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${TEAL}80` }}>
      {label}
    </label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
      style={{
        background: `${TEAL}0d`,
        border: `1.5px solid ${TEAL}30`,
        color: TEAL,
      }}
      onFocus={e  => e.target.style.borderColor = `${TEAL}80`}
      onBlur={e   => e.target.style.borderColor = `${TEAL}30`}
    />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${TEAL}80` }}>
      {label}
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all"
      style={{
        background: `${TEAL}0d`,
        border: `1.5px solid ${TEAL}30`,
        color: TEAL,
      }}
      onFocus={e  => e.target.style.borderColor = `${TEAL}80`}
      onBlur={e   => e.target.style.borderColor = `${TEAL}30`}
    />
  </div>
);

// ── Main Modal ─────────────────────────────────────────────────
export default function StudentModal({ student, onClose, onSave, layoutId }) {
  const { user, isAuthenticated } = useAuth();

  // Only the owner (matched by id) can edit
  const canEdit = isAuthenticated && user?.id === student.id;

  const [editing, setEditing]   = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [form, setForm]         = useState({
    name:   student.name   || '',
    about:  student.about  || '',
    ig:     student.ig     || '',
    github: student.github || '',
    role:   student.role   || null,
  });

  // Reset when student changes
  useEffect(() => {
    setForm({
      name:   student.name   || '',
      about:  student.about  || '',
      ig:     student.ig     || '',
      github: student.github || '',
      role:   student.role   || null,
    });
    setEditing(false);
    setSaved(false);
  }, [student.id]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    const allStudents  = storage.getStudents();
    const updated      = allStudents.map(s =>
      s.id === student.id
        ? { ...s, name: form.name, about: form.about, ig: form.ig, github: form.github, role: form.role }
        : s
    );
    storage.saveStudents(updated);
    onSave({ ...student, ...form });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials    = student.initials || getInitials(student.name);
  const avatarClass = student.avatarColor || 'bg-teal-600';

  const igHref = form.ig
    ? (form.ig.startsWith('http') ? form.ig : `https://instagram.com/${form.ig}`)
    : null;
  const ghHref = form.github
    ? (form.github.startsWith('http') ? form.github : `https://github.com/${form.github}`)
    : null;

  return (
    <>
      {/* ── Backdrop (fade in/out, separate from layout animation) ── */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-490"
        style={{ background: 'rgba(10,20,20,0.70)' }}
        onClick={onClose}
      >
        <div className="absolute inset-0 backdrop-blur-xl" aria-hidden />
      </motion.div>

      {/* ── Centering shell (pointer-events:none so backdrop click works) ── */}
      <div className="fixed inset-0 z-491 flex items-center justify-center p-4 pointer-events-none">
        {/* Shared layout card — same layoutId as the grid card */}
        <motion.div
          layoutId={layoutId}
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl pointer-events-auto"
          style={{ background: AZURE }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top teal accent strip */}
          <div className="h-1.5 w-full" style={{ background: TEAL }} />

          <div className="p-6 sm:p-8 flex flex-col gap-5" style={{ color: TEAL }}>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ background: `${TEAL}15` }}
            >
              <X className="w-4 h-4" style={{ color: TEAL }} />
            </button>

            {/* ── Header ── */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${avatarClass} flex items-center justify-center text-white text-xl font-extrabold shrink-0`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <Input label="Nama" value={form.name}
                    onChange={v => setForm(f => ({ ...f, name: v }))}
                    placeholder="Nama lengkap" />
                ) : (
                  <h2 className="text-xl font-extrabold leading-tight" style={{ color: TEAL }}>
                    {form.name}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {student.absentNumber && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: `${TEAL}15`, color: TEAL }}>
                      #{student.absentNumber}
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: `${TEAL}15`, color: TEAL }}>
                    {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Role ── */}
            {editing ? (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${TEAL}80` }}>
                  Role / Tech Stack
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(r => (
                    <button key={r.label}
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${r.color}`}
                      style={{ outline: form.role?.label === r.label ? `2px solid ${TEAL}` : 'none', outlineOffset: '2px' }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              form.role && (
                <span className={`self-start px-3 py-1.5 rounded-xl text-xs font-semibold ${form.role.color}`}>
                  {form.role.label}
                </span>
              )
            )}

            {/* ── About — no line-clamp, full text, max 200 words ── */}
            {editing ? (
              <Textarea label="About Me" value={form.about}
                onChange={v => setForm(f => ({ ...f, about: v }))}
                placeholder="Ceritakan tentang dirimu..." />
            ) : (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: `${TEAL}80` }}>About Me</p>
                <p className="text-sm leading-relaxed"
                  style={{ color: `${TEAL}cc`, wordBreak: 'break-word' }}>
                  {form.about
                    ? form.about.split(' ').slice(0, 200).join(' ')
                    : <span style={{ color: `${TEAL}50` }}>Belum ada deskripsi.</span>}
                </p>
              </div>
            )}

            {/* ── Social links ── */}
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Instagram" value={form.ig}
                  onChange={v => setForm(f => ({ ...f, ig: v }))} placeholder="username" />
                <Input label="GitHub" value={form.github}
                  onChange={v => setForm(f => ({ ...f, github: v }))} placeholder="username" />
              </div>
            ) : (
              (igHref || ghHref) && (
                <div className="flex gap-2">
                  {igHref && (
                    <a href={igHref} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ background: `${TEAL}15`, color: TEAL }}>
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )}
                  {ghHref && (
                    <a href={ghHref} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ background: `${TEAL}15`, color: TEAL }}>
                      <GithubIcon className="w-3.5 h-3.5" />
                      GitHub
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )}
                </div>
              )
            )}

            {/* ── Action Buttons ── */}
            {canEdit && (
              <div className="flex gap-2 pt-1">
                {editing ? (
                  <>
                    <button onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                      style={{ background: TEAL, color: AZURE }}>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => { setEditing(false); setForm({ name: student.name, about: student.about, ig: student.ig, github: student.github, role: student.role }); }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-70 transition-all"
                      style={{ background: `${TEAL}15`, color: TEAL }}>
                      Batal
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: TEAL, color: AZURE }}>
                    <Edit3 className="w-4 h-4" />
                    Edit Profil
                  </button>
                )}
              </div>
            )}

            {/* Saved feedback */}
            <AnimatePresence>
              {saved && (
                <motion.p key="saved"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-center" style={{ color: '#059669' }}>
                  ✓ Profil berhasil disimpan!
                </motion.p>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </>
  );
}
