export const projects = [
  {
    id: 1,
    name: 'Dashboard-UMKM',
    description:
      'Platform dashboard untuk membantu UMKM dalam mengelola bisnis mereka. Dilengkapi dengan fitur manajemen produk, laporan penjualan, dan analisis data pelanggan.',
    tech: ['React', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    status: 'In Progress',
    featured: true,
    contributors: 8,
  },
  {
    id: 2,
    name: 'Smart Classroom IoT',
    description:
      'Sistem IoT untuk monitoring suhu, kelembaban, dan kualitas udara di dalam kelas menggunakan Arduino Uno dan berbagai sensor.',
    tech: ['Arduino', 'C++', 'React', 'MQTT'],
    status: 'Active',
    featured: false,
    contributors: 4,
  },
  {
    id: 3,
    name: 'Class Portfolio Web',
    description:
      'Website portfolio kolektif kelas X PPLG 2 yang menampilkan karya-karya siswa dan informasi kelas.',
    tech: ['React', 'Tailwind CSS', 'Vite'],
    status: 'Active',
    featured: false,
    contributors: 3,
  },
  {
    id: 4,
    name: 'Game Platformer 2D',
    description:
      'Game platformer 2D berbasis web menggunakan Phaser.js dengan level design yang menarik dan karakter original.',
    tech: ['Phaser.js', 'JavaScript', 'Tiled'],
    status: 'Planning',
    featured: false,
    contributors: 5,
  },
];

export default projects;
