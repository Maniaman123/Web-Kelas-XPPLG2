import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, student }) {
  const [name, setName] = useState(student?.name || '');
  const [role, setRole] = useState(student?.role?.label || '');

  if (!student) return null;

  const handleSave = () => {
    // Prepared for Supabase/Firebase integration
    console.log('Save profile:', { id: student.id, name, role });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-inverted/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="h-2 bg-linear-to-r from-primary via-accent to-primary" />
            <div className="p-6 sm:p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-outlined hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl ${student.avatarColor} flex items-center justify-center text-white text-lg font-bold`}>
                  {student.initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-inverted">Edit Profil</h2>
                  <p className="text-sm text-outlined">Perbarui data siswa</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-inverted mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outlined" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-inverted mb-1.5">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option>Frontend Dev</option>
                    <option>Backend Dev</option>
                    <option>UI/UX Designer</option>
                    <option>Game Dev</option>
                    <option>IoT Specialist</option>
                    <option>Fullstack Dev</option>
                    <option>Cameraman</option>
                    <option>Mobile Dev</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-outlined font-medium text-sm hover:bg-black/5 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-light transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
