# Candaria

Aplikasi web berbasis Laravel + React (Inertia.js) + Tailwind CSS dengan dukungan PWA.

## Requirement

Pastikan sudah terinstall:

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x
- **Git**

> Database menggunakan **SQLite** — tidak perlu install MySQL/PostgreSQL.

---

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/rey-hub1/candaria.git
cd candaria
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node dependencies

```bash
npm install
```

### 4. Setup environment

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Setup database

```bash
touch database/database.sqlite
php artisan migrate --seed
```

### 6. Jalankan aplikasi

Buka **2 terminal** secara bersamaan:

**Terminal 1 — Backend:**
```bash
php artisan serve
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

### 7. Buka di browser

```
http://localhost:8000
```

---

## Build untuk production

```bash
npm run build
php artisan optimize
```

## Tech Stack

- **Backend:** Laravel 13
- **Frontend:** React + Inertia.js
- **Styling:** Tailwind CSS v4
- **Database:** SQLite
- **Build Tool:** Vite
