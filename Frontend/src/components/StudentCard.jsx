import { motion } from 'framer-motion';
import { Edit3, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Instagram = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function StudentCard({ student, currentUser }) {
  // Check if the current logged-in user is viewing their OWN card
  const isMyProfile = currentUser?.role === 'student' && currentUser?.id === student.userId;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="bg-secondary rounded-2xl p-4 border border-secondary-dark/30 group relative overflow-hidden flex flex-col h-full"
    >
      {/* Absent number badge */}
      {student.absentNumber && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary">{student.absentNumber}</span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-11 h-11 rounded-xl ${student.avatarColor || 'bg-slate-400'} flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 overflow-hidden`}
        >
          {student.avatarUrl ? (
            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            student.initials
          )}
        </div>
        <div className="min-w-0 pr-6">
          <p className="text-sm font-bold text-primary truncate">{student.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${student.role?.color || 'bg-slate-100 text-slate-700'}`}>
              {student.role?.label || 'Pelajar'}
            </span>
            {student.gender && (
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-outlined border border-black/5">
                {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* About snippet */}
      {student.about ? (
        <p className="text-xs text-outlined leading-relaxed mb-3 line-clamp-2 flex-1">
          {student.about}
        </p>
      ) : (
        <div className="flex-1" /> // Push bottom row down if no about text
      )}

      {/* Bottom row: socials + edit */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
        <div className="flex items-center gap-1.5">
          {student.ig && (
            <a
              href={`https://instagram.com/${student.ig}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-outlined hover:text-pink-500 hover:bg-pink-50 transition-all"
              aria-label={`Instagram ${student.name}`}
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          )}
          {student.github && (
            <a
              href={`https://github.com/${student.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-outlined hover:text-inverted hover:bg-black/5 transition-all"
              aria-label={`GitHub ${student.name}`}
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {student.portfolio && (
            <a
              href={student.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-all"
            >
              <Globe className="w-3 h-3" />
              Portfolio
            </a>
          )}
          {!student.ig && !student.github && !student.portfolio && (
            <span className="text-[10px] text-outlined/50 italic px-1">Belum ada sosial media</span>
          )}
        </div>

        {/* Edit button (only if it's MY profile) */}
        {isMyProfile && (
          <Link
            to="/edit-profile"
            className="p-1.5 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer flex items-center gap-1"
            title="Edit Profil Saya"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Edit</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
