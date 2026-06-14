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
