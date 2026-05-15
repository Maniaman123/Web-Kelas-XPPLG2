import supabase from '../config/database.js';

// ─── GET Absensi (filter by kelas & tanggal) ──────────────────────────────────
export const getAbsensi = async (req, res) => {
  try {
    const { kelas_id, siswa_id, tanggal, bulan, tahun } = req.query;

    let query = supabase
      .from('absensi')
      .select(`
        *,
        siswa(id, nama, nis),
        kelas(id, nama_kelas)
      `)
      .order('tanggal', { ascending: false });

    if (kelas_id) query = query.eq('kelas_id', kelas_id);
    if (siswa_id) query = query.eq('siswa_id', siswa_id);
    if (tanggal)  query = query.eq('tanggal', tanggal);
    if (bulan && tahun) {
      const dari   = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const sampai = `${tahun}-${String(bulan).padStart(2, '0')}-31`;
      query = query.gte('tanggal', dari).lte('tanggal', sampai);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('[ABSENSI] getAbsensi:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data absensi.' });
  }
};

// ─── POST Catat Absensi (bulk untuk satu kelas satu hari) ─────────────────────
export const catatAbsensi = async (req, res) => {
  try {
    /**
     * Body: {
     *   kelas_id: "uuid",
     *   tanggal:  "2024-03-15",
     *   absensi:  [
     *     { siswa_id: "uuid", status: "hadir" | "sakit" | "izin" | "alpha", keterangan: "..." },
     *     ...
     *   ]
     * }
     */
    const { kelas_id, tanggal, absensi } = req.body;

    if (!kelas_id || !tanggal || !Array.isArray(absensi) || absensi.length === 0) {
      return res.status(400).json({
        error: 'kelas_id, tanggal, dan data absensi wajib diisi.',
      });
    }

    const validStatus = ['hadir', 'sakit', 'izin', 'alpha'];
    for (const item of absensi) {
      if (!validStatus.includes(item.status)) {
        return res.status(400).json({
          error: `Status tidak valid: "${item.status}". Pilih: hadir, sakit, izin, atau alpha.`,
        });
      }
    }

    const rows = absensi.map((item) => ({
      kelas_id,
      tanggal,
      siswa_id:   item.siswa_id,
      status:     item.status,
      keterangan: item.keterangan || null,
      dicatat_oleh: req.user.id,
    }));

    // Upsert: jika absensi hari itu sudah ada, update saja
    const { data, error } = await supabase
      .from('absensi')
      .upsert(rows, { onConflict: 'siswa_id,tanggal' })
      .select();

    if (error) throw error;

    res.status(201).json({ message: `Absensi ${tanggal} berhasil dicatat.`, data });
  } catch (err) {
    console.error('[ABSENSI] catatAbsensi:', err.message);
    res.status(500).json({ error: 'Gagal mencatat absensi.' });
  }
};

// ─── PUT Update Satu Data Absensi ─────────────────────────────────────────────
export const updateAbsensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;

    const { data, error } = await supabase
      .from('absensi')
      .update({ status, keterangan, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Data absensi tidak ditemukan.' });
    }

    res.json({ message: 'Absensi berhasil diperbarui.', data });
  } catch (err) {
    console.error('[ABSENSI] updateAbsensi:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui absensi.' });
  }
};

// ─── GET Rekap Absensi per Siswa ──────────────────────────────────────────────
export const getRekapAbsensi = async (req, res) => {
  try {
    const { siswa_id, bulan, tahun } = req.query;

    if (!siswa_id) {
      return res.status(400).json({ error: 'siswa_id wajib diisi.' });
    }

    let query = supabase
      .from('absensi')
      .select('status')
      .eq('siswa_id', siswa_id);

    if (bulan && tahun) {
      const dari   = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const sampai = `${tahun}-${String(bulan).padStart(2, '0')}-31`;
      query = query.gte('tanggal', dari).lte('tanggal', sampai);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rekap = data.reduce(
      (acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      },
      { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
    );

    rekap.total = data.length;

    res.json({ siswa_id, rekap });
  } catch (err) {
    console.error('[ABSENSI] getRekapAbsensi:', err.message);
    res.status(500).json({ error: 'Gagal mengambil rekap absensi.' });
  }
};
