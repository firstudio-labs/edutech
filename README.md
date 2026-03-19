# JAGGAD ACADEMY - Platform Edukasi Digital

Platform edukasi digital modern yang dibangun menggunakan ekosistem **Laravel 12** + **React (Inertia.js)**. Dilengkapi dengan integrasi Midtrans Payment Gateway, Google OAuth, dan sistem CMS Admin yang lengkap.

## 🚀 Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Laravel 12 (PHP 8.2+) |
| **Frontend** | React 18 + Inertia.js |
| **Styling** | Custom Vanilla CSS + Tailwind CSS |
| **Database** | MySQL (Produksi) / SQLite (Lokal) |
| **Payment** | Midtrans (QRIS, VA, Kartu, E-wallet) |
| **Auth** | Session + Google OAuth (Socialite) |
| **Build** | Vite + fast-glob (per-page CSS splitting) |

---

## 🛠️ Setup Lokal (Development)

### Prasyarat
- PHP >= 8.2
- Composer
- Node.js >= 18 & NPM
- Database Server (MySQL atau SQLite)

### Langkah-langkah:

```bash
# 1. Clone repository
git clone <repository-url>
cd edutech

# 2. Instal dependensi PHP
composer install

# 3. Instal dependensi Node.js
npm install

# 4. Salin & konfigurasi environment
cp .env.example .env
php artisan key:generate

# 5. Set database di .env, lalu jalankan migrasi + seeder
php artisan migrate
php artisan db:seed --class=InitialDataSeeder

# 6. Buat symlink storage
php artisan storage:link

# 7. Jalankan server (dua terminal terpisah)
php artisan serve
npm run dev
```

**Akun default setelah seeder:**
| Email | Password | Role |
|---|---|---|
| `admin@jaggad.id` | `password` | Admin |
| `user@gmail.com` | `password` | Customer |

---

## 🌐 Panduan Deployment (Produksi)

### 1. Persyaratan Server
- PHP >= 8.2 dengan ekstensi: `curl`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`
- Composer & Node.js >= 18
- Web server: **Nginx** atau Apache
- Document Root diarahkan ke folder `/public`

---

### 2. Upload Kode ke Server
```bash
# Clone atau pull dari repository
git clone <repository-url> /var/www/jaggad
# atau jika sudah ada:
git pull origin main
```

---

### 3. Konfigurasi File `.env`

Buat file `.env` di server dan isi nilai berikut:

```env
APP_NAME="JAGGAD ACADEMY"
APP_ENV=production
APP_KEY=           # Di-generate otomatis oleh artisan
APP_DEBUG=false
APP_URL=https://domain-anda.com

# Database (WAJIB - ganti ke MySQL di produksi)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jaggad_db
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Session & Cache
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

# Storage (agar URL aset benar)
FILESYSTEM_DISK=public
```

> [!IMPORTANT]
> **Jangan isi Midtrans/Google Key di `.env`**. Kedua kredensial ini dikelola lewat **Dashboard Admin > Settings** agar bisa diubah tanpa deploy ulang.

---

### 4. Instal Dependensi & Build Aset

```bash
cd /var/www/jaggad

# Instal PHP dependencies (tanpa dev tools)
composer install --no-dev --optimize-autoloader

# Instal Node.js dependencies
npm install

# Build aset frontend untuk produksi
# (PENTING: Setiap halaman akan dibuatkan CSS-nya sendiri untuk mencegah tampilan rusak saat refresh)
npm run build
```

---

### 5. Generate Key & Setup Database

```bash
# Generate application key
php artisan key:generate

# Jalankan semua migrasi
php artisan migrate --force

# Isi data awal (kategori, produk, metode bayar, admin, dll)
php artisan db:seed --class=InitialDataSeeder

