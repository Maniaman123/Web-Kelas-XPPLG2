import { Sparkles, Users, FolderGit2, Info, Settings, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * UI/UX Rationale & Benefits of the New Featured Project Card Design:
 * 
 * 1. Cognitive Clarity: Instead of just listing mock projects or dry text, the new card acts
 *    as a high-fidelity "Hub Overview". It instantly explains the core functionalities of the web application
 *    (Directory, Gallery, Information Center, and Admin/Self-Edit) to first-time users, recruiters, and teachers.
 * 2. Visual Hierarchy & Harmonious Contrast: Using the Light Azure (#DCEEFA) background with Deep Teal (#243B3C)
 *    elements establishes high-contrast readability. The tech stack badges at the top draw immediate attention, 
 *    highlighting developer proficiency.
 * 3. Modern Bento Aesthetics: Standardizing grid layout and keeping typography clean (Plus Jakarta Sans)
 *    creates a sleek, premium product feel, elevating a school class portfolio into an industry-grade portal.
 * 4. Action-Driven Layout: The neat feature grid with distinct visual icons and the CTA button ("Lihat Galeri Proyek")
 *    guides users naturally towards interaction.
 */

export default function FeaturedProjectCard() {
  const techStack = [
    { name: 'React', color: 'bg-sky-500/10 text-sky-700 border-sky-500/20' },
    { name: 'Vite', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
    { name: 'Tailwind CSS', color: 'bg-teal-500/10 text-teal-700 border-teal-500/20' },
    { name: 'Full Firebase Ecosystem', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' }
  ];

  const features = [
    {
      icon: Users,
      title: 'Direktori Profil Lengkap',
      desc: 'Eksplorasi bakat, bio kreatif, dan media sosial 46 siswa X PPLG 2.'
    },
    {
      icon: FolderGit2,
      title: 'Galeri Proyek Multidisiplin',
      desc: 'Karya nyata software engineering, sistem IoT terintegrasi, hingga karya sinematografi.'
    },
    {
      icon: Info,
      title: 'Pusat Informasi Kelas',
      desc: 'Statistik demografi, jadwal pelajaran mingguan, dan papan pengumuman internal.'
    },
    {
      icon: Settings,
      title: 'Dashboard Admin & Self-Edit',
      desc: 'Pengelolaan data terpusat oleh Admin dan edit profil mandiri bagi siswa terautentikasi.'
    }
  ];

  return (
    <div className="flex flex-col h-full font-sans select-none">
      {/* Top Banner / Category Badge & Tech Tags */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-primary/10">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5 animate-pulse text-primary" />
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">Featured Platform Hub</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech) => (
            <span
              key={tech.name}
              className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${tech.color}`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Pitch */}
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-primary leading-snug mb-3">
          Portal Kolaboratif & Galeri Karya Kreatif X PPLG 2
        </h3>
        <p className="text-xs sm:text-sm text-primary/80 leading-relaxed font-normal">
          Platform digital interaktif premium yang menyatukan seluruh portofolio kolektif siswa, 
          jadwal terpadu, dan statistik kelas dalam satu ekosistem cloud terintegrasi. Dirancang secara profesional 
          sebagai ruang etalase digital guna memamerkan kesiapan karier serta keahlian rekayasa teknologi siswa kami.
        </p>
      </div>

      {/* Feature Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex gap-3 p-3.5 rounded-2xl bg-white/40 hover:bg-white/60 border border-primary/5 hover:border-primary/15 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <feature.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-primary mb-0.5">
                {feature.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-primary/70 leading-relaxed font-normal">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer & CTA Link */}
      <div className="mt-auto pt-4 border-t border-primary/10 flex items-center justify-between flex-wrap gap-3">
        <span className="text-[10px] sm:text-xs text-primary/60 font-semibold uppercase tracking-wider">
          Built with premium stack
        </span>
        <a
          href="#siswa"
          className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:translate-x-0.5"
        >
          Mulai Eksplorasi <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
