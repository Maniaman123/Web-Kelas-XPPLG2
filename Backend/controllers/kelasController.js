import supabase from '../config/database.js';

// ─── GET All Kelas ────────────────────────────────────────────────────────────
export const getAllKelas = async (req, res) => {
  try {
    const { tahun_ajaran, tingkat } = req.query;

    let query = supabase
      .from('kelas')
      .select(`
        id, nama_kelas, tingkat, tahun_ajaran, kapasitas, created_at,
        guru:profiles!kelas_guru_id_fkey(id, nama, email),
        siswa(count)
      `)
      .order('nama_kelas', { ascending: true });

    if (tahun_ajaran) query = query.eq('tahun_ajaran', tahun_ajaran);
    if (tingkat)      query = query.eq('tingkat', tingkat);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('[KELAS] getAllKelas:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data kelas.' });
  }
};

// ─── GET Kelas by ID ──────────────────────────────────────────────────────────
export const getKelasById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('kelas')
      .select(`
        *,
        guru:profiles!kelas_guru_id_fkey(id, nama, email),
        siswa(*),
        jadwal(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan.' });
    }

    res.json({ data });
  } catch (err) {
    console.error('[KELAS] getKelasById:', err.message);
    res.status(500).json({ error: 'Gagal mengambil detail kelas.' });
  }
};

// ─── POST Create Kelas ────────────────────────────────────────────────────────
export const createKelas = async (req, res) => {
  try {
    const { nama_kelas, tingkat, tahun_ajaran, guru_id, kapasitas } = req.body;

    if (!nama_kelas || !tingkat || !tahun_ajaran) {
      return res.status(400).json({
        error: 'nama_kelas, tingkat, dan tahun_ajaran wajib diisi.',
      });
    }

    const { data, error } = await supabase
      .from('kelas')
      .insert({ nama_kelas, tingkat, tahun_ajaran, guru_id, kapasitas: kapasitas || 30 })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Kelas berhasil dibuat.', data });
  } catch (err) {
    console.error('[KELAS] createKelas:', err.message);
    res.status(500).json({ error: 'Gagal membuat kelas.' });
  }
};

// ─── PUT Update Kelas ─────────────────────────────────────────────────────────
export const updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kelas, tingkat, tahun_ajaran, guru_id, kapasitas } = req.body;

    const { data, error } = await supabase
      .from('kelas')
      .update({ nama_kelas, tingkat, tahun_ajaran, guru_id, kapasitas, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan.' });
    }

    res.json({ message: 'Kelas berhasil diperbarui.', data });
  } catch (err) {
    console.error('[KELAS] updateKelas:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui kelas.' });
  }
};

// ─── DELETE Kelas ─────────────────────────────────────────────────────────────
export const deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('kelas').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Kelas berhasil dihapus.' });
  } catch (err) {
    console.error('[KELAS] deleteKelas:', err.message);
    res.status(500).json({ error: 'Gagal menghapus kelas.' });
  }
};
