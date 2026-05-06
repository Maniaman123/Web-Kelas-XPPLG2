import { useEffect, useState } from 'react';
import { Users, FolderGit2, BookOpen, Trophy } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Siswa', value: 36, suffix: '' },
  { icon: FolderGit2, label: 'Proyek Aktif', value: 10, suffix: '+' },
  { icon: BookOpen, label: 'Mata Pelajaran', value: 5, suffix: '' },
  { icon: Trophy, label: 'Prestasi', value: 3, suffix: '+' },
];

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
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
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center p-3 sm:p-4 rounded-2xl bg-surface-alt hover:bg-secondary/30 transition-colors"
        >
          <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
          <AnimatedCounter target={stat.value} suffix={stat.suffix} />
          <p className="text-[10px] sm:text-xs text-outlined mt-1 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
