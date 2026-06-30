# Marketplace: Vendors & Menus

External "mitra" (vendor) accounts manage their own menu. Customization is
free-text only — students write requests (pedas, tanpa sambal, dll) in a per-item
note at checkout; there are no structured option groups. Branch `candaria2`,
gated by `marketplace` feature flag.

## Tables/models
- `vendors` — `user_id` (nullable, FK to a `vendor`-role User), `name`, `slug` (auto-generated, collision-checked), `description`, `logo`, `category`, `status` (pending/active/suspended), `phone`, `address`, `balance`, `is_open`, `joined_at`. SoftDeletes. `scopeActive()`.
- `menu_items` — belongs to vendor, cascade-deleted with vendor. `name`, `description`, `price`, `image`, `category`, `is_active`. SoftDeletes. `scopeActive()`.
- ~~`menu_option_groups` / `menu_options` / `order_item_options`~~ — **removed (2026-06-25).** Models, migrations, relations, and the `OrderService` option-pricing logic deleted; tables dropped. The feature was half-built (schema only, never surfaced in UI or priced at checkout). Customization is free-text notes only.

## Admin: manage categories (`/admin/marketplace-categories`)
- `marketplace_categories` table — `type` (`vendor` = kategori mitra, `menu` = kategori item), `name`, `is_active`, `sort_order`. Unique `(type, name)`. Model `MarketplaceCategory` (scopes: `type()`, `active()`, `ordered()`). Separate from the canteen `Category` model (products).
- `Admin/MarketplaceCategoryController` — index/store/update/destroy (toggle active = update with flipped `is_active`).
- Page: `Pages/Admin/MarketplaceCategories/Index.jsx` (two columns: mitra & menu).
- Vendor `category` and `menu_items.category` still store the category **name as a string** (not FK). Vendor picks from a dropdown sourced from active categories: `DashboardController::profile()` passes `categories` (type=vendor), `MenuItemController::index()` passes `categories` (type=menu). Legacy free-text values still render as a "(lama)" option.

## Admin: manage vendors (`/admin/vendors`)
- `Admin/VendorController` — index/store/update/destroy.
- Adding a vendor creates a `User` (role=vendor) + `Vendor` (status=active) together.
- Cannot delete a vendor that still has menu items.
- Page: `Pages/Admin/Vendors/Index.jsx`.

## Vendor dashboard (`/mitra`, role=vendor)
- `Vendor/DashboardController` — `index()` (stats: menu_count, active_menu_count, balance), `profile()`/`updateProfile()` (logo upload, is_open toggle).
- `Vendor/MenuItemController` — plain CRUD for own menu items (name/description/price/category/image/is_active). No option groups.
- Pages: `Pages/Vendor/Dashboard.jsx`, `Pages/Vendor/Profile.jsx`, `Pages/Vendor/Menu/Index.jsx` (list + add/edit modal, plain fields only).

## Routing/redirects
- `/mitra/*` routes require `role:vendor` + `feature:marketplace`.
- `DashboardController::index()` redirects `vendor` role users to `vendor.dashboard`.

## Gotchas
- `Vendor::ledgers()` and `Vendor::orders()` are forward references to models that don't exist yet (Phase 4/5) — don't call them until those phases land.
