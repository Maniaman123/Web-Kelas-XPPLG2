import { useState } from 'react';
import useAuth from '../context/useAuth';
import { storage } from '../utils/storage';
import { Rocket, Plus, ExternalLink } from 'lucide-react';

export default function Projects() {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState(() => storage.getProjects());
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      title,
      description,
      link
    };

    const updatedProjects = [newProject, ...projects];
    storage.saveProjects(updatedProjects);
    setProjects(updatedProjects);

    setTitle('');
    setDescription('');
    setLink('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-inverted">Proyek Siswa</h1>
        </div>
        
        {isAuthenticated && user?.role === 'student' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" /> Tambah Proyek
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-secondary rounded-3xl p-6 mb-8 border border-secondary-dark/30">
          <h2 className="text-xl font-bold text-inverted mb-4">Tambah Proyek Baru</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Judul Proyek</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Deskripsi Singkat</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-inverted mb-1">Link Demo / GitHub (Opsional)</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:border-primary outline-none"
              />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outlined border-2 border-dashed border-black/10 rounded-3xl">
            Belum ada proyek yang ditambahkan.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col">
              <h3 className="text-lg font-bold text-inverted mb-2">{project.title}</h3>
              <p className="text-sm text-outlined mb-4 flex-1">{project.description}</p>
              
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md">
                  Ditambahkan oleh {project.studentName}
                </span>
                
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-outlined hover:text-primary hover:bg-primary/5 transition-all"
                  >
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
