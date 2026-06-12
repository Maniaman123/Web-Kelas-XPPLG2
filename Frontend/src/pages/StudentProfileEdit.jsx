import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { getStudentByUserId } from '../utils/firestoreService';
import { getInitials } from '../data/students';
import ProfileForm from '../components/ProfileForm';

export default function StudentProfileEdit() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Guard: redirect jika bukan siswa
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch profil siswa dari Firestore berdasarkan Firebase UID
  useEffect(() => {
    if (!user?.uid) return;

    getStudentByUserId(user.uid)
      .then((profile) => {
        if (profile) {
          setStudentData(profile);
        }
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error('[StudentProfileEdit] Gagal memuat profil:', err);
        setLoadingProfile(false);
      });
  }, [user?.uid]);

  const handleSuccess = (updatedStudent) => {
    setStudentData(updatedStudent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // ── Loading states ───────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 animate-pulse">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
            <div className="w-16 h-16 rounded-2xl bg-black/10" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-black/10 rounded-lg" />
              <div className="h-4 w-24 bg-black/5 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-24 bg-black/5 rounded-xl" />
            <div className="h-10 bg-black/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="p-20 text-center text-outlined font-sans">
        Profil tidak ditemukan. Hubungi admin kelas.
      </div>
    );
  }

  const initials = studentData.initials || getInitials(studentData.name);
  const avatarClass = studentData.avatarColor || 'bg-teal-600';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5">

        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
          <div className={`w-16 h-16 rounded-2xl ${avatarClass} flex items-center justify-center text-white text-2xl font-bold shadow-sm overflow-hidden`}>
            {studentData.avatarUrl ? (
              <img src={studentData.avatarUrl} alt={studentData.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-inverted leading-tight">{studentData.name}</h1>
            <p className="text-outlined flex items-center gap-2 mt-1">
              {studentData.role && (
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${studentData.role.color}`}>
                  {studentData.role.label}
                </span>
              )}
              • Absen {studentData.absentNumber}
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl">
            ✓ Profil dan foto berhasil disimpan!
          </div>
        )}

        <ProfileForm 
          student={studentData} 
          onSuccess={handleSuccess} 
          showCancel={false} 
        />

      </div>
    </div>
  );
}
