# Consignment (Sellers / Products / Settlements)

Internal "penitipan" model: students/sellers consign products sold through the canteen POS.

## Key files
- `app/Models/Seller.php` — "penitip" (consignor), `hasMany(Product)`
- `app/Models/Product.php` — `type` = `kantin` (canteen-owned) or `siswa` (consigned); auto `code` generation in `boot()`
- `app/Models/MarginRule.php` + `Product::resolveMargin()` — tiered margin applied to `siswa`-type products (cost_price → selling_price)
- `app/Models/Consignment.php` — stock in/out movements per seller/product
- `app/Models/SellerSettlement.php` + `app/Http/Controllers/SettlementController.php` — payout records to sellers
- `resources/js/Pages/{Sellers,Products,Settlements,MarginRules}/`

## How it works
- `type = kantin` products: canteen sets `selling_price` directly.
- `type = siswa` products: `selling_price = cost_price + resolveMargin(cost_price)`, recalculated on every save via model `boot::saving`. Margin tiers cached (`margin_rules_all`, 1hr).
- Product `code` auto-generated as `{category prefix}{NN}`, sequential per prefix, with collision retry loop.
- Settlements pay out accumulated sales proceeds to a `Seller`, recorded in `SellerSettlement`.

## Gotchas
- Margin rule cache (`margin_rules_all`) must be invalidated/forgotten when `MarginRule` changes — check `MarginRuleController` does this.
- Don't confuse this internal consignment model with the new external "vendor/mitra" marketplace (`plan/marketplace-expansion-plan.md`) — separate domain, separate tables (`vendors`, `menu_items`, not `Seller`/`Product`).
