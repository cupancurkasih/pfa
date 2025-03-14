# Personal Financial Assistant (PFA) by CUPK

## Deskripsi Aplikasi

Personal Financial Assistant by CUPK merupakan aplikasi sederhana untuk membantu pengguna mengelola keuangan pribadi. Aplikasi ini memungkinkan pencatatan data pendapatan dan pengeluaran, penyajian ringkasan keuangan bulanan dan tahunan, serta penyajian laporan dan grafik tren keuangan. Aplikasi dibangun dengan HTML, CSS, JavaScript untuk antarmuka pengguna responsive (style desain UI neumorphism) dan SQLite untuk menyimpan data masing-masing pengguna.

## Fitur Utama

### Dashboard
- Menampilkan ringkasan keuangan bulanan dan tahunan
- Visualisasi grafik pendapatan dan pengeluaran
- Tabel rekap kategori dengan perhitungan persentase

### Manajemen Data
- **Pendapatan:** Form input untuk menambah data pendapatan (kategori, deskripsi, jumlah, tanggal) dan tabel yang menampilkan daftar pendapatan dengan opsi edit dan hapus
- **Pengeluaran:** Form input untuk menambah data pengeluaran (kategori, deskripsi, jumlah, tanggal) dan tabel daftar pengeluaran dengan opsi edit dan hapus

### Laporan
- Filter berdasarkan tanggal untuk menghasilkan laporan rinci
- Perbandingan antara alokasi ideal dan realisasi pengeluaran (rasio 40:30:20:10)
- Grafik tren jangka panjang
- Fitur ekspor laporan ke format XLS dan PDF

### User Management
- Fitur registrasi, login, dan logout menggunakan sistem autentikasi yang dikelola oleh Flask-Login
- Saat pendaftaran user, maka akan dibuat database SQLite dengan format nama file "username_pfa"
- Manajemen session dengan metode yang aman

## Teknologi yang Digunakan

- **Frontend:**
  - HTML5
  - CSS3 (Neumorphism Design Style)
  - JavaScript
  - Chart.js (untuk visualisasi data)

- **Backend:**
  - Python Flask (Web Framework)
  - Flask-Login (Autentikasi)
  - SQLite (Database)

## Cara Instalasi

### Prasyarat
- Python 3.7 atau lebih tinggi
- pip (Python package manager)

### Langkah-langkah Instalasi

1. Clone atau download repository ini

2. Buat dan aktifkan virtual environment (opsional tapi direkomendasikan)
   ```
   python -m venv venv
   source venv/bin/activate  # Untuk Linux/Mac
   venv\Scripts\activate     # Untuk Windows
   ```

3. Install semua dependencies
   ```
   pip install -r requirements.txt
   ```

4. Jalankan aplikasi
   ```
   python app.py
   ```

5. Akses aplikasi melalui browser di alamat http://127.0.0.1:5000

## Struktur Database

Aplikasi menggunakan SQLite sebagai database. Struktur database terdiri dari:

### Database Users
- Menyimpan data pengguna (username, email, password)

### Database PFA (per user)
- Tabel `income`: Menyimpan data pendapatan (tanggal, kategori, deskripsi, jumlah)
- Tabel `expense`: Menyimpan data pengeluaran (tanggal, kategori, deskripsi, jumlah)

## Penggunaan Aplikasi

1. **Registrasi dan Login**
   - Daftar akun baru dengan username, email, dan password
   - Login dengan username dan password

2. **Dashboard**
   - Melihat ringkasan keuangan pada halaman Dashboard
   - Melihat grafik perbandingan pendapatan dan pengeluaran
   - Melihat distribusi pengeluaran berdasarkan kategori

3. **Mengelola Pendapatan**
   - Tambah data pendapatan baru
   - Lihat daftar pendapatan
   - Edit atau hapus data pendapatan

4. **Mengelola Pengeluaran**
   - Tambah data pengeluaran baru
   - Lihat daftar pengeluaran
   - Edit atau hapus data pengeluaran

5. **Membuat Laporan**
   - Filter laporan berdasarkan rentang tanggal
   - Lihat perbandingan alokasi ideal vs realisasi pengeluaran
   - Ekspor laporan ke format XLS atau PDF

## Catatan Pengembangan

Aplikasi ini menggunakan prinsip alokasi keuangan 40:30:20:10 yang umum digunakan dalam pengelolaan keuangan pribadi:
- 40% untuk Kebutuhan Pokok
- 30% untuk Keinginan
- 20% untuk Tabungan/Investasi
- 10% untuk Amal/Donasi

## Kontribusi

Silakan berkontribusi pada pengembangan aplikasi ini dengan mengirimkan pull request atau membuka issue untuk saran dan perbaikan.

## Lisensi

Aplikasi ini bersifat open source dan dapat digunakan secara bebas untuk kepentingan pribadi atau pendidikan.

---

Dibuat dengan ❤️ oleh CUPK