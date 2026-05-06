import { useState } from 'react';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { Camera, Plus, Play } from 'lucide-react';

export default function Cinematography() {
  const { user, isAuthenticated } = useAuth();
  const [media, setMedia] = useState(() => storage.getCinematography());
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('photo'); // photo or video
  const [url, setUrl] = useState('');

  const handleAddMedia = (e) => {
    e.preventDefault();
    if (!title || !url) return;

    const newMedia = {
      id: `media-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      title,
      type,
      url
    };

    const updatedMedia = [newMedia, ...media];
    storage.saveCinematography(updatedMedia);
    setMedia(updatedMedia);

    setTitle('');
    setUrl('');
    setType('photo');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Galeri Sinematografi</h1>
        </div>
        
        {isAuthenticated && user?.role === 'student' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" /> Tambah Karya
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-secondary rounded-3xl p-6 mb-8 border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-4">Tambah Karya Baru</h2>
          <form onSubmit={handleAddMedia} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Judul Karya</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">Jenis Media</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                >
                  <option value="photo">Foto</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-inverted mb-1">URL Media (Image link / Youtube)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada karya yang ditambahkan.
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="group relative rounded-3xl overflow-hidden aspect-video bg-black/5 border border-black/5">
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/80">
                  <Play className="w-12 h-12 text-white/50" />
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label="Play video" />
                </div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold mb-1 truncate">{item.title}</h3>
                <p className="text-white/70 text-xs">Oleh {item.studentName}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
