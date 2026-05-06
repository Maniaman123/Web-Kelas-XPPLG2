import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { User, Globe, Save } from 'lucide-react';

// Brand icons removed from lucide-react — using inline SVGs
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

export default function StudentProfileEdit() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const initialProfile = useMemo(() => {
    if (!isAuthenticated || user?.role !== 'student') return null;
    const students = storage.getStudents();
    return students.find(s => s.userId === user.id) || null;
  }, [isAuthenticated, user]);
  
  const studentData = initialProfile;
  
  // Form State
  const [about, setAbout] = useState(initialProfile?.about || '');
  const [ig, setIg] = useState(initialProfile?.ig || '');
  const [github, setGithub] = useState(initialProfile?.github || '');
  const [portfolio, setPortfolio] = useState(initialProfile?.portfolio || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!studentData) return;

    const students = storage.getStudents();
    const updatedStudents = students.map(s => {
      if (s.id === studentData.id) {
        return { ...s, about, ig, github, portfolio };
      }
      return s;
    });

    storage.saveStudents(updatedStudents);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!studentData) return <div className="p-20 text-center">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5">
        
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
          <div className={`w-16 h-16 rounded-2xl ${studentData.avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
            {studentData.initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-inverted">{studentData.name}</h1>
            <p className="text-outlined flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${studentData.role.color}`}>
                {studentData.role.label}
              </span>
              • Absen {studentData.absentNumber}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-inverted mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-outlined" /> Tentang Saya
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Ceritakan sedikit tentang dirimu, skill, atau minatmu..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-inverted mb-2 items-center gap-2">
                <Instagram className="w-4 h-4 text-outlined" /> Username Instagram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-black/5 text-outlined text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={ig}
                  onChange={(e) => setIg(e.target.value)}
                  placeholder="johndoe"
                  className="flex-1 px-4 py-2 rounded-r-xl border border-black/10 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-inverted mb-2 items-center gap-2">
                <GithubIcon className="w-4 h-4 text-outlined" /> Username GitHub
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-black/5 text-outlined text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="johndoe"
                  className="flex-1 px-4 py-2 rounded-r-xl border border-black/10 focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-inverted mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-outlined" /> Link Portfolio (Opsional)
            </label>
            <input
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://mywebsite.com"
              className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
            />
          </div>

          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
            <p className="text-sm text-emerald-600 font-medium">
              {isSaved ? 'Perubahan berhasil disimpan!' : ''}
            </p>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
