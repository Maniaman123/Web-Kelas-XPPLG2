

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            KelasXPPLG2
          </div>
          <div className="hidden md:flex gap-6 font-medium text-slate-600">
            <a href="#beranda" className="hover:text-indigo-600 transition-colors">Beranda</a>
            <a href="#tentang" className="hover:text-indigo-600 transition-colors">Tentang Kelas</a>
            <a href="#jadwal" className="hover:text-indigo-600 transition-colors">Jadwal</a>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Join Kelas
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="max-w-6xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Tahun Ajaran 2026/2027
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Selamat Datang di <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Kelas XPPLG2</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto md:mx-0">
            Tempat di mana kreativitas bertemu dengan teknologi. Mari belajar coding, berkolaborasi, dan membangun masa depan bersama-sama.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-medium text-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-xl transform hover:-translate-y-1">
              Mulai Belajar
            </button>
            <button className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-3.5 rounded-full font-medium text-lg transition-all">
              Lihat Silabus
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-linear-to-tr from-indigo-200 to-purple-200 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-lg"></div>
          <div className="relative bg-white p-2 rounded-3xl shadow-xl border border-slate-100">
             <div className="aspect-4/3 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
               <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-purple-500/10"></div>
               <div className="text-center p-8 relative z-10">
                 <div className="w-20 h-20 bg-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center rotate-3">
                   <span className="text-4xl">💻</span>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800">Ruang Belajar Interaktif</h3>
                 <p className="text-sm text-slate-500 mt-2">Coding, Design, dan Inovasi</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="tentang" className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Kenapa Belajar Bersama Kami?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Kami menyediakan lingkungan belajar yang modern, interaktif, dan fokus pada praktik langsung di industri nyata.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🚀', title: 'Kurikulum Modern', desc: 'Materi selalu di-update mengikuti perkembangan teknologi terbaru seperti React, Tailwind, dan Node.js.' },
              { icon: '🤝', title: 'Kolaborasi Tim', desc: 'Belajar bekerja dalam tim seperti di dunia profesional dengan metodologi Agile dan version control.' },
              { icon: '🏆', title: 'Project Based', desc: 'Fokus pada pembuatan portofolio dan proyek nyata yang bisa digunakan oleh masyarakat atau UMKM.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Kelas<span className="text-indigo-400">XPPLG2</span></h2>
          <p className="mb-6 max-w-md mx-auto">Membangun generasi developer muda yang kreatif, inovatif, dan siap menghadapi tantangan global.</p>
          <div className="pt-8 border-t border-slate-800 text-sm">
            &copy; {new Date().getFullYear()} Kelas XPPLG2. Dibuat dengan React & Tailwind CSS.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
