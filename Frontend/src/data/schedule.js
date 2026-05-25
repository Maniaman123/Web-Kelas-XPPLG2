// src/data/schedule.js
// Jadwal pelajaran kelas X PPLG 2 SMK Negeri 1 Ciomas.
// Ditampilkan di ScheduleCard pada BentoGrid / Home page.

const schedule = [
  {
    day: "Sen",
    subjects: [
      { time: "07:00 - 08:30", name: "Matematika",                teacher: "Ibu Ratna" },
      { time: "08:30 - 10:00", name: "Bahasa Indonesia",          teacher: "Ibu Sari" },
      { time: "10:15 - 11:45", name: "Pemrograman Web",           teacher: "Bpk. Hendra" },
      { time: "12:30 - 14:00", name: "Basis Data",                teacher: "Ibu Dewi" },
    ],
  },
  {
    day: "Sel",
    subjects: [
      { time: "07:00 - 08:30", name: "Bahasa Inggris",            teacher: "Ibu Linda" },
      { time: "08:30 - 10:00", name: "Desain Grafis",             teacher: "Bpk. Andi" },
      { time: "10:15 - 11:45", name: "Pemrograman Berorientasi Objek", teacher: "Bpk. Hendra" },
      { time: "12:30 - 14:00", name: "Pendidikan Pancasila",      teacher: "Ibu Wati" },
    ],
  },
  {
    day: "Rab",
    subjects: [
      { time: "07:00 - 08:30", name: "Fisika",                    teacher: "Bpk. Surya" },
      { time: "08:30 - 10:00", name: "Pemrograman Mobile",        teacher: "Bpk. Rizky" },
      { time: "10:15 - 11:45", name: "Jaringan Komputer",         teacher: "Bpk. Fajar" },
      { time: "12:30 - 14:00", name: "Sistem Operasi",            teacher: "Bpk. Hendra" },
    ],
  },
  {
    day: "Kam",
    subjects: [
      { time: "07:00 - 08:30", name: "Matematika",                teacher: "Ibu Ratna" },
      { time: "08:30 - 10:00", name: "Bahasa Indonesia",          teacher: "Ibu Sari" },
      { time: "10:15 - 11:45", name: "Kewirausahaan",             teacher: "Ibu Mega" },
      { time: "12:30 - 14:00", name: "Projek Kreatif",            teacher: "Bpk. Andi" },
    ],
  },
  {
    day: "Jum",
    subjects: [
      { time: "07:00 - 08:00", name: "Pendidikan Agama",          teacher: "Bpk. Yusuf" },
      { time: "08:00 - 09:30", name: "Olahraga",                  teacher: "Bpk. Dani" },
      { time: "09:45 - 11:15", name: "Bahasa Inggris",            teacher: "Ibu Linda" },
    ],
  },
];

export default schedule;
