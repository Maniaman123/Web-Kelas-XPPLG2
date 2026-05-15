-- ═══════════════════════════════════════════════════════════════════════════════
-- KELAS WEB APP — Supabase PostgreSQL Schema
-- Cara pakai: Supabase Dashboard → SQL Editor → New Query → Run
-- Jalankan section PER SECTION dari atas ke bawah
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 — EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 — ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE user_role       AS ENUM ('admin', 'guru');
CREATE TYPE jenis_kelamin   AS ENUM ('Laki-laki', 'Perempuan');
CREATE TYPE status_absensi  AS ENUM ('hadir', 'sakit', 'izin', 'alpha');
CREATE TYPE jenis_ujian     AS ENUM ('Harian', 'UTS', 'UAS', 'Tugas', 'Praktik');
CREATE TYPE hari_sekolah    AS ENUM ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu');
CREATE TYPE semester_enum   AS ENUM ('1', '2');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 — TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ 3.1  PROFILES                                                           │
-- │  Extend tabel auth.users dari Supabase Auth.                            │
-- │  Dibuat otomatis via trigger saat user register.                        │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  role        user_role    NOT NULL DEFAULT 'guru',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  profiles            IS 'Profil pengguna (admin & guru), extend dari auth.users';
COMMENT ON COLUMN profiles.role       IS 'Role: admin bisa CRUD semua, guru bisa input absensi & nilai';
COMMENT ON COLUMN profiles.avatar_url IS 'URL foto profil (opsional, bisa dari Supabase Storage)';


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ 3.2  KELAS                                                              │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS kelas (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kelas   VARCHAR(50)  NOT NULL,
  tingkat      VARCHAR(20)  NOT NULL,
  tahun_ajaran VARCHAR(9)   NOT NULL CHECK (tahun_ajaran ~ '^\d{4}/\d{4}$'),
  guru_id      UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  kapasitas    SMALLINT     NOT NULL DEFAULT 30 CHECK (kapasitas BETWEEN 1 AND 60),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_kelas_nama_tahun UNIQUE (nama_kelas, tahun_ajaran)
);

