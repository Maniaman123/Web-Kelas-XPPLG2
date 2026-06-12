// src/components/ProfileForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable Profile Editor Component — X PPLG 2
//
// Form terpadu untuk mengubah data profil siswa (Nama, Tentang Saya, Instagram,
// GitHub, Portfolio, Role) dan mengunggah foto profil ke Firebase Storage.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Globe, Save, Upload, X, Trash2, Camera } from 'lucide-react';
import { storage } from '../utils/firebase';
import { updateStudentProfile } from '../utils/firestoreService';
import { roles } from '../data/students';

const TEAL  = '#243B3C';

export default function ProfileForm({ student, onSuccess, onCancel, showCancel = true }) {
  const [name, setName]           = useState(student?.name || '');
  const [about, setAbout]         = useState(student?.about || '');
  const [ig, setIg]               = useState(student?.ig || '');
  const [github, setGithub]       = useState(student?.github || '');
  const [portfolio, setPortfolio] = useState(student?.portfolio || '');
  const [role, setRole]           = useState(student?.role || null);
  const [avatarUrl, setAvatarUrl] = useState(student?.avatarUrl || '');

  // Upload states
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(student?.avatarUrl || '');
  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto profil maksimal adalah 2MB.');
      return;
    }

    setError('');
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setPreviewUrl('');
    setAvatarUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Upload ke Firebase Storage jika ada file baru
      if (imageFile) {
        // Gunakan nama file unik dengan timestamp agar cache browser ter-refresh
        const fileExtension = imageFile.name.split('.').pop();
        const storageRef = ref(storage, `avatars/${student.id}/profile_${Date.now()}.${fileExtension}`);
        await uploadBytes(storageRef, imageFile);
        finalAvatarUrl = await getDownloadURL(storageRef);
      }

      // 2. Simpan perubahan ke Firestore
      const updatedFields = {
        name: name.trim(),
        about: about.trim(),
        ig: ig.trim(),
        github: github.trim(),
        portfolio: portfolio.trim(),
        role,
        avatarUrl: finalAvatarUrl,
      };

      await updateStudentProfile(student.id, updatedFields);

      if (onSuccess) {
        onSuccess({ ...student, ...updatedFields });
      }
    } catch (err) {
      console.error('[ProfileForm] Gagal menyimpan profil:', err);
      setError('Terjadi kesalahan saat menyimpan profil. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans">
      
      {/* ── Avatar Upload Section ── */}
      <div className="flex flex-col items-center sm:flex-row gap-4 p-4 rounded-2xl bg-black/5 border border-black/5">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-dashed border-black/20 flex items-center justify-center shrink-0 shadow-inner group">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white text-2xl font-extrabold ${student?.avatarColor || 'bg-teal-600'}`}>
              {student?.initials || '??'}
            </div>
          )}
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <Camera className="w-6 h-6 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <p className="text-sm font-bold text-inverted">Foto Profil</p>
          <p className="text-xs text-outlined leading-relaxed">
            Format PNG, JPG, atau WEBP. Maksimal ukuran file 2MB.
          </p>
          <div className="flex justify-center sm:justify-start gap-2">
            <label className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-sm">
              <Upload className="w-3.5 h-3.5" /> Pilih Foto
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
          {error}
        </p>
      )}

      {/* ── Nama Lengkap ── */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outlined">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap kamu"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all border border-black/10 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 bg-white"
          required
        />
      </div>

      {/* ── Role Selector ── */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outlined mb-1">
          Role / Tech Stack
        </label>
        <div className="flex flex-wrap gap-1.5">
          {roles.map((r) => {
            const isSelected = role?.label === r.label;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${r.color}`}
                style={{
                  outline: isSelected ? `2px solid ${TEAL}` : 'none',
                  outlineOffset: isSelected ? '2.5px' : '0px',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tentang Saya ── */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outlined">
          Tentang Saya
        </label>
        <textarea
          rows={3}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Tulis bio singkat, skill, atau hobi kamu di sini..."
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all border border-black/10 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 bg-white"
        />
      </div>

      {/* ── Sosial Media ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-outlined">
            Instagram
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-slate-50 text-outlined text-xs">@</span>
            <input
              type="text"
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              placeholder="username"
              className="flex-1 px-3 py-2 rounded-r-xl border border-black/10 focus:border-primary outline-none text-sm bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-outlined">
            GitHub
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-slate-50 text-outlined text-xs">@</span>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="username"
              className="flex-1 px-3 py-2 rounded-r-xl border border-black/10 focus:border-primary outline-none text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Link Portfolio ── */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outlined">
          Link Portfolio (Opsional)
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outlined" />
          <input
            type="url"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="https://websitekamu.com"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none text-sm bg-white"
          />
        </div>
      </div>

      {/* ── Form Actions ── */}
      <div className="pt-4 border-t border-black/5 flex gap-2 justify-end">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-outlined hover:bg-black/5 transition-all disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

    </form>
  );
}
