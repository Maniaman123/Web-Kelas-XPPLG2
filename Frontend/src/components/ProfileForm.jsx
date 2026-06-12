// src/components/ProfileForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable Profile Editor Component — X PPLG 2
//
// Menggunakan Client-Side Canvas Compression untuk mengubah foto profil
// menjadi Base64 string ringkas (<50KB) dan menyimpannya langsung ke Firestore.
// Tidak membutuhkan Firebase Storage — 100% Spark Plan compatible.
//
// Developer Credit: Reyhan Septianto Ramadhan
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { Globe, Save, Upload, Trash2, Camera } from 'lucide-react';
import { updateStudentProfile } from '../utils/firestoreService';
import { roles } from '../data/students';

const TEAL = '#243B3C';
const MAX_DIMENSION = 150; // px — batas maksimal lebar/tinggi avatar
const JPEG_QUALITY  = 0.7; // 70% — cukup tajam, ukuran sangat kecil

// ── Client-Side Canvas Compression ───────────────────────────────────────────
// Menerima File gambar, mengubah ukurannya ke max 150×150 px, lalu
// mengembalikan Data URL (Base64 JPEG) yang aman untuk disimpan ke Firestore.
function compressImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Hitung dimensi proporsional tanpa melebihi MAX_DIMENSION
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width  = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width  = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        // Gambar di atas Canvas lalu export sebagai JPEG
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Gagal memuat gambar.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileForm Component
// Props:
//   student     — data siswa dari Firestore (diperlukan: student.id)
//   onSuccess   — callback(updatedStudentData) setelah berhasil disimpan
//   onCancel    — callback saat tombol Batal ditekan
//   showCancel  — tampilkan tombol Batal atau tidak (default: true)
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileForm({ student, onSuccess, onCancel, showCancel = true }) {
  const [name, setName]           = useState(student?.name || '');
  const [about, setAbout]         = useState(student?.about || '');
  const [ig, setIg]               = useState(student?.ig || '');
  const [github, setGithub]       = useState(student?.github || '');
  const [portfolio, setPortfolio] = useState(student?.portfolio || '');
  const [role, setRole]           = useState(student?.role || null);

  // previewUrl: Data URL tampil langsung di UI
  // pendingBase64: string yang akan disimpan ke Firestore jika ada file baru
  const [previewUrl,    setPreviewUrl]    = useState(student?.avatarUrl || '');
  const [pendingBase64, setPendingBase64] = useState(null);

  const [isSaving,   setIsSaving]   = useState(false);
  const [error,      setError]      = useState('');
  const [compressing, setCompressing] = useState(false);
  const fileInputRef                 = useRef(null);

  // ── Pilih & Kompres Gambar ─────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    // Batas file mentah sebelum kompresi: 10MB sudah sangat lebih dari cukup
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Pilih gambar di bawah 10MB.');
      return;
    }

    setError('');
    setCompressing(true);

    try {
      const base64 = await compressImageToBase64(file);
      setPreviewUrl(base64);
      setPendingBase64(base64);

      // Estimasi ukuran output (1 karakter Base64 ≈ 0.75 byte)
      const estimatedKB = Math.round((base64.length * 0.75) / 1024);
      if (estimatedKB > 500) {
        // Hampir tidak mungkin terjadi di 150×150 JPEG, tapi jaga-jaga
        setError(`Hasil kompresi terlalu besar (${estimatedKB}KB). Coba gambar lain.`);
        setPreviewUrl('');
        setPendingBase64(null);
      }
    } catch (err) {
      console.error('[ProfileForm] Kompresi gambar gagal:', err);
      setError('Gagal memproses gambar. Coba file lain.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    setPendingBase64(''); // string kosong = hapus avatar dari Firestore
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ke Firestore ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // avatarUrl = Base64 string baru / string kosong / tetap nilai lama
      const finalAvatarUrl = pendingBase64 !== null ? pendingBase64 : (student?.avatarUrl || '');

      const updatedFields = {
        name:      name.trim(),
        about:     about.trim(),
        ig:        ig.trim(),
        github:    github.trim(),
        portfolio: portfolio.trim(),
        role,
        avatarUrl: finalAvatarUrl,
      };

      // updateStudentProfile = Firestore partial update (updateDoc)
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
        {/* Preview avatar atau inisial fallback */}
        <div
          className={`relative w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-inner group border-2 border-dashed border-black/20 ${student?.avatarColor || 'bg-teal-600'}`}
        >
          {previewUrl ? (
            // Base64 Data URL langsung bisa masuk ke src
            <img
              src={previewUrl}
              alt="Preview Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-2xl font-extrabold select-none">
              {student?.initials || '??'}
            </span>
          )}

          {/* Hover overlay untuk trigger file picker */}
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <Camera className="w-6 h-6 text-white" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <p className="text-sm font-bold text-inverted">Foto Profil</p>
          <p className="text-xs text-outlined leading-relaxed">
            Format JPG, PNG, atau WEBP. Gambar akan dikompres otomatis ke 150×150 px.
          </p>
          <div className="flex justify-center sm:justify-start gap-2">
            <label className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm">
              {compressing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Pilih Foto
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={compressing}
              />
            </label>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
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

      {/* ── Role / Tech Stack Selector ── */}
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
                  outline:       isSelected ? `2px solid ${TEAL}` : 'none',
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
            disabled={isSaving || compressing}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-outlined hover:bg-black/5 transition-all disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving || compressing}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

    </form>
  );
}
