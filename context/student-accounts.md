# Student Accounts (NISN login)

Student accounts log in with NISN + password (default password = birth date).
Branch `candaria2`, gated by `student_login` feature flag. Real NISN/birth-date
data not imported yet — `database/seeders/StudentSeeder.php` creates 2 dummy
students for testing.

## Tables/models
- `students` — `user_id` (FK users, unique, cascade delete), `nisn` (unique), `name`, `class`, `birth_date`, `must_change_password` (default true).
- Linked `users` row: `role = 'student'`, `email = null` (users.email is nullable).
- `Student::generateDefaultPassword(birthDate)` — returns `ddmmyyyy` string, used as the initial password (hashed on create).

## Login flow
- `GET/POST /login-siswa` (route name `student.login`) — separate from the main `/login` form, gated by `feature:student_login`.
- `Auth/StudentLoginRequest` — looks up `Student::where('nisn', ...)`, then `Auth::attempt(['id' => $student->user_id, 'password' => ...])`.
- `Auth/StudentAuthenticatedSessionController::store()` — after auth, redirects to `student.password.change` if `must_change_password`, else `student.dashboard`.

## Forced password change
- **Gated by `force_password_change` feature flag (group `general`, off by default).** When the flag is off, nobody is forced even if `must_change_password` is true. Toggled by super_admin at `/super-admin/feature-flags`.
- Applies to **both siswa & penitip**:
  - Siswa: `Student\PasswordController` (`edit()` renders `Student/ChangePassword`, `update()` flips `students.must_change_password`), middleware `student.password_changed` (`EnsureStudentPasswordChanged`).
  - Penitip: `users.must_change_password` column (set true on penitip user creation in `SellerController`), middleware `password.changed` (`EnsurePasswordChanged`, only acts on role=penitip) on the main `auth` route group → redirects to `password.force`. `Auth\ForcePasswordController` + page `Pages/Auth/ForcePasswordChange.jsx`.
- Both middlewares + both login controllers short-circuit when the flag is off.
- Routes under `/siswa` (`student.*`), `role:student` + `feature:student_login`.

## Frontend
- `Pages/Auth/StudentLogin.jsx` — NISN + password form, link back to `/login` for staff roles.
- `Pages/Student/ChangePassword.jsx` — forced password reset form.
- `Pages/Student/Dashboard.jsx` — placeholder landing page (Phase 4 will add marketplace browse/order here).
- `AuthenticatedLayout.jsx` mobile nav has a minimal `student` branch (Dashboard + Logout only — no admin/cashier links).

## Gotchas
- `password_reset_tokens` is keyed by email — students with `email = null` can't use the standard forgot-password flow (not needed yet).
- `php artisan students:import` command (Excel import) is planned but not built — wait for real NISN data.
