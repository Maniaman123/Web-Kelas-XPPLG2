import { ExternalLink, Globe, Sparkles } from 'lucide-react';
import projects from '../data/projects';

export default function ProjectShowcase() {
  const featured = projects.find((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <div>
      {/* Featured Project */}
      {featured && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-inverted">Featured Project</h3>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-primary/5 via-accent/5 to-purple-500/5 border border-primary/10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-inverted">{featured.name}</h4>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] sm:text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {featured.status}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button className="p-2 rounded-xl text-outlined hover:text-inverted hover:bg-black/5 transition-colors cursor-pointer">
                  <Globe className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl text-outlined hover:text-inverted hover:bg-black/5 transition-colors cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-outlined leading-relaxed mb-4">
              {featured.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {featured.tech.map((t) => (
                <span key={t} className="px-2 py-1 rounded-lg bg-white/80 text-[10px] sm:text-xs font-medium text-inverted border border-black/5">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-black/5 text-[10px] sm:text-xs text-outlined">
              👥 {featured.contributors} kontributor aktif
            </div>
          </div>
        </div>
      )}

      {/* Other Projects */}
      <div className="space-y-2">
        {others.map((project) => (
          <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-inverted truncate">{project.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  project.status === 'Active' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-700'
                }`}>
                  {project.status}
                </span>
                <span className="text-[10px] text-outlined">{project.contributors} orang</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
    </svg>
  );
}
