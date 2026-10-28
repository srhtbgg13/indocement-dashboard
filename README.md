# Indocement Financial Dashboard

Dashboard interaktif untuk melihat **arus kas operasional dan kinerja keuangan PT Indocement Tunggal Prakarsa Tbk** berdasarkan laporan keuangan kuartalan tahun 2016–2025.

Proyek ini dibuat sebagai bagian dari tugas akhir saya di bidang Sistem Informasi.

**[🔗 Lihat demo dashboard](https://srhtbgg13.github.io/indocement-dashboard/)** · Pilih tab **Guest** untuk masuk.

![Tampilan dashboard](dashboard\dashboard.jpeg)

> **Catatan:** Proyek ini menggunakan laporan keuangan yang tersedia untuk publik dan dibuat untuk keperluan akademik. Proyek ini tidak berafiliasi dengan PT Indocement.

---

## Tentang Proyek

Laporan keuangan PT Indocement tersedia dalam bentuk PDF untuk setiap periode. Untuk membandingkan angka dari tahun atau kuartal yang berbeda, pengguna perlu membuka beberapa laporan secara terpisah.

Dashboard ini membantu pengguna melihat data keuangan dalam satu tempat. Pengguna dapat memilih tahun dan kuartal, melihat perubahan dari waktu ke waktu, serta membandingkan beberapa indikator keuangan.

Proyek ini menggunakan **metode prototype** dan dikembangkan melalui enam tahap perbaikan. Pengembangannya melibatkan wawancara dengan tim Asset and Equity Management serta masukan dari tim Investor Relations PT Indocement. Hasil penelitian juga disusun menjadi artikel jurnal.

**Pekerjaan yang dilakukan:**

- Mengambil data dari laporan keuangan PDF tahun 2016–2025, mengolahnya, lalu menyimpannya ke MySQL melalui proses ETL.
- Memeriksa kembali data di database agar sesuai dengan laporan keuangan asli.
- Membuat tampilan dashboard, database, dan backend untuk mendukung analisis keuangan.
- Mengatur hak akses pengguna menggunakan JWT dan membuat proses persetujuan sebelum perubahan data diterapkan.
- Menguji 25 skenario fungsi aplikasi dengan Blackbox Testing. Semua skenario dinyatakan valid.

> **Catatan versi:** Artikel jurnal membahas versi awal dashboard yang menggunakan Metabase dan *secure embedding* JWT. Versi dalam repositori ini menggunakan Chart.js dan API Flask, dengan halaman dan indikator yang tetap sama.

## Halaman Dashboard

| Halaman | Informasi yang ditampilkan |
|---|---|
| **Financial Overview** | Ringkasan arus kas operasi (CFO), laba bersih, arus kas bebas (FCF), perubahan dari tahun sebelumnya, serta grafik dan tabel ringkasan. |
| **Resource Overview** | Perbandingan arus kas dari aktivitas operasi, investasi, dan pendanaan, termasuk total uang masuk dan keluar. |
| **Cash Flow Health** | Perbandingan laba bersih dengan arus kas operasi untuk melihat hubungan antara laba dan kas yang dihasilkan. |
| **Margin Analysis** | Gross Margin, EBITDA Margin, dan Net Margin per kuartal serta perubahannya dari tahun 2016–2025. |
| **Balance Sheet Performance** | Total aset, ekuitas, kas, komponen aset, serta perbandingan ekuitas dan liabilitas. |
| **Key Financial Indicators** | Rasio keuangan DER, Net Debt to EBITDA, Working Capital Ratio, ROA, ROE, dan ROCE. |
| **Financial Report** | Dokumen laporan keuangan dalam format PDF. |

## Dua Versi Aplikasi

Dashboard tersedia dalam dua versi:

| | **Demo online (GitHub Pages)** | **Versi lengkap (lokal)** |
|---|---|---|
| Cara kerja | Menggunakan data yang sudah disimpan dalam `data/snapshot.json` | Menggunakan Flask dan MySQL |
| Akses | Guest, hanya untuk melihat data | Admin, Manajemen, dan Visitor |
| Fitur | Melihat dashboard dan menggunakan filter | Semua fitur dashboard, ditambah login, pengelolaan data, persetujuan, riwayat aktivitas, dan notifikasi |
| Hosting | Gratis | Memerlukan server dan database |

Angka yang ditampilkan pada demo online berasal dari hasil API versi lengkap, sehingga datanya sama. Fitur untuk mengubah data tidak tersedia dalam mode demo.

## Fitur Versi Lengkap

- **Hak akses pengguna:** Admin, Manajemen, dan Visitor memiliki akses sesuai perannya.
- **Keamanan login:** Menggunakan JWT dan bcrypt untuk melindungi kata sandi.
- **Persetujuan perubahan data:** Data yang diajukan Admin harus disetujui atau ditolak oleh Manajemen sebelum diterapkan.
- **Riwayat aktivitas (audit log):** Mencatat aktivitas pengguna dalam aplikasi.
- **Notifikasi:** Memberikan informasi tentang pengajuan dan keputusan persetujuan.
- **Insight Notes:** Catatan analisis yang dapat dibuat oleh Manajemen.
- **Banner Pengumuman:** Menampilkan informasi atau pengumuman pada aplikasi.
- **Unggah laporan:** Mendukung dokumen laporan keuangan PDF.
- **Filter tahun dan kuartal:** Memudahkan pengguna memilih periode analisis.

## Teknologi yang Digunakan

| Bagian | Teknologi |
|---|---|
| Tampilan dashboard | HTML, CSS, JavaScript, [Chart.js](https://www.chartjs.org/) 4.4 |
| Backend / API | Python, Flask, Flask-CORS |
| Database | MySQL (PyMySQL) |
| Keamanan | JWT (PyJWT), bcrypt, dan konfigurasi `.env` |
| Demo online | GitHub Pages, `demo-shim.js`, `export_static.py` |

## Cara Kerja Demo Online

Demo online dapat digunakan tanpa menjalankan server Flask atau database MySQL.

1. `export_static.py` mengambil data dari API untuk setiap pilihan tahun dan kuartal, lalu menyimpannya ke `data/snapshot.json`.
2. `demo-shim.js` membuat dashboard membaca data dari file tersebut sebagai pengganti permintaan ke API.
3. Pengguna hanya dapat melihat data melalui tab Guest. Fitur yang mengubah data dinonaktifkan.

Dengan cara ini, tampilan dashboard tetap dapat digunakan tanpa mengubah kode utama di `script.js`.

## Cara Menjalankan di Komputer

**Persiapan:** Python 3.10 atau lebih baru dan MySQL.

**1. Instal library yang dibutuhkan**

```bash
pip install flask flask-cors pymysql bcrypt pyjwt python-dotenv
```

**2. Siapkan konfigurasi database dan keamanan**

Buat file `.env` dengan mengikuti `.env.example`, lalu isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, dan `JWT_SECRET` sesuai pengaturan komputer.

**3. Jalankan aplikasi**

```bash
python app.py
```

Buka `http://127.0.0.1:5000` di browser.

**Memperbarui data demo online:**

Jika data berubah, jalankan:

```bash
python export_static.py
```

Kemudian *commit* dan *push* folder `data/` ke repositori GitHub.

## Struktur Proyek

```text
├── index.html          # Halaman dashboard
├── script.js           # Logika tampilan dan grafik
├── style.css           # Pengaturan tampilan
├── demo-shim.js        # Membaca data untuk demo online
├── app.py              # Backend Flask dan API
├── export_static.py    # Membuat data untuk demo online
├── data/snapshot.json  # Data yang digunakan demo
├── files/              # Dokumen laporan keuangan
└── docs/               # Gambar dan dokumentasi
```

## Pengujian dan Validasi

- **Pemeriksaan data:** Nilai dalam database dibandingkan kembali dengan laporan keuangan asli, termasuk contoh data arus kas kuartal I 2023 dan posisi keuangan kuartal I 2020.
- **Pengujian aplikasi:** Dilakukan 25 skenario Blackbox Testing, meliputi login dan hak akses, grafik dan filter, pengelolaan dan persetujuan data, fitur pendukung, serta notifikasi dan registrasi. Semua skenario valid.
- **Evaluasi pengguna:** Dashboard diperlihatkan kepada tim PT Indocement dan diperbaiki melalui enam iterasi berdasarkan masukan yang diterima.

## Sumber Data

Data berasal dari laporan keuangan publik PT Indocement Tunggal Prakarsa Tbk yang diterbitkan untuk Bursa Efek Indonesia. Seluruh data dalam proyek ini menggunakan laporan yang tersedia untuk publik.

## Penulis
**Sarah Lamtua Tobing**

[GitHub](https://github.com/srhtbgg13) · [Email](sarahtbg13@gmail.com)