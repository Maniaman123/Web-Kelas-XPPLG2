import 'dotenv/config';
import express    from 'express';
import cors       from 'cors';
import morgan     from 'morgan';

import authRoutes    from './routes/authRoutes.js';
import kelasRoutes   from './routes/kelasRoutes.js';
import siswaRoutes   from './routes/siswaRoutes.js';
import absensiRoutes from './routes/absensiRoutes.js';
import nilaiRoutes   from './routes/nilaiRoutes.js';
import jadwalRoutes  from './routes/jadwalRoutes.js';

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION — Cek ENV wajib sebelum server naik
// ═══════════════════════════════════════════════════════════════════════════════

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key] || process.env[key].includes('your-')) {
    console.error(`\n❌  ENV "${key}" belum diisi di file .env\n`);
    process.exit(1);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// APP SETUP
// ═══════════════════════════════════════════════════════════════════════════════

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware Global ─────────────────────────────────────────────────────────

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── API Routes ───────────────────────────────────────────────────────────────

const API = '/api';

app.use(`${API}/auth`,    authRoutes);
app.use(`${API}/kelas`,   kelasRoutes);
app.use(`${API}/siswa`,   siswaRoutes);
app.use(`${API}/absensi`, absensiRoutes);
app.use(`${API}/nilai`,   nilaiRoutes);
app.use(`${API}/jadwal`,  jadwalRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get(`${API}/health`, (_req, res) => {
  res.json({
    status:      'OK',
    supabase:    process.env.SUPABASE_URL,
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[SERVER ERROR]', err.stack ?? err.message);
  res.status(err.status ?? 500).json({
    error: err.message ?? 'Terjadi kesalahan pada server.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('  ┌──────────────────────────────────────────────────────────┐');
  console.log('  │            🏫  Kelas Web App — Backend API               │');
  console.log('  ├──────────────────────────────────────────────────────────┤');
  console.log(`  │  🟢 PORT      : ${String(PORT).padEnd(42)}               │`);
  console.log(`  │  🌍 ENV       : ${(process.env.NODE_ENV || 'development').padEnd(42)}│`);
  console.log(`  │  🔗 Supabase  : ${process.env.SUPABASE_URL.padEnd(42)}   │`);
  console.log(`  │  💻 Client    : ${(process.env.CLIENT_URL || 'http://localhost:5173').padEnd(42)}│`);
  console.log('  ├──────────────────────────────────────────────────────────┤');
  console.log('  │  📌 Endpoints tersedia:                                  │');
  console.log('  │     POST  /api/auth/register                             │');
  console.log('  │     POST  /api/auth/login                                │');
  console.log('  │     GET   /api/kelas                                     │');
  console.log('  │     GET   /api/siswa                                     │');
  console.log('  │     GET   /api/absensi                                   │');
  console.log('  │     GET   /api/nilai                                     │');
  console.log('  │     GET   /api/jadwal                                    │');
  console.log('  │     GET   /api/health                                    │');
  console.log('  └──────────────────────────────────────────────────────────┘');
  console.log('');
});