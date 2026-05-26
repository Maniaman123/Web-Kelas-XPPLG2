import { useEffect, useState } from 'react';
import { Users, FolderGit2, BookOpen, Trophy } from 'lucide-react';
import { getStudents, getProjects, getAchievements } from '../utils/firestoreService';

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = Math.max(target / (duration / 16), 0.01);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="text-2xl sm:text-3xl font-extrabold text-inverted tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function StatsCard() {
  const [counts, setCounts] = useState({ pelajar: 0, proyek: 0, prestasi: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsData, projectsData, achievementsData] = await Promise.all([
          getStudents(),
          getProjects(),
          getAchievements()
        ]);
        setCounts({
          pelajar: studentsData.length,
          proyek: projectsData.length,
          prestasi: achievementsData.length
        });
      } catch (err) {
        console.error("Failed to load stats from Firestore:", err);
      }
    }
    loadStats();
  }, []);

  const stats = [
    { icon: Users,      label: 'Pelajar',        value: counts.pelajar,  suffix: '' },
    { icon: FolderGit2, label: 'Proyek Aktif',   value: counts.proyek,   suffix: '' },
    { icon: BookOpen,   label: 'Mata Pelajaran',  value: 5,             suffix: '' },
    { icon: Trophy,     label: 'Prestasi',        value: counts.prestasi, suffix: '' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 font-sans">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center p-3 sm:p-4 rounded-2xl bg-surface-alt hover:bg-secondary/35 transition-colors"
        >
          <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
          <AnimatedCounter target={stat.value} suffix={stat.suffix} />
          <p className="text-[10px] sm:text-xs text-outlined mt-1 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
