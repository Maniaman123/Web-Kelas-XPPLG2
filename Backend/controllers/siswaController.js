import supabase from '../config/database.js';

// ─── GET All Siswa ────────────────────────────────────────────────────────────
export const getAllSiswa = async (req, res) => {
  try {
    const { kelas_id, search } = req.query;

    let query = supabase
      .from('siswa')
      .select(`
        *,
        kelas(id, nama_kelas, tingkat, tahun_ajaran)
      `)
      .order('nama', { ascending: true });

    if (kelas_id) query = query.eq('kelas_id', kelas_id);
    if (search)   query = query.ilike('nama', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('[SISWA] getAllSiswa:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data siswa.' });
  }
};

// ─── GET Siswa by ID ──────────────────────────────────────────────────────────
export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('siswa')
      .select(`
        *,
        kelas(id, nama_kelas, tingkat, tahun_ajaran),
        absensi(*),
        nilai(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' });
    }

    res.json({ data });
  } catch (err) {
    console.error('[SISWA] getSiswaById:', err.message);
    res.status(500).json({ error: 'Gagal mengambil detail siswa.' });
  }
};

// ─── POST Create Siswa ────────────────────────────────────────────────────────
export const createSiswa = async (req, res) => {
  try {
    const { nama, nis, kelas_id, tanggal_lahir, jenis_kelamin, alamat, no_telp_ortu } = req.body;

    if (!nama || !nis || !kelas_id) {
      return res.status(400).json({ error: 'Nama, NIS, dan kelas_id wajib diisi.' });
    }

    // Cek NIS duplikat
    const { data: existing } = await supabase
      .from('siswa')
      .select('id')
      .eq('nis', nis)
      .single();

    if (existing) {
      return res.status(400).json({ error: `NIS ${nis} sudah terdaftar.` });
    }

    const { data, error } = await supabase
      .from('siswa')
      .insert({ nama, nis, kelas_id, tanggal_lahir, jenis_kelamin, alamat, no_telp_ortu })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Siswa berhasil ditambahkan.', data });
  } catch (err) {
    console.error('[SISWA] createSiswa:', err.message);
    res.status(500).json({ error: 'Gagal menambahkan siswa.' });
  }
};

// ─── PUT Update Siswa ─────────────────────────────────────────────────────────
export const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nis, kelas_id, tanggal_lahir, jenis_kelamin, alamat, no_telp_ortu } = req.body;

    const { data, error } = await supabase
      .from('siswa')
      .update({ nama, nis, kelas_id, tanggal_lahir, jenis_kelamin, alamat, no_telp_ortu, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' });
    }

    res.json({ message: 'Data siswa berhasil diperbarui.', data });
  } catch (err) {
    console.error('[SISWA] updateSiswa:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui data siswa.' });
  }
};

// ─── DELETE Siswa ─────────────────────────────────────────────────────────────
export const deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('siswa').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Siswa berhasil dihapus.' });
  } catch (err) {
    console.error('[SISWA] deleteSiswa:', err.message);
    res.status(500).json({ error: 'Gagal menghapus siswa.' });
  }
};

// ─── POST Pindah Kelas ────────────────────────────────────────────────────────
export const pindahKelas = async (req, res) => {
  try {
    const { id }           = req.params;
    const { kelas_id_baru } = req.body;

    if (!kelas_id_baru) {
      return res.status(400).json({ error: 'kelas_id_baru wajib diisi.' });
    }

    const { data, error } = await supabase
      .from('siswa')
      .update({ kelas_id: kelas_id_baru, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' });
    }

    res.json({ message: 'Siswa berhasil dipindahkan ke kelas baru.', data });
  } catch (err) {
    console.error('[SISWA] pindahKelas:', err.message);
    res.status(500).json({ error: 'Gagal memindahkan siswa.' });
  }
};