COMMENT ON TABLE  kelas              IS 'Data kelas sekolah per tahun ajaran';
COMMENT ON COLUMN kelas.tahun_ajaran IS 'Format: 2024/2025';
COMMENT ON COLUMN kelas.kapasitas    IS 'Jumlah maksimum siswa dalam kelas';


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ 3.3  SISWA                                                              │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS siswa (
  id             UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  nis            VARCHAR(20)    NOT NULL UNIQUE,
  nama           VARCHAR(150)   NOT NULL,
  kelas_id       UUID           REFERENCES kelas(id) ON DELETE SET NULL,
  tanggal_lahir  DATE,
  jenis_kelamin  jenis_kelamin,
  alamat         TEXT,
  no_telp_ortu   VARCHAR(20),
  foto_url       TEXT,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  siswa          IS 'Data siswa';
COMMENT ON COLUMN siswa.nis      IS 'Nomor Induk Siswa — harus unik';
COMMENT ON COLUMN siswa.kelas_id IS 'NULL jika siswa belum ditempatkan ke kelas';


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ 3.4  ABSENSI                                                            │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS absensi (
  id            UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id      UUID           NOT NULL REFERENCES siswa(id)    ON DELETE CASCADE,
  kelas_id      UUID           NOT NULL REFERENCES kelas(id)    ON DELETE CASCADE,
  tanggal       DATE           NOT NULL,
  status        status_absensi NOT NULL,
  keterangan    TEXT,
  dicatat_oleh  UUID           REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_absensi_siswa_tanggal UNIQUE (siswa_id, tanggal)
);

COMMENT ON TABLE  absensi             IS 'Rekaman kehadiran siswa per hari';
COMMENT ON COLUMN absensi.status      IS 'hadir | sakit | izin | alpha';
COMMENT ON COLUMN absensi.keterangan  IS 'Catatan tambahan (misal: surat dokter)';


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ 3.5  NILAI                                                              │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS nilai (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id        UUID          NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  kelas_id        UUID          NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  mata_pelajaran  VARCHAR(100)  NOT NULL,
  jenis_ujian     jenis_ujian   NOT NULL,
  semester        semester_enum NOT NULL,
  tahun_ajaran    VARCHAR(9)    NOT NULL CHECK (tahun_ajaran ~ '^\d{4}/\d{4}$'),
  nilai           NUMERIC(5,2)  NOT NULL CHECK (nilai BETWEEN 0 AND 100),
  keterangan      TEXT,
  diinput_oleh    UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_nilai_siswa_mapel UNIQUE (siswa_id, mata_pelajaran, jenis_ujian, semester, tahun_ajaran)
);

COMMENT ON TABLE  nilai              IS 'Rekaman nilai siswa per mata pelajaran & jenis ujian';
COMMENT ON COLUMN nilai.nilai        IS 'Skala 0.00 – 100.00';
COMMENT ON COLUMN nilai.jenis_ujian  IS 'Harian | UTS | UAS | Tugas | Praktik';


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ 3.6  JADWAL                                                             │
-- └─────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS jadwal (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_id        UUID          NOT NULL REFERENCES kelas(id)    ON DELETE CASCADE,
  guru_id         UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  mata_pelajaran  VARCHAR(100)  NOT NULL,
  hari            hari_sekolah  NOT NULL,
  jam_mulai       TIME          NOT NULL,
  jam_selesai     TIME          NOT NULL,
  ruangan         VARCHAR(50),
  semester        semester_enum NOT NULL,
  tahun_ajaran    VARCHAR(9)    NOT NULL CHECK (tahun_ajaran ~ '^\d{4}/\d{4}$'),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_jam_valid CHECK (jam_selesai > jam_mulai)
);

COMMENT ON TABLE  jadwal             IS 'Jadwal pelajaran per kelas per hari';
COMMENT ON COLUMN jadwal.hari        IS 'Senin – Sabtu';
COMMENT ON COLUMN jadwal.jam_mulai   IS 'Format HH:MM (24 jam)';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 — INDEXES (performa query)
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role      ON profiles(role);

-- kelas
CREATE INDEX IF NOT EXISTS idx_kelas_guru         ON kelas(guru_id);
CREATE INDEX IF NOT EXISTS idx_kelas_tahun        ON kelas(tahun_ajaran);

-- siswa
CREATE INDEX IF NOT EXISTS idx_siswa_kelas        ON siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_siswa_nama         ON siswa USING GIN (to_tsvector('indonesian', nama));

-- absensi
CREATE INDEX IF NOT EXISTS idx_absensi_siswa      ON absensi(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_kelas      ON absensi(kelas_id);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal    ON absensi(tanggal);

-- nilai
CREATE INDEX IF NOT EXISTS idx_nilai_siswa        ON nilai(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_kelas        ON nilai(kelas_id);
CREATE INDEX IF NOT EXISTS idx_nilai_mapel        ON nilai(mata_pelajaran);

-- jadwal
CREATE INDEX IF NOT EXISTS idx_jadwal_kelas       ON jadwal(kelas_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_guru        ON jadwal(guru_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_hari        ON jadwal(hari);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5 — FUNCTION & TRIGGER: auto updated_at
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Terapkan trigger ke semua tabel yang punya kolom updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles','kelas','siswa','absensi','nilai','jadwal'] LOOP
    EXECUTE format('
      CREATE OR REPLACE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', tbl, tbl);
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6 — FUNCTION & TRIGGER: auto-create profile saat user register
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'Pengguna Baru'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'guru')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7 — ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa    ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal   ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- User hanya bisa baca & edit profil sendiri
CREATE POLICY "profiles: baca sendiri"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles: edit sendiri"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admin bisa baca semua profil
CREATE POLICY "profiles: admin baca semua"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── Kelas, Siswa, Absensi, Nilai, Jadwal ──────────────────────────────────────
-- Semua user yang sudah login bisa baca
-- Hanya admin yang bisa INSERT / UPDATE / DELETE kelas & jadwal
-- Guru & admin bisa INSERT / UPDATE absensi & nilai

-- KELAS
CREATE POLICY "kelas: authenticated baca"
  ON kelas FOR SELECT TO authenticated USING (true);

CREATE POLICY "kelas: admin write"
  ON kelas FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SISWA
CREATE POLICY "siswa: authenticated baca"
  ON siswa FOR SELECT TO authenticated USING (true);

CREATE POLICY "siswa: guru atau admin write"
  ON siswa FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','guru'))
  );

-- ABSENSI
CREATE POLICY "absensi: authenticated baca"
  ON absensi FOR SELECT TO authenticated USING (true);

CREATE POLICY "absensi: guru atau admin write"
  ON absensi FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','guru'))
  );

-- NILAI
CREATE POLICY "nilai: authenticated baca"
  ON nilai FOR SELECT TO authenticated USING (true);

CREATE POLICY "nilai: guru atau admin write"
  ON nilai FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','guru'))
  );

-- JADWAL
CREATE POLICY "jadwal: authenticated baca"
  ON jadwal FOR SELECT TO authenticated USING (true);

CREATE POLICY "jadwal: admin write"
  ON jadwal FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8 — VIEWS (opsional, untuk query kompleks lebih mudah)
-- ─────────────────────────────────────────────────────────────────────────────

-- View: daftar siswa lengkap dengan info kelas
CREATE OR REPLACE VIEW view_siswa_kelas AS
SELECT
  s.id,
  s.nis,
  s.nama,
  s.jenis_kelamin,
  s.tanggal_lahir,
  s.no_telp_ortu,
  k.id           AS kelas_id,
  k.nama_kelas,
  k.tingkat,
  k.tahun_ajaran,
  p.nama         AS nama_guru
FROM siswa s
LEFT JOIN kelas    k ON k.id = s.kelas_id
LEFT JOIN profiles p ON p.id = k.guru_id;

-- View: rekap absensi bulanan per siswa per kelas
CREATE OR REPLACE VIEW view_rekap_absensi AS
SELECT
  a.kelas_id,
  a.siswa_id,
  s.nama         AS nama_siswa,
  s.nis,
  k.nama_kelas,
  DATE_TRUNC('month', a.tanggal) AS bulan,
  COUNT(*) FILTER (WHERE a.status = 'hadir') AS hadir,
  COUNT(*) FILTER (WHERE a.status = 'sakit') AS sakit,
  COUNT(*) FILTER (WHERE a.status = 'izin')  AS izin,
  COUNT(*) FILTER (WHERE a.status = 'alpha') AS alpha,
  COUNT(*)                                    AS total
FROM absensi a
JOIN siswa s ON s.id = a.siswa_id
JOIN kelas k ON k.id = a.kelas_id
GROUP BY a.kelas_id, a.siswa_id, s.nama, s.nis, k.nama_kelas, DATE_TRUNC('month', a.tanggal);

-- View: rata-rata nilai per siswa per mata pelajaran
CREATE OR REPLACE VIEW view_rata_nilai AS
SELECT
  n.siswa_id,
  s.nama           AS nama_siswa,
  s.nis,
  n.kelas_id,
  k.nama_kelas,
  n.mata_pelajaran,
  n.semester,
  n.tahun_ajaran,
  ROUND(AVG(n.nilai), 2) AS rata_rata,
  MIN(n.nilai)           AS nilai_terendah,
  MAX(n.nilai)           AS nilai_tertinggi,
  COUNT(*)               AS jumlah_ujian
FROM nilai n
JOIN siswa s ON s.id = n.siswa_id
JOIN kelas k ON k.id = n.kelas_id
GROUP BY n.siswa_id, s.nama, s.nis, n.kelas_id, k.nama_kelas, n.mata_pelajaran, n.semester, n.tahun_ajaran;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9 — SEED DATA (contoh data awal, hapus jika tidak diperlukan)
-- ─────────────────────────────────────────────────────────────────────────────

-- ⚠️  Buat user via Supabase Auth terlebih dulu agar id-nya bisa dipakai di sini
-- Atau lewati section ini dan biarkan trigger handle_new_user() yang mengisi otomatis

-- Contoh kelas (jalankan setelah ada data profiles)
-- INSERT INTO kelas (nama_kelas, tingkat, tahun_ajaran, kapasitas)
-- VALUES
--   ('VII-A', 'VII',  '2024/2025', 32),
--   ('VII-B', 'VII',  '2024/2025', 30),
--   ('VIII-A', 'VIII', '2024/2025', 35),
--   ('IX-A',  'IX',   '2024/2025', 30);


-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SELESAI — Schema berhasil dibuat
-- Tabel  : profiles, kelas, siswa, absensi, nilai, jadwal
-- Trigger: auto updated_at, auto create profile saat register
-- Views  : view_siswa_kelas, view_rekap_absensi, view_rata_nilai
-- RLS    : aktif di semua tabel
-- ═══════════════════════════════════════════════════════════════════════════════
