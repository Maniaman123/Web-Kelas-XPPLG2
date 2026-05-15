/**
 * models/queries.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Kumpulan query SQL kompleks & skema tabel untuk referensi.
 * Jalankan SQL di bawah ini melalui Supabase SQL Editor untuk membuat tabel.
 *
 * Supabase Dashboard → SQL Editor → New Query → paste & Run
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SKEMA TABEL (DDL) — Jalankan urut dari atas ke bawah
// ═══════════════════════════════════════════════════════════════════════════════

export const CREATE_TABLES_SQL = `
-- 1. Profiles (extend dari auth.users Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  role        VARCHAR(20)  NOT NULL DEFAULT 'guru' CHECK (role IN ('admin', 'guru')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. Kelas
CREATE TABLE IF NOT EXISTS kelas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kelas   VARCHAR(50)  NOT NULL,
  tingkat      VARCHAR(20)  NOT NULL,
  tahun_ajaran VARCHAR(20)  NOT NULL,
  guru_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  kapasitas    INT          DEFAULT 30,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- 3. Siswa
CREATE TABLE IF NOT EXISTS siswa (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nis            VARCHAR(20)  NOT NULL UNIQUE,
  nama           VARCHAR(150) NOT NULL,
  kelas_id       UUID REFERENCES kelas(id) ON DELETE SET NULL,
  tanggal_lahir  DATE,
  jenis_kelamin  VARCHAR(10)  CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  alamat         TEXT,
  no_telp_ortu   VARCHAR(20),
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- 4. Absensi
CREATE TABLE IF NOT EXISTS absensi (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id      UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  kelas_id      UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,
  status        VARCHAR(10) NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpha')),
  keterangan    TEXT,
  dicatat_oleh  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (siswa_id, tanggal)
);

-- 5. Nilai
CREATE TABLE IF NOT EXISTS nilai (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id        UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  kelas_id        UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  mata_pelajaran  VARCHAR(100) NOT NULL,
  jenis_ujian     VARCHAR(20)  NOT NULL CHECK (jenis_ujian IN ('Harian', 'UTS', 'UAS', 'Tugas', 'Praktik')),
  semester        INT NOT NULL CHECK (semester IN (1, 2)),
  tahun_ajaran    VARCHAR(20) NOT NULL,
  nilai           NUMERIC(5,2) NOT NULL CHECK (nilai >= 0 AND nilai <= 100),
  keterangan      TEXT,
  diinput_oleh    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (siswa_id, mata_pelajaran, jenis_ujian, semester, tahun_ajaran)
);

-- 6. Jadwal
CREATE TABLE IF NOT EXISTS jadwal (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas_id        UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  guru_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  mata_pelajaran  VARCHAR(100) NOT NULL,
  hari            VARCHAR(10)  NOT NULL CHECK (hari IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')),
  jam_mulai       TIME NOT NULL,
  jam_selesai     TIME NOT NULL,
  ruangan         VARCHAR(50),
  semester        INT  NOT NULL CHECK (semester IN (1, 2)),
  tahun_ajaran    VARCHAR(20) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ROW LEVEL SECURITY (RLS) — Aktifkan setelah tabel dibuat
// ═══════════════════════════════════════════════════════════════════════════════

export const ENABLE_RLS_SQL = `
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa    ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal   ENABLE ROW LEVEL SECURITY;

-- Profiles: user hanya bisa lihat & edit profil sendiri
CREATE POLICY "profiles_self" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Tabel lain: hanya user yang login (authenticated) yang bisa akses
CREATE POLICY "kelas_auth"   ON kelas   FOR ALL TO authenticated USING (true);
CREATE POLICY "siswa_auth"   ON siswa   FOR ALL TO authenticated USING (true);
CREATE POLICY "absensi_auth" ON absensi FOR ALL TO authenticated USING (true);
CREATE POLICY "nilai_auth"   ON nilai   FOR ALL TO authenticated USING (true);
CREATE POLICY "jadwal_auth"  ON jadwal  FOR ALL TO authenticated USING (true);
`;

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY HELPER FUNCTIONS (dipakai langsung di controller jika diperlukan)
// ═══════════════════════════════════════════════════════════════════════════════
import supabase from '../config/database.js';

/** Ambil rekap kehadiran bulanan seluruh kelas */
export const queryRekapBulananKelas = (kelas_id, bulan, tahun) => {
  const dari   = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const sampai = `${tahun}-${String(bulan).padStart(2, '0')}-31`;

  return supabase
    .from('absensi')
    .select('status, siswa(nama, nis)')
    .eq('kelas_id', kelas_id)
    .gte('tanggal', dari)
    .lte('tanggal', sampai);
};

/** Ambil ranking nilai per kelas & mata pelajaran */
export const queryRankingNilai = (kelas_id, mata_pelajaran, semester, tahun_ajaran) =>
  supabase
    .from('nilai')
    .select('nilai, siswa(id, nama, nis)')
    .eq('kelas_id', kelas_id)
    .eq('mata_pelajaran', mata_pelajaran)
    .eq('semester', semester)
    .eq('tahun_ajaran', tahun_ajaran)
    .order('nilai', { ascending: false });
