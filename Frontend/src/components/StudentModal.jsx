import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, ExternalLink, Globe } from 'lucide-react';
import { getInitials } from '../data/students';
import useAuth from '../context/useAuth';
import ProfileForm from './ProfileForm';

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

// ── Main Modal ─────────────────────────────────────────────────
export default function StudentModal({ student, onClose, onSave, layoutId }) {
  const { user, isAuthenticated } = useAuth();

  // ── Keamanan Self-Edit: hanya pemilik yang bisa edit ────────────────────
  const canEdit = isAuthenticated && user?.id === student.userId;

  const prevStudentIdRef = useRef(student.id);
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Reset editing state whenever the displayed student changes.
  // We use a ref-guard so the setState calls only fire when the id
  // actually differs from the previously-rendered value, avoiding
  // synchronous setState-inside-effect cascades flagged by the linter.
  if (prevStudentIdRef.current !== student.id) {
    prevStudentIdRef.current = student.id;
    // Calling setState during render (before paint) is the React-approved
    // alternative to a synchronous effect setState — React will re-render
    // immediately without committing the first pass.
    setEditing(false);
    setSaved(false);
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFormSuccess = (updatedStudent) => {
    if (onSave) {
      onSave(updatedStudent); // optimistic UI update
    }
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials    = student.initials || getInitials(student.name);
  const avatarClass = student.avatarColor || 'bg-teal-600';

  const igHref = student.ig
    ? (student.ig.startsWith('http') ? student.ig : `https://instagram.com/${student.ig}`)
    : null;
  const ghHref = student.github
    ? (student.github.startsWith('http') ? student.github : `https://github.com/${student.github}`)
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

          <div className="p-6 sm:p-8 flex flex-col gap-5 max-h-[90vh] overflow-y-auto" style={{ color: TEAL }}>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70 cursor-pointer"
              style={{ background: `${TEAL}15` }}
            >
              <X className="w-4 h-4" style={{ color: TEAL }} />
            </button>

            {editing ? (
              <div className="pt-2">
                <h2 className="text-lg font-extrabold mb-4" style={{ color: TEAL }}>
                  Edit Profil Saya
                </h2>
                <ProfileForm
                  student={student}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setEditing(false)}
                  showCancel={true}
                />
              </div>
            ) : (
              <>
                {/* ── Header ── */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${avatarClass} flex items-center justify-center text-white text-xl font-extrabold shrink-0 overflow-hidden shadow-sm`}>
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-extrabold leading-tight" style={{ color: TEAL }}>
                      {student.name}
                    </h2>
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
                {student.role && (
                  <span className={`self-start px-3 py-1.5 rounded-xl text-xs font-semibold ${student.role.color}`}>
                    {student.role.label}
                  </span>
                )}

                {/* ── About ── */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                    style={{ color: `${TEAL}80` }}>About Me</p>
                  <p className="text-sm leading-relaxed"
                    style={{ color: `${TEAL}cc`, wordBreak: 'break-word' }}>
                    {student.about
                      ? student.about.split(' ').slice(0, 200).join(' ')
                      : <span style={{ color: `${TEAL}50` }}>Belum ada deskripsi.</span>}
                  </p>
                </div>

                {/* ── Social Links ── */}
                {(igHref || ghHref || student.portfolio) && (
                  <div className="flex flex-wrap gap-2">
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
                    {student.portfolio && (
                      <a href={student.portfolio} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity"
                        style={{ background: `${TEAL}15`, color: TEAL }}>
                        <Globe className="w-3.5 h-3.5" />
                        Portfolio
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )}
                  </div>
                )}

                {/* ── Action Buttons ── */}
                {canEdit && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      style={{ background: TEAL, color: AZURE }}>
                      <Edit3 className="w-4 h-4" />
                      Edit Profil
                    </button>
                  </div>
                )}
              </>
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
