---
name: ux-patterns-pain-points
description: Recurring UX patterns, pain points, and design conventions found across the Candaria codebase
metadata:
  type: project
---

**Design conventions already in use:**
- Emerald-600 = primary action color (consistent across all pages)
- Rose-600 = destructive/credit/error color
- Slate-900 sidebar, slate-50 content background
- Card-based layout with rounded-xl + border-slate-200 + shadow-sm
- Mobile cards / desktop tables (dual rendering pattern — repeated in every list page)
- SortableHeader component for table columns
- FilterBar component for search + optional date filter
- Toast system in AuthenticatedLayout (suppressed on transactions.create for success)
- Pagination component duplicated across 5+ files (not shared)

**Known pain points identified:**
- `alert()` used for stock warnings in kasir — blocks UI, poor UX on touch devices
- `confirm()` used for delete/void operations — same issue
- Two duplicate `checkout-btn` IDs on same page (desktop + mobile drawer)
- Pagination component copy-pasted in 5+ files instead of being shared
- formatRupiah() duplicated in every single page file (not shared utility)
- `window._searchTimer` and `window._sellerTimer` as globals — fragile
- `prefixes` prop passed twice in Create.jsx (duplicate prop bug)
- `router` imported in Transactions/Show.jsx but never declared (runtime error on void button)
- Force-increment mechanic uses `alert()` and click counting — hidden/surprising UX
- Stock report filter requires explicit form submit; sales report fires on every date change (inconsistent)
- Cashbook preset buttons have no active state indicator (unlike settlements page which does)
- Date range filter pattern implemented differently across 4 pages (settlements, cashbooks, sales, stock)
- Penitip role has no page navigation in bottom nav — only Dashboard accessible
- Back navigation in Show pages inconsistently targets different routes
- Mobile cashier floating bar sits at bottom-16 (above nav bar) — correct, but drawer overlaps nav

**How to apply:** When modifying any list page, check for these duplicate patterns. When adding filters, use the settled pattern from Sales.jsx (preset pills + live date). For new modals, always use the shared pattern from Products/Index.jsx.
