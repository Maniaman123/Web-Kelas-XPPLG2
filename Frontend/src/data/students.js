// src/data/students.js
// Default seed data for development/initialization.
// After first load, data is managed by LocalStorage via Admin Dashboard.

export const roles = [
  { label: "Frontend Dev", color: "bg-blue-100 text-blue-700" },
  { label: "Backend Dev", color: "bg-emerald-100 text-emerald-700" },
  { label: "UI/UX Designer", color: "bg-purple-100 text-purple-700" },
  { label: "Game Dev", color: "bg-amber-100 text-amber-700" },
  { label: "IoT Specialist", color: "bg-rose-100 text-rose-700" },
  { label: "Fullstack Dev", color: "bg-cyan-100 text-cyan-700" },
  { label: "Cameraman", color: "bg-pink-100 text-pink-700" },
  { label: "Mobile Dev", color: "bg-orange-100 text-orange-700" },
];

export const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-pink-500", "bg-orange-500",
  "bg-teal-500", "bg-indigo-500", "bg-lime-500", "bg-fuchsia-500",
];

export function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Keeping a small list as seed, but Admin can add more via dashboard
export const seedStudents = [
  { id: 'seed-1', name: 'Reyhan Saputra', gender: 'L', absentNumber: 1, role: roles[0], avatarColor: avatarColors[0], about: '', ig: '', github: '', portfolio: '' }
];

export default seedStudents;
