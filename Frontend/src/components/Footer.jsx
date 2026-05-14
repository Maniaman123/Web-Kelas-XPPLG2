import { Code2, Globe, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">X PPLG 2</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Kelas Pengembang Perangkat Lunak dan Game di SMK Negeri 1 Ciomas. Membangun generasi developer muda yang kreatif dan inovatif.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2.5">
              {['Beranda', 'Pelajar', 'Proyek', 'Jadwal'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Informasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li>SMK Negeri 1 Ciomas</li>
              <li>Jurusan PPLG</li>
              <li>Tahun Ajaran 2025/2026</li>
              <li>Kelas X - Semester 2</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex gap-2">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} X PPLG 2 — SMK Negeri 1 Ciomas
          </p>
          <p className="flex items-center gap-1.5">
            Dibuat oleh{' '}
            <span className="font-medium text-white">Reyhan_SR</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
