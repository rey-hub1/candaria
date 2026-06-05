<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MarginRuleController;
use App\Http\Controllers\CashbookController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

// Landing Page with Popular Products
Route::get('/', function () {
    $popularProducts = \App\Models\Product::with(['category'])
        ->where('stock', '>', 0)
        ->withSum('transactionItems', 'quantity')
        ->orderByDesc('transaction_items_sum_quantity')
        ->take(8)
        ->get();

    return \Inertia\Inertia::render('Welcome', [
        'popularProducts' => $popularProducts,
        'canLogin' => Route::has('login'),
    ]);
});

Route::middleware(['auth'])->group(function () {
    // Dashboard (accessible by both admin & cashier)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [DashboardController::class, 'exportPenitip'])->name('penitip.export');

    // Profile (standard Laravel Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Cashier routes (accessible by both admin and cashier)
    Route::middleware(['role:admin,cashier'])->group(function () {
        Route::get('/cashier', [TransactionController::class, 'create'])->name('transactions.create');
        Route::post('/checkout', [TransactionController::class, 'checkout'])->name('checkout');
        
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/{id}', [TransactionController::class, 'show'])->name('transactions.show');
        Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

        // Force increment stock route
        Route::post('/products/{product}/force-increment', [ProductController::class, 'forceIncrement'])->name('products.force-increment');
    });

    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        // Categories
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        
        // Sellers / Penitip
        Route::resource('sellers', SellerController::class)->only(['index', 'store', 'update', 'destroy']);
        
        // Products
        Route::resource('products', ProductController::class)->only(['index', 'store', 'update', 'destroy']);
        
        // Settlements / Pembayaran Penitip
        Route::get('/settlements', [SettlementController::class, 'index'])->name('settlements.index');
        Route::post('/settlements', [SettlementController::class, 'store'])->name('settlements.store');
        
        // Mutasi Saldo / Buku Kas
        Route::resource('cashbooks', CashbookController::class)->only(['index', 'store', 'destroy']);
        
        Route::get('/settlements/{settlement}', [SettlementController::class, 'show'])->name('settlements.show');

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/titipan', [ReportController::class, 'titipan'])->name('reports.titipan');
        Route::get('/reports/products', [ReportController::class, 'products'])->name('reports.products');
        Route::get('/reports/stock', [ReportController::class, 'stock'])->name('reports.stock');

        // User Management
        Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);


        // Margin Rules
        Route::resource('margin-rules', MarginRuleController::class)->except(['show']);

        // Pengaturan (nomor WhatsApp admin, dll)
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });
});

require __DIR__.'/auth.php';
