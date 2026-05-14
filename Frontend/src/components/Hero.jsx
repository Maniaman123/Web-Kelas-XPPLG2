import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import Prism from './Prism';

export default function Hero() {
  return (
    <section
      id="beranda"
      className="relative bg-primary overflow-hidden"
    >
      {/* Prism WebGL background — adaptive quality based on device tier */}
      <div className="absolute inset-0 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.5}
          glow={1}
          bloom={1.2}
          transparent={true}
          quality="auto"
        />
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
