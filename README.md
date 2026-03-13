# SAGA Academy - Edutech Platform

SAGA Academy adalah platform edukasi digital modern yang dibangun menggunakan ekosistem Laravel dan React. Platform ini dirancang untuk memberikan pengalaman belajar yang interaktif dan manajemen konten yang mudah bagi administrator.

## 🚀 Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React with Inertia.js
- **Styling:** Tailwind CSS & Custom Vanilla CSS
- **Iconography:** Lucide React
- **Database:** MySQL / SQLite
- **Build Tool:** Vite

---

## 🛠️ Persiapan Instalasi (Lokal)

Pastikan Anda sudah menginstal:
1. **PHP >= 8.2**
2. **Composer**
3. **Node.js & NPM**
4. **Database Server** (MySQL/PostgreSQL/SQLite)

### Langkah-langkah Setup:

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd edutech
   ```

2. **Instal Dependensi Backend**
   ```bash
   composer install
   ```

3. **Instal Dependensi Frontend**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda.
   ```bash
   cp .env.example .env
   ```

5. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

6. **Jalankan Migrasi Database**
   ```bash
   php artisan migrate
   ```

7. **Jalankan Server Development**
   Gunakan perintah ini untuk menjalankan Laravel server dan Vite secara bersamaan:
   ```bash
   npm run dev
   ```
   Atau secara terpisah:
   - Server: `php artisan serve`
   - Assets: `npm run dev`

---

## 🌐 Panduan Deployment (Produksi)

Jika Anda ingin mendeploy project ini ke server (VPS/Shared Hosting), ikuti langkah-langkah berikut:

### 1. Persiapan Server
Pastikan server memenuhi requirement Laravel 12. Atur *Document Root* web server Anda ke folder `/public` dari project ini.

### 2. Konfigurasi Environment Produksi
Update file `.env` di server:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-anda.com
```

### 3. Instalasi Produksi
Jalankan perintah berikut di direktori project:
```bash
# Instal dependensi PHP tanpa dev-tools
composer install --optimize-autoloader --no-dev

# Build assets frontend untuk produksi
npm install
npm run build
```

### 4. Optimalisasi Laravel
Jalankan perintah ini untuk mempercepat performa di server:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Permission Folder
Pastikan folder `storage` dan `bootstrap/cache` dapat ditulis oleh web server:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data . # Tergantung user web server Anda
```

---

## 📁 Struktur Folder Utama
- `app/Http/Controllers/Admin`: Logika manajemen panel admin.
- `resources/js/Pages`: Komponen UI React (Admin & User).
- `resources/js/Components`: Komponen reusable (Sidebar, Navbar, dll).
- `routes/web.php`: Definisi rute aplikasi.

---

## 🛡️ Catatan Keamanan
Jangan pernah berkomit file `.env` ke repository publik. Pastikan `APP_DEBUG=false` di lingkungan produksi untuk menghindari kebocoran data sensitif.

---
Dikembangkan dengan ❤️ oleh **SAGA Team**.
