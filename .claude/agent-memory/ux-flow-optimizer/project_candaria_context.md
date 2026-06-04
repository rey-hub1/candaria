---
name: project-candaria-context
description: Core context for Kantin Smekda (SMKN 2 Purwakarta) canteen management app — stack, roles, key pages, and operational constraints
metadata:
  type: project
---

Kantin Smekda is a school canteen POS + settlement system for SMKN 2 Purwakarta.

**Why:** Manages two product types — kantin-owned goods and student-consigned (titipan siswa) goods — with automatic profit-sharing (margin rules, flat Rp500/item for siswa items).

**Stack:** Laravel 11 + Inertia.js + React + Tailwind CSS + PWA (sw.js)

**Three roles:**
- admin: full access — products, sellers, settlements, cashbooks, reports, users, margin rules
- kasir (cashier): cashier screen + transaction history only
- penitip (consigner): read-only dashboard showing their own products, earnings, settlement history

**Key pages:**
- `/cashier` — Transactions/Create.jsx — primary kasir POS screen
- `/products` — Products/Index.jsx — admin product CRUD
- `/settlements` (Index + Show) — admin pays out penitip earnings
- `/cashbooks` — admin manual cash ledger
- `/reports/sales`, `/reports/titipan`, `/reports/stock`, `/reports/products` — admin reports
- `Dashboard.jsx` — role-aware dashboard (3 variants)
- `AuthenticatedLayout.jsx` — sidebar (desktop) + bottom nav (mobile) + drawer

**Operational constraint:** Cart persisted in localStorage (`candaria_cart`). Custom on-screen keyboard replaces native keyboard (touch POS scenario). Force-increment stock mechanic exists (3 clicks on out-of-stock product).

**How to apply:** Always consider touch/kiosk context for kasir, read-only constraints for penitip, and admin's need for financial accuracy.
