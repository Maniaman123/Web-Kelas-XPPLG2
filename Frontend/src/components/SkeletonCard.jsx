// src/components/SkeletonCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable high-fidelity Skeleton Loader component for grid pages
// Support variants: "student" and "showcase"
//
// Developer Credit: Reyhan Septianto Ramadhan
// ─────────────────────────────────────────────────────────────────────────────

export default function SkeletonCard({ variant = 'student' }) {
  if (variant === 'student') {
    return (
      <div 
        className="p-4 flex flex-col h-full min-h-[200px] relative overflow-hidden rounded-2xl bg-secondary select-none"
        style={{ color: '#243B3C' }}
      >
        {/* Top Right Badge */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-primary/10 animate-pulse" />

        {/* Avatar + name header */}
        <div className="flex items-center gap-3 mb-3 pr-8">
          <div className="w-11 h-11 rounded-xl bg-primary/15 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-primary/20 rounded-md w-28 animate-pulse" />
            <div className="h-3 bg-primary/10 rounded-md w-16 animate-pulse" />
          </div>
        </div>

        {/* Body placeholder */}
        <div className="flex-1 space-y-2 mt-1">
          <div className="h-2.5 bg-primary/10 rounded w-full animate-pulse" />
          <div className="h-2.5 bg-primary/10 rounded w-11/12 animate-pulse" />
          <div className="h-2.5 bg-primary/10 rounded w-4/5 animate-pulse" />
        </div>

        {/* Footer row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="h-5 w-16 bg-primary/15 rounded-full animate-pulse" />
          <div className="flex gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 animate-pulse" />
            <div className="w-7 h-7 rounded-lg bg-primary/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // variant === 'showcase' (widescreen / aspect-video layout for projects, achievements, cinematography)
  return (
    <div className="bg-primary-dark border border-white/5 rounded-3xl p-4 flex flex-col h-full overflow-hidden select-none">
      {/* 16:9 Thumbnail Image Container */}
      <div className="w-full aspect-video rounded-2xl bg-white/5 animate-pulse relative" />

      {/* Typography Bars */}
      <div className="mt-4 mb-3 col-span-full">
        <div className="bg-secondary/20 h-4 rounded w-3/4 mb-2 animate-pulse" />
        <div className="bg-secondary/10 h-3 rounded w-1/2 animate-pulse" />
      </div>

      {/* Bottom details row (like student name placeholder) */}
      <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center w-full">
        <div className="h-3 bg-secondary/15 rounded w-24 animate-pulse" />
        <div className="h-6 w-6 rounded-lg bg-secondary/10 animate-pulse" />
      </div>
    </div>
  );
}