# Buat symlink untuk storage publik
php artisan storage:link
```

---

### 6. Konfigurasi Izin Folder

```bash
# Berikan izin tulis pada folder yang dibutuhkan Laravel
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data /var/www/jaggad  # Sesuaikan dengan user web server Anda
```

---

### 7. Optimasi Cache Laravel

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

### 8. Konfigurasi Nginx (Contoh)

```nginx
server {
    listen 80;
    server_name domain-anda.com;
    root /var/www/jaggad/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

### 9. Konfigurasi API via Dashboard Admin

Setelah aplikasi online:

1. Login sebagai Admin (`admin@jaggad.id`)
2. Buka menu **Settings** di sidebar Admin
3. Isi **Midtrans Server Key** dan **Client Key** (dari dashboard.midtrans.com)
4. Isi credensial **Google OAuth** (jika menggunakan Login Google)
5. Klik **Simpan**

> [!NOTE]
> Sistem menggunakan "self-healing": begitu Midtrans Client Key terdeteksi terisi, sistem akan **otomatis** membuat entri Midtrans di daftar metode pembayaran. Anda tidak perlu input manual.

> [!IMPORTANT]
> Webhook Midtrans harus mengarah ke: `https://domain-anda.com/midtrans/webhook`
> URL ini sudah dikecualikan dari proteksi CSRF secara otomatis.

---

## 🔄 Update Kode (setelah deploy awal)

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan migrate --force
php artisan optimize
```

---

## 🚑 Troubleshooting

| Masalah | Solusi |
|---|---|
| **Tampilan rusak saat refresh** | Pastikan `npm run build` sudah dijalankan ulang setelah pull. Vite menggunakan per-page CSS splitting. |
| **Produk 404 saat diklik** | Jalankan perintah fix slug di bawah — produk lama mungkin tidak punya slug |
| **Midtrans belum dikonfigurasi** | Buka Admin > Settings, isi Server Key & Client Key, lalu simpan. Refresh halaman Checkout. |
| **Error 500 setelah migrate** | Jalankan `php artisan config:clear && php artisan cache:clear` lalu coba lagi. |
| **Gambar tidak muncul** | Pastikan `php artisan storage:link` sudah dijalankan. |
| **Google Login tidak berfungsi** | Isi Google Client ID/Secret di Admin > Settings. Verifikasi redirect URL di Google Cloud Console. |
| **File Permission Error** | `chmod -R 775 storage bootstrap/cache` |
| **Webhook Midtrans tidak bekerja** | Pastikan URL webhook di dashboard Midtrans sudah benar dan server bisa diakses publik. |

### 🛠 Fix Produk 404 (Slug Kosong)

Jika produk sudah ada di database **sebelum migrasi slug** ditambahkan, kolom slug-nya bisa kosong dan menyebabkan error 404. Jalankan perintah berikut di server untuk memperbaikinya:

```bash
php artisan tinker --execute="App\Models\Product::all()->each(function(\$p) { if(empty(\$p->slug)) { \$p->slug = Illuminate\Support\Str::slug(\$p->name); \$p->saveQuietly(); echo 'Fixed: '.\$p->name.PHP_EOL; } });"
```

Atau jika menggunakan Windows (Command Prompt):
```bash
php artisan tinker
App\Models\Product::all()->each(function($p) { if(empty($p->slug)) { $p->slug = Illuminate\Support\Str::slug($p->name); $p->saveQuietly(); echo 'Fixed: '.$p->name."\n"; } });
exit
```

---

## 📁 Struktur Direktori Penting

```
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Logika panel admin
│   │   ├── CheckoutController.php  # Alur pembayaran Midtrans
│   │   └── MidtransWebhookController.php  # Handler callback Midtrans
│   ├── Models/             # Model Eloquent
│   └── Providers/
│       └── AppServiceProvider.php  # Konfigurasi Midtrans & Google dinamis
├── database/
│   ├── migrations/         # Semua skema database
│   └── seeders/
│       └── InitialDataSeeder.php  # Data awal aplikasi
├── resources/js/
│   ├── Pages/              # Komponen halaman React (Admin & User)
│   ├── Layouts/            # Layout utama (Admin, Main)
│   └── Styles/             # File CSS global dan variabel
├── routes/
│   └── web.php             # Definisi semua rute
└── vite.config.js          # Konfigurasi build (per-page CSS splitting)
```

---

## 🛡️ Catatan Keamanan

- **Jangan commit `.env`** ke repository publik — sudah di-exclude di `.gitignore`
- **APP_DEBUG=false** wajib di produksi untuk mencegah kebocoran informasi sensitif
- **Kredesial API** (Midtrans, Google) dikelola via database Admin, bukan file `.env`
- **Webhook Midtrans** diverifikasi menggunakan signature key secara otomatis

---

*Dikembangkan oleh **JAGGAD ACADEMY Team** | Terakhir diperbarui: 19 Maret 2026*
