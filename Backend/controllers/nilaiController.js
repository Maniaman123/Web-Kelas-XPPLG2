import supabase from '../config/database.js';

// ─── GET Nilai (filter by siswa/kelas/mata pelajaran) ─────────────────────────
export const getNilai = async (req, res) => {
  try {
    const { siswa_id, kelas_id, mata_pelajaran, semester, tahun_ajaran } = req.query;

    let query = supabase
      .from('nilai')
      .select(`
        *,
        siswa(id, nama, nis),
        kelas(id, nama_kelas)
      `)
      .order('created_at', { ascending: false });

    if (siswa_id)      query = query.eq('siswa_id', siswa_id);
    if (kelas_id)      query = query.eq('kelas_id', kelas_id);
    if (mata_pelajaran) query = query.eq('mata_pelajaran', mata_pelajaran);
    if (semester)      query = query.eq('semester', semester);
    if (tahun_ajaran)  query = query.eq('tahun_ajaran', tahun_ajaran);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('[NILAI] getNilai:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data nilai.' });
  }
};

// ─── POST Input Nilai (bulk per kelas) ───────────────────────────────────────
export const inputNilai = async (req, res) => {
  try {
    /**
     * Body: {
     *   kelas_id: "uuid",
     *   mata_pelajaran: "Matematika",
     *   jenis_ujian: "UTS" | "UAS" | "Harian" | "Tugas",
     *   semester: 1 | 2,
     *   tahun_ajaran: "2024/2025",
     *   nilai_list: [
     *     { siswa_id: "uuid", nilai: 85, keterangan: "..." },
     *   ]
     * }
     */
    const { kelas_id, mata_pelajaran, jenis_ujian, semester, tahun_ajaran, nilai_list } = req.body;

    if (!kelas_id || !mata_pelajaran || !jenis_ujian || !semester || !tahun_ajaran || !Array.isArray(nilai_list)) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    const rows = nilai_list.map((item) => ({
      kelas_id,
      siswa_id:       item.siswa_id,
      mata_pelajaran,
      jenis_ujian,
      semester,
      tahun_ajaran,
      nilai:          item.nilai,
      keterangan:     item.keterangan || null,
      diinput_oleh:   req.user.id,
    }));

    const { data, error } = await supabase
      .from('nilai')
      .upsert(rows, { onConflict: 'siswa_id,mata_pelajaran,jenis_ujian,semester,tahun_ajaran' })
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Nilai berhasil diinput.', data });
  } catch (err) {
    console.error('[NILAI] inputNilai:', err.message);
    res.status(500).json({ error: 'Gagal menginput nilai.' });
  }
};

// ─── PUT Update Nilai ─────────────────────────────────────────────────────────
export const updateNilai = async (req, res) => {
  try {
    const { id } = req.params;
    const { nilai, keterangan } = req.body;

    if (nilai === undefined) {
      return res.status(400).json({ error: 'Field nilai wajib diisi.' });
    }

    if (nilai < 0 || nilai > 100) {
      return res.status(400).json({ error: 'Nilai harus antara 0 - 100.' });
    }

    const { data, error } = await supabase
      .from('nilai')
      .update({ nilai, keterangan, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Data nilai tidak ditemukan.' });
    }

    res.json({ message: 'Nilai berhasil diperbarui.', data });
  } catch (err) {
    console.error('[NILAI] updateNilai:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui nilai.' });
  }
};

// ─── GET Rapor / Rata-rata Nilai per Siswa ────────────────────────────────────
export const getRaporSiswa = async (req, res) => {
  try {
    const { siswa_id, semester, tahun_ajaran } = req.query;

    if (!siswa_id || !semester || !tahun_ajaran) {
      return res.status(400).json({ error: 'siswa_id, semester, dan tahun_ajaran wajib diisi.' });
    }

    const { data, error } = await supabase
      .from('nilai')
      .select('mata_pelajaran, jenis_ujian, nilai')
      .eq('siswa_id', siswa_id)
      .eq('semester', semester)
      .eq('tahun_ajaran', tahun_ajaran);

    if (error) throw error;

    // Kelompokkan & rata-rata per mata pelajaran
    const grouped = data.reduce((acc, row) => {
      if (!acc[row.mata_pelajaran]) acc[row.mata_pelajaran] = [];
      acc[row.mata_pelajaran].push(row.nilai);
      return acc;
    }, {});

    const rapor = Object.entries(grouped).map(([mapel, nilaiArr]) => ({
      mata_pelajaran: mapel,
      nilai_detail:   nilaiArr,
      rata_rata:      (nilaiArr.reduce((a, b) => a + b, 0) / nilaiArr.length).toFixed(1),
    }));

    const rata_keseluruhan = rapor.length
      ? (rapor.reduce((a, b) => a + parseFloat(b.rata_rata), 0) / rapor.length).toFixed(1)
      : 0;

    res.json({ siswa_id, semester, tahun_ajaran, rapor, rata_keseluruhan });
  } catch (err) {
    console.error('[NILAI] getRaporSiswa:', err.message);
    res.status(500).json({ error: 'Gagal mengambil rapor siswa.' });
  }
};
