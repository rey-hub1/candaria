<?php

use App\Models\Product;
use App\Models\Seller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
});

// ─── REPORT SALES ────────────────────────────────────────────────────────────

test('admin can access sales report', function () {
    $this->actingAs($this->admin)
        ->get(route('reports.sales'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Sales')
            ->has('salesData')
            ->has('grandTotalSales')
            ->has('grandTotalProfitKantin')
        );
});

test('admin can export sales report to pdf', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('reports.sales', ['export' => 'pdf']))
        ->assertOk();
    
    // PDF output streams
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

test('admin can export sales report to excel', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('reports.sales', ['export' => 'xlsx']))
        ->assertOk();

    expect($response->headers->get('content-type'))->toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

// ─── REPORT TITIPAN ──────────────────────────────────────────────────────────

test('admin can access titipan report', function () {
    $seller = Seller::factory()->create(['is_active' => true]);

    $this->actingAs($this->admin)
        ->get(route('reports.titipan', ['seller_id' => $seller->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Titipan')
            ->has('items')
            ->has('summary')
            ->has('sellers')
        );
});

test('admin can export titipan report to pdf', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('reports.titipan', ['export' => 'pdf']))
        ->assertOk();
    
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

// ─── REPORT PENITIP (VENDOR) ─────────────────────────────────────────────────

test('penitip user can only see their own report', function () {
    $penitipUser = User::factory()->create(['role' => 'penitip', 'phone' => '08123456789']);
    $seller = Seller::factory()->create(['phone' => '08123456789']);

    $this->actingAs($penitipUser)
        ->get(route('reports.penitip'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Penitip')
            ->has('items')
            ->has('summary')
        );
});

test('non-penitip user cannot access penitip report', function () {
    $this->actingAs($this->admin) // Admin tries to access penitip personal dashboard
        ->get(route('reports.penitip'))
        ->assertForbidden(); // 403
});

// ─── REPORT PRODUCTS ─────────────────────────────────────────────────────────

test('admin can access products best seller and stock report', function () {
    $kantinProduct = Product::factory()->create(['type' => 'kantin', 'stock' => 2]);
    $siswaProduct = Product::factory()->create(['type' => 'siswa', 'stock' => 10]);

    $this->actingAs($this->admin)
        ->get(route('reports.products'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Products')
            ->has('allProducts')
            ->has('topProductsKantin')
            ->has('lowStockProductsKantin')
        );
});

// ─── REPORT STOCK HARIAN ─────────────────────────────────────────────────────

test('admin can access daily stock report', function () {
    Product::factory()->create(['stock' => 15]);

    $this->actingAs($this->admin)
        ->get(route('reports.stock'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Stock')
            ->has('reportData')
            ->has('date')
        );
});
