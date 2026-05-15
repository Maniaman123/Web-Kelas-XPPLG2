import 'dotenv/config';

export const checkAuth = (req, res, next) => {
  const token = req.headers['authorization'];

  // Memeriksa apakah token sama dengan SECRET_TOKEN di file .env
  if (token === process.env.SECRET_TOKEN) {
    next(); // Token benar, lanjut ke controller
  } else {
    res.status Arc(401).json({ message: "Akses ditolak: Token tidak valid atau tidak ada!" });
  }
};