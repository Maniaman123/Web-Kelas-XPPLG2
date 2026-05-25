// src/data/projects.js
// Static project data for the BentoGrid / Home page showcase.
// Proyek nyata dari siswa dikelola di Firestore (koleksi 'projects').

const projects = [
  {
    id: 1,
    name: "Website X PPLG 2",
    description:
      "Platform ekosistem digital kelas X PPLG 2 — direktori talenta siswa, galeri proyek, dan portofolio kolektif berbasis Firebase.",
    tech: ["React", "Vite", "Tailwind CSS", "Firebase"],
    status: "Active",
    contributors: 46,
    featured: true,
  },
  {
    id: 2,
    name: "Smart IoT Monitoring",
    description: "Sistem monitoring suhu dan kelembaban ruang kelas berbasis Arduino.",
    tech: ["Arduino", "C++", "MQTT"],
    status: "Active",
    contributors: 8,
    featured: false,
  },
  {
    id: 3,
    name: "Mobile Attendance App",
    description: "Aplikasi absensi mobile untuk siswa dengan QR Code.",
    tech: ["Flutter", "Firebase", "Dart"],
    status: "In Progress",
    contributors: 5,
    featured: false,
  },
];

export default projects;
