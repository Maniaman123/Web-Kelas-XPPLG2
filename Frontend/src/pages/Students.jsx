import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, User, Code2, UserX, SearchX } from 'lucide-react';
import { gsap } from 'gsap';
import { subscribeToStudents } from '../utils/firestoreService';
import { getInitials } from '../data/students';
import StudentModal from '../components/StudentModal';

// ─────────────────────────────────────────────
// THEME TOKENS
// ─────────────────────────────────────────────
const TEAL  = '#243B3C';
const AZURE = '#DCEEFA';
const GLOW  = '220, 238, 250';

// ─────────────────────────────────────────────
// INLINE SVG BRAND ICONS
// ─────────────────────────────────────────────
const Instagram = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

// ─────────────────────────────────────────────
// MAGIC BENTO TILE — GSAP tilt + Framer layoutId
// ─────────────────────────────────────────────
function MagicTile({ children, onClick, layoutId }) {
  // gsapRef → plain div that GSAP tilts (no Framer conflict)
  const gsapRef = useRef(null);
  const magRef  = useRef(null);

  useEffect(() => {
    const el = gsapRef.current;
    if (!el) return;
    el.style.setProperty('--gx', '50%');
    el.style.setProperty('--gy', '50%');
    el.style.setProperty('--gi', '0');

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty('--gx', `${(x / r.width)  * 100}%`);
      el.style.setProperty('--gy', `${(y / r.height) * 100}%`);
      el.style.setProperty('--gi', '1');
      const cx = r.width / 2, cy = r.height / 2;
      gsap.to(el, { rotateX: ((y - cy) / cy) * -6, rotateY: ((x - cx) / cx) * 6,
        duration: 0.15, ease: 'power2.out', transformPerspective: 900 });
      magRef.current = gsap.to(el, { x: (x - cx) * 0.04, y: (y - cy) * 0.04,
        duration: 0.3, ease: 'power2.out' });
    };
    const onLeave = () => {
      el.style.setProperty('--gi', '0');
      magRef.current?.kill();
      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    };
    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    // Plain div: receives GSAP 3D tilt — no Framer transform conflict
    <div ref={gsapRef} className="cursor-pointer" onClick={onClick}>
      {/* motion.div: Framer layout card — NO initial/animate when using layoutId */}
      <motion.div
        layoutId={layoutId}
        layout
        className="relative overflow-hidden rounded-2xl"
        style={{ background: AZURE }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Cursor glow — reads CSS vars from parent gsapRef */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          pointerEvents: 'none', zIndex: 0,
          opacity: 'var(--gi, 0)', transition: 'opacity 0.3s ease',
          background: `radial-gradient(220px circle at var(--gx,50%) var(--gy,50%),
            rgba(${GLOW},0.35) 0%, rgba(${GLOW},0.10) 50%, transparent 75%)`,
        }} />
        {/* Border glow */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          pointerEvents: 'none', zIndex: 0,
          opacity: 'var(--gi, 0)', transition: 'opacity 0.3s ease',
          padding: '1.5px',
          background: `radial-gradient(200px circle at var(--gx,50%) var(--gy,50%),
            rgba(255,255,255,0.9), transparent 70%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }} />
        <div className="relative z-1">{children}</div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DEVELOPER CARD — uses real storage schema
// ─────────────────────────────────────────────
function DevCard({ student }) {
  const initials = student.initials || getInitials(student.name);
  // avatarColor from storage is a Tailwind class (e.g. "bg-blue-500")
  // We render it as a className on the avatar div
  const avatarClass = student.avatarColor || 'bg-teal-600';

  return (
    <div className="p-4 flex flex-col h-full min-h-[200px]" style={{ color: TEAL }}>
      {/* Absent number badge */}
      {student.absentNumber && (
        <div
          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
          style={{ background: `${TEAL}15`, color: TEAL }}
        >
          {student.absentNumber}
        </div>
      )}

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3 pr-8">
        <div className={`w-11 h-11 rounded-xl ${avatarClass} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight truncate" style={{ color: TEAL }}>
            {student.name}
          </p>
          {student.role && (
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-semibold ${student.role.color}`}>
              {student.role.label}
            </span>
          )}
        </div>
      </div>

      {/* About */}
      {student.about && (
        <p
          className="text-xs leading-relaxed flex-1 overflow-hidden"
          style={{
            color: `${TEAL}cc`,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {student.about}
        </p>
      )}

      {/* Footer row */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${TEAL}18`, color: TEAL }}
        >
          {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
        </span>
        <div className="flex gap-1.5">
          {student.ig && (
            <a
              href={student.ig.startsWith('http') ? student.ig : `https://instagram.com/${student.ig}`}
              target="_blank" rel="noreferrer"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ background: `${TEAL}15` }}
              onClick={e => e.stopPropagation()}
            >
              <Instagram className="w-3.5 h-3.5" style={{ color: TEAL }} />
            </a>
          )}
          {student.github && (
            <a
              href={student.github.startsWith('http') ? student.github : `https://github.com/${student.github}`}
              target="_blank" rel="noreferrer"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ background: `${TEAL}15` }}
              onClick={e => e.stopPropagation()}
            >
              <GithubIcon className="w-3.5 h-3.5" style={{ color: TEAL }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GLOBAL SPOTLIGHT (covers the whole grid)
// ─────────────────────────────────────────────
function GridSpotlight({ gridRef }) {
  useEffect(() => {
    const spot = document.createElement('div');
    spot.style.cssText = `
      position:fixed;width:700px;height:700px;border-radius:50%;
      pointer-events:none;z-index:300;opacity:0;
      transform:translate(-50%,-50%);
      background:radial-gradient(circle,
        rgba(${GLOW},0.18) 0%,
        rgba(${GLOW},0.08) 25%,
        rgba(${GLOW},0.02) 55%,
        transparent 70%);
    `;
    document.body.appendChild(spot);

    const onMove = (e) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right
                  && e.clientY >= rect.top  && e.clientY <= rect.bottom;
      gsap.to(spot, { left: e.clientX, top: e.clientY, duration: 0.08, ease: 'power2.out' });
      gsap.to(spot, { opacity: inside ? 0.9 : 0, duration: inside ? 0.2 : 0.5, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', onMove);
    return () => {
      document.removeEventListener('mousemove', onMove);
      spot.parentNode?.removeChild(spot);
    };
  }, [gridRef]);

  return null;
}

// ─────────────────────────────────────────────
// STAT BADGE
// ─────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
      style={{
        background: 'rgba(220,238,250,0.12)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(220,238,250,0.2)',
      }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: AZURE }} />
      <div>
        <p className="text-lg font-extrabold leading-none" style={{ color: AZURE }}>{value}</p>
        <p className="text-[10px] font-medium leading-tight" style={{ color: `${AZURE}99` }}>{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Students() {
  const [query,           setQuery]           = useState('');
  const [genderFilter,    setGenderFilter]    = useState('all');
  const [students,        setStudents]        = useState([]);
  const [loadingData,     setLoadingData]     = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const gridRef = useRef(null);

  // Real-time Firestore listener — auto-updates grid when admin adds/removes students
  useEffect(() => {
    const unsubscribe = subscribeToStudents((data) => {
      setStudents(data);
      setLoadingData(false);
    });
    return unsubscribe; // cleanup listener on unmount
  }, []);

  const boys  = students.filter(s => s.gender === 'L').length;
  const girls = students.filter(s => s.gender === 'P').length;

  const filtered = students.filter(s => {
    const q = query.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q)
      || String(s.absentNumber) === q;
    const matchG = genderFilter === 'all' || s.gender === genderFilter;
    return matchQ && matchG;
  });

  return (
    <>
    <div className="min-h-screen" style={{ background: TEAL }}>
      <GridSpotlight gridRef={gridRef} />

      {/* ── Hero Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(220,238,250,0.15)', color: AZURE, border: `1px solid rgba(220,238,250,0.25)` }}
          >
            <Code2 className="w-3.5 h-3.5" />
            SMK Negeri 1 Ciomas · X PPLG 2
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3"
            style={{ color: AZURE }}
          >
            The Students of X PPLG 2
          </h1>
          <p className="text-sm sm:text-base mb-8" style={{ color: `${AZURE}99` }}>
            A collection of {students.length} passionate software and game developers.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3">
            <StatBadge icon={Users} label="Total Students" value={students.length} />
            <StatBadge icon={User}  label="Boys"           value={boys}  />
            <StatBadge icon={User}  label="Girls"          value={girls} />
          </div>
        </motion.div>

        {/* ── Sticky Control Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="sticky top-20 z-40 mb-8"
        >
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-2xl"
            style={{
              background: 'rgba(36,59,60,0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(220,238,250,0.18)',
            }}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: `${AZURE}80` }}
              />
              <input
                type="text"
                placeholder="Search by name or absent number..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(220,238,250,0.10)',
                  border: '1px solid rgba(220,238,250,0.20)',
                  color: AZURE,
                }}
                onFocus={e  => e.target.style.borderColor = `${AZURE}60`}
                onBlur={e   => e.target.style.borderColor = 'rgba(220,238,250,0.20)'}
              />
            </div>

            {/* Gender filter */}
            <div
              className="flex p-1 rounded-xl gap-1"
              style={{ background: 'rgba(220,238,250,0.08)' }}
            >
              {[['all','Semua'],['L','Boys'],['P','Girls']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setGenderFilter(val)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  style={genderFilter === val
                    ? { background: AZURE, color: TEAL }
                    : { color: `${AZURE}80` }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Result count */}
            <div
              className="hidden sm:flex items-center px-3 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: 'rgba(220,238,250,0.08)', color: `${AZURE}80` }}
            >
              {filtered.length} / {students.length}
            </div>
          </div>
        </motion.div>

        {/* ── Developer Grid ── */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {/* Loading skeleton — tampil saat data Firestore belum datang */}
            {loadingData ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="rounded-2xl animate-pulse"
                  style={{ background: 'rgba(220,238,250,0.10)', minHeight: 200 }}
                />
              ))
            ) : filtered.length > 0 ? (
              filtered.map((student, i) => (
                <MagicTile
                  key={student.id}
                  delay={Math.min(i * 0.03, 0.4)}
                  onClick={() => setSelectedStudent(student)}
                  layoutId={`card-${student.id}`}
                >
                  <DevCard student={student} />
                </MagicTile>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{ opacity: 0, y: -8   }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="col-span-full py-24 flex flex-col items-center justify-center text-center gap-4"
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: 'rgba(220,238,250,0.10)' }}
                >
                  {query
                    ? <SearchX className="w-8 h-8" style={{ color: `${AZURE}70` }} />
                    : <UserX   className="w-8 h-8" style={{ color: `${AZURE}70` }} />
                  }
                </div>

                {/* Headline — logika pesan kosong DIPERTAHANKAN IDENTIK */}
                <p className="text-lg font-bold" style={{ color: AZURE }}>
                  {genderFilter === 'P' && !query && 'Tidak ada siswi ditemukan'}
                  {genderFilter === 'L' && !query && 'Tidak ada siswa laki-laki ditemukan'}
                  {query && 'Pencarian tidak ditemukan'}
                  {genderFilter === 'all' && !query && 'Belum ada pelajar'}
                </p>

                {/* Sub-text */}
                <p className="text-sm max-w-xs" style={{ color: `${AZURE}60` }}>
                  {query
                    ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`
                    : genderFilter === 'P'
                      ? 'Data siswi belum tersedia atau belum ditambahkan oleh admin.'
                      : genderFilter === 'L'
                        ? 'Data siswa laki-laki belum tersedia atau belum ditambahkan oleh admin.'
                        : 'Data siswa belum ditambahkan.'}
                </p>

                {/* Reset hint */}
                {(query || genderFilter !== 'all') && (
                  <button
                    onClick={() => { setQuery(''); setGenderFilter('all'); }}
                    className="mt-2 text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
                    style={{ background: 'rgba(220,238,250,0.15)', color: AZURE, border: '1px solid rgba(220,238,250,0.2)' }}
                  >
                    Tampilkan semua pelajar →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>

    {/* ── Student Modal ── */}
    <AnimatePresence>
      {selectedStudent && (
        <StudentModal
          key={selectedStudent.id}
          student={selectedStudent}
          layoutId={`card-${selectedStudent.id}`}
          onClose={() => setSelectedStudent(null)}
          onSave={(updated) => {
            setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
            setSelectedStudent(updated);
          }}
        />
      )}
    </AnimatePresence>
    </>
  );
}
