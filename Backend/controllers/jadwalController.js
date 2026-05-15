import supabase from '../config/database.js';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ─── GET Jadwal (filter by kelas/hari/guru) ───────────────────────────────────
export const getJadwal = async (req, res) => {
  try {
    const { kelas_id, hari, guru_id, tahun_ajaran, semester } = req.query;

    let query = supabase
      .from('jadwal')
      .select(`
        *,
        kelas(id, nama_kelas, tingkat),
        guru:profiles!jadwal_guru_id_fkey(id, nama)
      `)
      .order('hari')
      .order('jam_mulai');

    if (kelas_id)     query = query.eq('kelas_id', kelas_id);
    if (hari)         query = query.eq('hari', hari);
    if (guru_id)      query = query.eq('guru_id', guru_id);
    if (tahun_ajaran) query = query.eq('tahun_ajaran', tahun_ajaran);
    if (semester)     query = query.eq('semester', semester);

    const { data, error } = await query;
    if (error) throw error;

    // Kelompokkan per hari
    const grouped = HARI.reduce((acc, h) => {
      acc[h] = data.filter((j) => j.hari === h);
      return acc;
    }, {});

    res.json({ data, grouped, total: data.length });
  } catch (err) {
    console.error('[JADWAL] getJadwal:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data jadwal.' });
  }
};

// ─── POST Create Jadwal ───────────────────────────────────────────────────────
export const createJadwal = async (req, res) => {
  try {
    const { kelas_id, guru_id, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, semester, tahun_ajaran } = req.body;

    if (!kelas_id || !mata_pelajaran || !hari || !jam_mulai || !jam_selesai || !semester || !tahun_ajaran) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    if (!HARI.includes(hari)) {
      return res.status(400).json({ error: `Hari tidak valid. Pilih: ${HARI.join(', ')}.` });
    }

    // Cek konflik jadwal (kelas yang sama, hari yang sama, jam bentrok)
    const { data: konflik } = await supabase
      .from('jadwal')
      .select('id, mata_pelajaran, jam_mulai, jam_selesai')
      .eq('kelas_id', kelas_id)
      .eq('hari', hari)
      .eq('semester', semester)
      .eq('tahun_ajaran', tahun_ajaran)
      .lt('jam_mulai', jam_selesai)
      .gt('jam_selesai', jam_mulai);

    if (konflik && konflik.length > 0) {
      return res.status(409).json({
        error: 'Terjadi konflik jadwal pada kelas dan waktu yang sama.',
        konflik,
      });
    }

    const { data, error } = await supabase
      .from('jadwal')
      .insert({ kelas_id, guru_id, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, semester, tahun_ajaran })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Jadwal berhasil dibuat.', data });
  } catch (err) {
    console.error('[JADWAL] createJadwal:', err.message);
    res.status(500).json({ error: 'Gagal membuat jadwal.' });
  }
};

// ─── PUT Update Jadwal ────────────────────────────────────────────────────────
export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { guru_id, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan } = req.body;

    const { data, error } = await supabase
      .from('jadwal')
      .update({ guru_id, mata_pelajaran, hari, jam_mulai, jam_selesai, ruangan, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
    }

    res.json({ message: 'Jadwal berhasil diperbarui.', data });
  } catch (err) {
    console.error('[JADWAL] updateJadwal:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui jadwal.' });
  }
};

// ─── DELETE Jadwal ────────────────────────────────────────────────────────────
export const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('jadwal').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Jadwal berhasil dihapus.' });
  } catch (err) {
    console.error('[JADWAL] deleteJadwal:', err.message);
    res.status(500).json({ error: 'Gagal menghapus jadwal.' });
  }
};
