import { motion } from 'framer-motion';
import { Sparkles, ArrowDown, Code, Gamepad2, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="beranda"
      className="relative bg-primary overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/2 rounded-full" />

        {/* Floating code elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 right-[15%] text-white/10"
        >
          <Code className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-32 left-[10%] text-white/10"
        >
          <Gamepad2 className="w-12 h-12" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 left-[20%] text-white/5"
        >
          <Terminal className="w-20 h-20" />
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36 lg:py-44">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6 sm:mb-8"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-white/80 text-xs sm:text-sm font-medium">
              SMK Negeri 1 Ciomas — Tahun Ajaran 2025/2026
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6"
          >
            X PPLG 2:{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-cyan-300 to-teal-300">
              Coding the Future,
            </span>{' '}
            One Class at a Time.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4"
          >
            Software Developers & Game Creators Class at SMK Negeri 1 Ciomas
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <a
              href="#siswa"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-white text-primary font-semibold text-sm sm:text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center"
            >
              Jelajahi Kelas
            </a>
            <a
              href="#proyek"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm sm:text-base hover:bg-white/20 transition-all text-center"
            >
              Lihat Proyek
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
