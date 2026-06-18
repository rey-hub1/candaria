# Auth & Roles

User roles and route access control.

## Key files
- `app/Models/User.php` — `role` column, `isAdmin()`, `isCashier()`
- `app/Http/Middleware/RoleMiddleware.php` — `role:admin,cashier` route middleware
- `app/Http/Middleware/HandleInertiaRequests.php` — shares `auth.user` (id, name, email, role) and global `settings` to all pages
- `routes/web.php` — route groups per role

## How it works
- Single `users` table, `role` enum-ish string column (`admin`, `cashier` currently).
- `RoleMiddleware::handle()` checks `$request->user()->role` against allowed list passed via middleware param (e.g. `role:admin`); aborts 403 if not allowed.
- Routes nested in `middleware(['auth'])` group, then sub-grouped by `role:...`.
- Inertia shares current user's role on every page via `auth.user.role` — frontend uses this to conditionally render nav items.

## Gotchas
- No granular permissions — role checks are hardcoded role-name lists per route group.
- `UserController::index()` filters to `whereIn('role', ['admin','cashier'])` — User Management page only manages those roles (its form/validation only accepts `admin`/`cashier`). `penitip` accounts (auto-created by `SellerController`) are managed via `Sellers`, not here.
- Sidebar (`AuthenticatedLayout.jsx` `renderSidebarLinks()`) has a `role === 'penitip'` branch (Profile + Ekspor Laporan), parity with the mobile bottom-nav.
- Roles now include `super_admin`, `vendor`, `student` (added for marketplace expansion) alongside `admin`, `cashier`, `penitip`. `User` has `isSuperAdmin()`, `isVendor()`, `isStudent()` helpers, plus `vendor()`/`student()` relations.
- `RoleMiddleware` short-circuits: if `role === 'super_admin'`, request always passes regardless of the `role:...` list — super admin has access to everything admin has, plus `/super-admin/*` routes (`role:super_admin` only).
- `DashboardController::index()` redirects `vendor` → `vendor.dashboard` and `student` → `student.dashboard` (or `student.password.change` if `must_change_password`) before running any admin/cashier-specific queries.
- Student accounts: see `context/student-accounts.md`.

## Session / login durasi (PWA)
- Auth = Laravel session-based (cookie `http_only`, driver `database`, tabel `sessions`). Login pakai email/phone (`LoginRequest::authenticate`), support remember-me.
- `SESSION_LIFETIME=129600` (90 hari/3 bulan sliding) + `SESSION_EXPIRE_ON_CLOSE=false` → PWA student/penitip/vendor tetap login lama walau app ditutup.
- `app/Http/Middleware/IdleTimeout.php` (di web group, sebelum `HandleInertiaRequests`) memaksa idle-timeout lebih pendek untuk role staff (`super_admin`/`admin`/`cashier` = 30 hari/1 bulan) via session key `last_activity_at`; lewat batas → `Auth::logout()` + redirect login. Role lain (penitip/vendor/student) ikut `SESSION_LIFETIME` global = 90 hari. Ubah durasi staff di const `IDLE_MINUTES`.
- Production: set `SESSION_SECURE_COOKIE=true` (butuh HTTPS). Local HTTP biarkan false/null.
