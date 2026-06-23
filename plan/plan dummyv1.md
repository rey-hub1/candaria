# Plan: Dummy V1 — Real Excel Data with Date-Shifted Sales

## Context
User has uploaded a real 3-day consignment sales record (Senin 11 Mei / Selasa 12 Mei / Rabu 13 Mei 2026) as an Excel file. They want a new `v1` dummy data level in the system that seeds this actual seller, product, and sales data — but with the dates automatically shifted so that SENIN maps to the most recent past Monday, SELASA to Tuesday, and RABU to Wednesday, relative to whenever the seed runs. Then push to branch `claude/dummy-v1-sales-date-sync-a1fyc4`.

**What the Excel contains (3 sheets: SENIN / SELASA / RABU):**
- ~40–45 unique sellers (penitip), each with 1–10 products
- Per-product: name, category, cost price, sell price, initial stock (stok awal), qty sold each day
- Categories: Makanan, Minuman, Snack/Jajanan, Roti & Kue, Lainnya (Non-Makanan)
- All products are consignment/siswa type (no kantin-owned products in the data)

---

## Files to Modify

| File | Change |
|---|---|
| `app/Services/DemoDataService.php` | Add `'v1'` to `LEVELS`; add category `lainnya`; add `seedV1Canteen()` with hardcoded data arrays and transaction synthesis |
| `app/Http/Controllers/SuperAdmin/DemoDataController.php` | Add `'v1'` label (`'v1' => 'Data Asli V1'`) to the label map |
| `resources/js/Pages/SuperAdmin/DemoData.jsx` | Add V1 mode card to the modes array |
| `context/demo-data.md` | Document the new level |

---

## Implementation Plan

### 1. Add `lainnya` Category
In `ensureCategories()` (DemoDataService), add:
```php
['name' => 'Lainnya', 'slug' => 'lainnya', 'code' => 'l', 'prefix' => 'L'],
```

### 2. Add `'v1'` to LEVELS
```php
public const LEVELS = ['none', 'minimal', 'full', 'v1'];
```

### 3. Wire up in `apply()` + `preset()`
In `apply()`, add a branch:
```php
if ($level === 'v1') {
    $this->seedV1Canteen();
    // skip seedMarketplace — no marketplace data in v1
} elseif ($level !== 'none') {
    $preset = $this->preset($level);
    $this->seedCanteen($preset);
    $this->seedMarketplace($preset);
}
```
The `preset()` method doesn't need a `'v1'` entry since v1 uses fixed data.

### 4. Date-Shift Logic
Map the 3 day-names to the most recent Mon/Tue/Wed that are all ≤ today:
```php
$senin = Carbon::today()->startOfWeek(Carbon::MONDAY); // this week's Monday
if ($senin->copy()->addDays(2)->isFuture()) {
    $senin->subWeek(); // roll back if Wed is still in the future
}
$days = [
    0 => $senin,                   // SENIN
    1 => $senin->copy()->addDay(), // SELASA
    2 => $senin->copy()->addDays(2), // RABU
];
```

### 5. Data Structure
Private constant `V1_SELLERS` (array) — each entry:
```php
[
    'name'     => 'Miseu',
    'phone'    => '08882058726',
    'class'    => null,
    'products' => [
        ['name' => 'Seblak Kecil', 'cat' => 'snack-jajanan', 'cost' => 1500, 'sell' => 2000, 'stock' => 12],
        ['name' => 'Seblak Besar', 'cat' => 'snack-jajanan', 'cost' => 3000, 'sell' => 3500, 'stock' => 14],
    ],
    'sales' => [
        0 => ['Seblak Kecil' => 12, 'Seblak Besar' => 14], // Senin
        1 => ['Seblak Kecil' => 14, 'Seblak Besar' => 15], // Selasa
        2 => ['Seblak Kecil' => 12, 'Seblak Besar' => 14], // Rabu
    ],
]
```
Approximately 40 sellers will be hardcoded, covering all unique sellers with ≥ 1 unit sold in any of the 3 days.

**Category mapping (Excel → slug):**
- Makanan → `makanan-utama`
- Minuman → `minuman`
- Snack/Jajanan → `snack-jajanan`
- Roti & Kue → `roti-kue`
- Lainnya (Non-Makanan) → `lainnya` (new category)

### 6. `seedV1Canteen()` Logic
```
1. ensureCategories() — creates all 5 categories including lainnya
2. $categories = Category::pluck('id', 'slug')
3. For each seller in V1_SELLERS:
   a. Seller::create(name, phone, class, is_active=true)
   b. Create penitip User login (role=penitip, password=candaria123)
   c. For each product: Product::create(type=siswa, cost, sell, stock)
   d. Consignment::create(type='in', qty=stock, date=$senin->subDays(7))
4. Build $productMap[seller_name][product_name] = Product instance
5. For each $dayIndex in [0, 1, 2]:
   a. Pool = flat list of [product_id, qty_sold] for all products sold that day
   b. Shuffle pool
   c. Batch into transactions of rand(2,5) items each
   d. For each batch: create Transaction + TransactionItems + Cashbook entry
      - Random time between 07:00–15:00
      - profit_seller = (sell - cost) * qty
      - profit_kantin = 0 (no margin added since sell price = given sell price)
```

### 7. Transaction Code Generation
The existing Transaction model auto-generates codes via `boot()`. The `created_at` will be set to the day's date with random time — ensure `transaction_date` is also set to the day's date.

### 8. UI Change (`DemoData.jsx`)
Add to the modes array (before or after 'full'):
```js
{
    level: 'v1',
    label: 'Data Asli V1',
    desc: 'Data nyata 3 hari (Senin–Rabu) dengan tanggal otomatis menyesuaikan hari ini.',
    icon: '📋',
},
```
Update `LABELS` map: `v1: 'Data Asli V1'`.

### 9. Controller Update
```php
$label = ['none' => 'kosong', 'minimal' => 'sedikit', 'full' => 'banyak', 'v1' => 'data asli v1'][$validated['level']];
```

---

## Sellers Included in V1 (≥1 unit sold)
From main section (30 sellers): Miseu, Saira, Bu Lucky, Bunda sudiar, Teh Nisa, Putri, Bu sarah, bu santi, pa agus, Teh tasya, Briliant, Denesfi, Ibu Fini, Bu lina, Erviita, Raisya, Nurfitri, bu neneng, Bu Nur, Bu putri, Pak andi, Sani, Kayla, Dea, bunda putri, Teh Nia.

From second section (14 sellers): Edwar, Aldo, Alifa, Prihartini, Opi, Niki, Nabila, Faliza, Marwat, Olga, Bapak roti, Salma (Es mambo), Nazwa, Gendis, Anida, Aini, Teh Adis, Azzahra, Jane salsa, Muhara, Bu raisa, Desi, Rani, Pak ade, Dzikry, Teh sofie, Bu Desi, Bu rika, Pak max, Shiva, Araa.

Sellers with only non-food items (tote bags, keychains, pins) and 0 food sales may be excluded or included with `lainnya` category.

---

## Verification
1. `php artisan migrate --seed` on a fresh DB
2. Login as superadmin, navigate to Demo Data page, select "Data Asli V1", apply
3. Check that ~40 sellers exist in Sellers list
4. Check Transactions for 3 days (Mon/Tue/Wed of most recent past week)
5. Verify dates shift when seeded on a different day of the week
6. Check that consignment entries exist for each seller's products
