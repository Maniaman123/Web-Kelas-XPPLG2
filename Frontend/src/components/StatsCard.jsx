import { useEffect, useState } from 'react';
import { Users, FolderGit2, BookOpen, Trophy } from 'lucide-react';
import {
  subscribeToStudents,
  subscribeToProjects,
  subscribeToAchievements,
  subscribeToSchedule,
} from '../utils/firestoreService';

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
  const [counts, setCounts] = useState({ pelajar: 0, proyek: 0, prestasi: 0, mataPelajaran: 0 });

  useEffect(() => {
    const unsubStudents = subscribeToStudents((students) => {
      setCounts((prev) => ({ ...prev, pelajar: students.length }));
    });

    const unsubProjects = subscribeToProjects((projects) => {
      setCounts((prev) => ({ ...prev, proyek: projects.length }));
    });

    const unsubAchievements = subscribeToAchievements((achievements) => {
      setCounts((prev) => ({ ...prev, prestasi: achievements.length }));
    });

    const unsubSchedule = subscribeToSchedule((days) => {
      const allSubjects = new Set();
      days.forEach((dayDoc) => {
        if (dayDoc.subjects) {
          dayDoc.subjects.forEach((subject) => {
            if (subject.name && !subject.isEvent) {
              const normalized = subject.name.trim().toUpperCase();
              if (normalized) {
                allSubjects.add(normalized);
              }
            }
          });
        }
      });
      setCounts((prev) => ({ ...prev, mataPelajaran: allSubjects.size }));
    });

    return () => {
      unsubStudents();
      unsubProjects();
      unsubAchievements();
      unsubSchedule();
    };
  }, []);

  const stats = [
    { icon: Users,      label: 'Pelajar',        value: counts.pelajar,        suffix: '' },
    { icon: FolderGit2, label: 'Proyek Aktif',   value: counts.proyek,         suffix: '' },
    { icon: BookOpen,   label: 'Mata Pelajaran',  value: counts.mataPelajaran,  suffix: '' },
    { icon: Trophy,     label: 'Prestasi',        value: counts.prestasi,       suffix: '' },
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
