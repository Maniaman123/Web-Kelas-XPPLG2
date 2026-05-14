import { useState, useRef } from "react";
import { Users, Search } from "lucide-react";
import useAuth from "../context/useAuth";
import { storage } from "../utils/storage";
import BentoCard from "./BentoCard";
import StudentCard from "./StudentCard";
import ScheduleCard from "./ScheduleCard";
import StatsCard from "./StatsCard";
import ProjectShowcase from "./ProjectShowcase";
import CinematographyCard from "./CinematographyCard";
import { GlobalSpotlight } from "./MagicBento";

export default function BentoGrid() {
  const { user } = useAuth();
  const gridRef = useRef(null);
  const [students] = useState(() => storage.getStudents() || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all"); // 'all', 'L', 'P'
  const [showAll, setShowAll] = useState(false);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.absentNumber && s.absentNumber.toString() === searchQuery);
    const matchesGender = genderFilter === "all" || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const displayedStudents = showAll
    ? filteredStudents
    : filteredStudents.slice(0, 12);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      {/* Section header */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-inverted mb-3">
          Jelajahi Kelas Kami
        </h2>
        <p className="text-sm sm:text-base text-outlined max-w-2xl mx-auto">
          Temukan informasi lengkap tentang pelajar, proyek, jadwal, dan
          kegiatan kelas X PPLG 2.
        </p>
      </div>

      {/* MagicBento spotlight over the real grid */}
      <GlobalSpotlight
        gridRef={gridRef}
        enabled={true}
        spotlightRadius={300}
        glowColor="36, 91, 92"
      />

      {/* Bento Grid Layout */}
      <div
        ref={gridRef}
        className="mb-bento-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 auto-rows-auto"
      >
        {/* ============================================ */}
        {/* 1. Student Directory Card (Wide — 2 cols, or 4 cols if expanded) */}
        {/* ============================================ */}
        <BentoCard colSpan={2} className="xl:col-span-2" id="siswa" enableBorderGlow enableTilt>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-base sm:text-lg font-bold text-inverted">
                Direktori Pelajar
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-medium">
                {students.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex bg-black/5 p-1 rounded-xl">
                <button
                  onClick={() => setGenderFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${genderFilter === "all" ? "bg-white shadow-sm text-primary" : "text-outlined hover:text-inverted"}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setGenderFilter("L")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${genderFilter === "L" ? "bg-white shadow-sm text-primary" : "text-outlined hover:text-inverted"}`}
                >
                  Laki-Laki
                </button>
                <button
                  onClick={() => setGenderFilter("P")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${genderFilter === "P" ? "bg-white shadow-sm text-primary" : "text-outlined hover:text-inverted"}`}
                >
                  Perempuan
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outlined" />
                <input
                  type="text"
                  placeholder="Cari nama/absen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-xl bg-surface-alt border border-black/5 text-xs focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
            {displayedStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                currentUser={user}
              />
            ))}
            {displayedStudents.length === 0 && (
              <div className="col-span-full py-10 text-center text-outlined">
                Pelajar tidak ditemukan.
              </div>
            )}
          </div>

          {filteredStudents.length > 12 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-3 rounded-xl bg-surface-alt border border-black/5 text-xs sm:text-sm font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              {showAll
                ? "Tampilkan Lebih Sedikit"
                : `Lihat Semua (${filteredStudents.length})`}
            </button>
          )}
        </BentoCard>

        {/* ============================================ */}
        {/* 2. Class Statistics Card (Small) */}
        {/* ============================================ */}
        <BentoCard enableBorderGlow enableTilt>
          <StatsCard />
        </BentoCard>

        {/* ============================================ */}
        {/* 3. Cinematography Card (Square) -> Links to /cinematography */}
        {/* ============================================ */}
        <BentoCard id="sinematografi" enableBorderGlow enableTilt>
          <CinematographyCard />
        </BentoCard>

        {/* ============================================ */}
        {/* 4. Project Showcase Card (Large — 2 cols) -> Links to /projects */}
        {/* ============================================ */}
        <BentoCard colSpan={2} className="xl:col-span-2" id="proyek" enableBorderGlow enableTilt>
          <ProjectShowcase />
        </BentoCard>

        {/* ============================================ */}
        {/* 5. Class Schedule Card (Medium) */}
        {/* ============================================ */}
        <BentoCard colSpan={2} className="xl:col-span-2" id="jadwal" enableBorderGlow enableTilt>
          <ScheduleCard />
        </BentoCard>
      </div>
    </section>
  );
}
