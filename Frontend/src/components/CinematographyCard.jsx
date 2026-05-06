import { useState } from 'react';
import { Camera, Play, Image as ImageIcon } from 'lucide-react';

const galleryItems = [
  { id: 1, type: 'photo', title: 'Class Portrait 2025', color: 'from-blue-400 to-indigo-500' },
  { id: 2, type: 'video', title: 'Dokumentasi Project', color: 'from-purple-400 to-pink-500' },
  { id: 3, type: 'photo', title: 'Lab Session', color: 'from-emerald-400 to-teal-500' },
  { id: 4, type: 'photo', title: 'School Event', color: 'from-amber-400 to-orange-500' },
  { id: 5, type: 'video', title: 'Tutorial Coding', color: 'from-rose-400 to-red-500' },
  { id: 6, type: 'photo', title: 'Team Building', color: 'from-cyan-400 to-blue-500' },
];

export default function CinematographyCard() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.type === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-bold text-inverted">Sinematografi</h3>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'photo', label: 'Foto' },
          { key: 'video', label: 'Video' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-primary text-white'
                : 'text-outlined hover:bg-black/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`aspect-square rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative group overflow-hidden`}
          >
            {item.type === 'video' ? (
              <Play className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform" />
            ) : (
              <ImageIcon className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm p-1">
              <p className="text-[8px] sm:text-[9px] text-white text-center truncate">{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-outlined mt-3 leading-relaxed">
        Gallery foto & video dokumentasi kegiatan kelas oleh tim cameraman. 📸
      </p>
    </div>
  );
}
