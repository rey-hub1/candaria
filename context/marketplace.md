# Marketplace: Vendors & Menus

External "mitra" (vendor) accounts manage their own menu, with optional
Gojek-style customization. Branch `candaria2`, gated by `marketplace` feature flag.

## Tables/models
- `vendors` — `user_id` (nullable, FK to a `vendor`-role User), `name`, `slug` (auto-generated, collision-checked), `description`, `logo`, `category`, `status` (pending/active/suspended), `phone`, `address`, `balance`, `is_open`, `joined_at`. SoftDeletes. `scopeActive()`.
- `menu_items` — belongs to vendor, cascade-deleted with vendor. `name`, `description`, `price`, `image`, `category`, `is_active`. SoftDeletes. `scopeActive()`.
- `menu_option_groups` — belongs to menu item, cascade-deleted. `name`, `type` (single/multiple), `is_required`, `min_select`, `max_select`, `sort_order`.
- `menu_options` — belongs to option group, cascade-deleted. `name`, `price_delta`, `is_default`, `sort_order`.

## Admin: manage vendors (`/admin/vendors`)
- `Admin/VendorController` — index/store/update/destroy.
- Adding a vendor creates a `User` (role=vendor) + `Vendor` (status=active) together.
- Cannot delete a vendor that still has menu items.
- Page: `Pages/Admin/Vendors/Index.jsx`.

## Vendor dashboard (`/mitra`, role=vendor)
- `Vendor/DashboardController` — `index()` (stats: menu_count, active_menu_count, balance), `profile()`/`updateProfile()` (logo upload, is_open toggle).
- `Vendor/MenuItemController` — full CRUD for own menu items + nested option groups/options.
  - `validatePayload()` validates menu fields + `option_groups[].options[]`.
  - `syncOptionGroups()` deletes and recreates all groups/options on every save (simple, no diffing).
  - Empty `max_select` ('') is normalized to `null` before validation.
- Pages: `Pages/Vendor/Dashboard.jsx`, `Pages/Vendor/Profile.jsx`, `Pages/Vendor/Menu/Index.jsx` (list + add/edit modal with dynamic option-group/option rows).

## Routing/redirects
- `/mitra/*` routes require `role:vendor` + `feature:marketplace`.
- `DashboardController::index()` redirects `vendor` role users to `vendor.dashboard`.

## Gotchas
- `Vendor::ledgers()` and `Vendor::orders()` are forward references to models that don't exist yet (Phase 4/5) — don't call them until those phases land.
- Inertia relation `optionGroups` serializes as `option_groups` in JSON (Laravel snake-cases relation names).
