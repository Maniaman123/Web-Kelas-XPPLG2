# 🚀 X PPLG 2 - The Digital Ecosystem

Website resmi kelas **X PPLG 2 (Pengembangan Perangkat Lunak dan Gim)** dari **SMK Negeri 1 Ciomas**. Proyek ini dirancang sebagai hub digital yang menggabungkan portofolio siswa, manajemen informasi kelas, dan pameran proyek teknologi dalam satu ekosistem modern.

## 🎨 Visi Desain
Proyek ini mengusung gaya **Bento Grid (Modern SaaS Style)** yang memberikan tampilan rapi, kotak-kotak fungsional, dan sangat informatif. Dengan estetika premium yang berfokus pada tipografi dan kontras warna yang dewasa.

*   **Font:** Plus Jakarta Sans (Modern & Clean).
*   **Warna Utama:**
    *   `Primary`: `#243B3C` (Deep Teal) - Memberikan kesan profesional dan tenang.
    *   `Secondary`: `#DCEEFA` (Light Azure) - Untuk latar belakang yang bersih dan airy.
    *   `Accent`: `#101828` (Rich Black) & `#667085` (Slate Gray).

## ✨ Fitur Utama (Frontend Logic)
Website ini tidak hanya sekadar pajangan, tetapi memiliki sistem fungsional (saat ini dijalankan via LocalStorage):

### 👤 Student Directory & Portal
*   **Directory Siswa:** Menampilkan 46 siswa (25 laki-laki, 21 perempuan) dengan fitur search dan filter gender.
*   **Profile Self-Edit:** Siswa yang sudah login dapat mengedit bio "About Me", link Instagram, GitHub, dan Portofolio mereka sendiri.
*   **Responsive Cards:** Kartu siswa yang adaptif, menampilkan informasi lengkap dengan transisi halus.

### 🛠 Admin Dashboard
*   **Account Management:** Halaman khusus admin untuk membuat akun siswa baru (Nama, No. Absen, Gender).
*   **Control Center:** Kelola jadwal pelajaran dan struktur organisasi kelas secara dinamis.

### 📂 Project & Gallery Showcase
*   **Software Gallery:** Menampilkan proyek software seperti **Dashboard-UMKM**.
*   **Hardware Lab:** Dokumentasi proyek **Arduino Uno** dan fisik computing lainnya.
*   **Cinematography:** Galeri khusus untuk karya foto dan video hasil kreatifitas tim kameramen kelas.

## 🛠 Tech Stack
Proyek ini dibangun menggunakan teknologi frontend modern untuk memastikan performa dan kemudahan pengembangan:

*   **Core:** [React.js](https://reactjs.org/) (Functional Components & Hooks).
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Utility-first framework terbaru).
*   **Icons:** [Lucide-React](https://lucide.dev/) (Clean & consistent icons).
*   **Animations:** [Framer Motion](https://www.framer.com/motion/) (Untuk interaksi bento grid yang smooth).
*   **Routing:** [React Router Dom](https://reactrouter.com/) (Manajemen navigasi halaman).
*   **State:** LocalStorage API (Simulasi database sementara di browser).

## 📱 Responsivitas
Website ini dioptimalkan untuk berbagai perangkat:
*   **Mobile:** 1-column stack untuk kenyamanan scrolling di layar kecil.
*   **Tablet:** 2-3 column grid layout.
*   **Desktop:** 4-5 column bento grid untuk efisiensi informasi di monitor besar.

## 🚀 Jalankan Secara Lokal
1.  Clone repositori ini:
    ```bash
    git clone [https://github.com/maniaman123/x-pplg-2-web.git](https://github.com/maniaman123/x-pplg-2-web.git)
    ```
2.  Masuk ke direktori:
    ```bash
    cd x-pplg-2-web
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Jalankan aplikasi:
    ```bash
    npm run dev
    ```

---

 Dikembangkan oleh **Team Coder X PPLG 2**.
 *Siswa X PPLG 2 - SMK Negeri 1 Ciomas*.