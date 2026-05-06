import { useState } from 'react';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { Rocket, Plus, ExternalLink, Clock, X } from 'lucide-react';

const MAX_PROJECTS = 3;

export default function Projects() {
  const { user, isAuthenticated } = useAuth();

  const allApproved = storage.getProjects();
  const allPending  = storage.getPendingItems().filter(p => p.type === 'project');
  const myApproved  = allApproved.filter(p => p.studentId === user?.id);
  const myPending   = allPending.filter(p => p.studentId === user?.id);
  const myTotal     = myApproved.length + myPending.length;
  const canAdd      = isAuthenticated && user?.role === 'student' && myTotal < MAX_PROJECTS;

  const [projects, setProjects]       = useState(allApproved);
  const [pending, setPending]         = useState(allPending);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink]               = useState('');

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!title || !description) return;
    const data = { studentId: user.id, studentName: user.name, title, description, link };
    const newPending = storage.submitPending('project', user.id, user.name, data);
    setPending(prev => [...prev, newPending]);
    setTitle(''); setDescription(''); setLink('');
    setShowAddForm(false); setSubmitted(true);
  };

  const myPendingItems = pending.filter(p => p.studentId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Proyek Pelajar</h1>
        </div>
        {isAuthenticated && user?.role === 'student' && (
          <div className="flex flex-col items-end gap-1">
            {canAdd ? (
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Proyek
              </button>
            ) : (
              <span className="text-xs text-outlined bg-black/5 px-3 py-2 rounded-xl">
                ✅ Batas proyek tercapai (maks. {MAX_PROJECTS})
              </span>
            )}
            <span className="text-[10px] text-outlined">{myTotal}/{MAX_PROJECTS} proyek kamu</span>
          </div>
        )}
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Proyekmu dikirim dan <strong>menunggu persetujuan admin</strong>.</span>
          <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-secondary rounded-3xl p-6 mb-8 border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-4">Tambah Proyek Baru</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Judul Proyek</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Deskripsi</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Link Demo / GitHub (Opsional)</label>
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-outlined font-medium hover:bg-black/5">Batal</button>
              <button type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90">Kirim untuk Disetujui</button>
            </div>
          </form>
        </div>
      )}

      {isAuthenticated && myPendingItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-outlined mb-3">Proyekmu (Menunggu Persetujuan)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPendingItems.map(p => (
              <div key={p.id} className="bg-amber-50 border-2 border-dashed border-amber-300 p-6 rounded-3xl flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-inverted">{p.data.title}</h3>
                  <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full shrink-0">⏳ Pending</span>
                </div>
                <p className="text-sm text-outlined flex-1">{p.data.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada proyek yang disetujui.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col">
              <h3 className="text-lg font-bold text-inverted mb-2">{project.title}</h3>
              <p className="text-sm text-outlined mb-4 flex-1">{project.description}</p>
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md">Oleh {project.studentName}</span>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-outlined hover:text-primary hover:bg-primary/5 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
