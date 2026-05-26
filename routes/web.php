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
use Illuminate\Support\Facades\Route;

// Redirect welcome page to login
Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    // Dashboard (accessible by both admin & cashier)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile (standard Laravel Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Cashier routes (accessible by both admin and cashier)
    Route::middleware(['role:admin,cashier'])->group(function () {
        Route::get('/cashier', [TransactionController::class, 'create'])->name('transactions.create');
        Route::post('/cart/add', [TransactionController::class, 'addToCart'])->name('cart.add');
        Route::post('/cart/update', [TransactionController::class, 'updateCart'])->name('cart.update');
        Route::get('/cart/remove/{productId}', [TransactionController::class, 'removeFromCart'])->name('cart.remove');
        Route::post('/cart/clear', [TransactionController::class, 'clearCart'])->name('cart.clear');
        Route::post('/checkout', [TransactionController::class, 'checkout'])->name('checkout');
        
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/{id}', [TransactionController::class, 'show'])->name('transactions.show');
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
        Route::get('/settlements/{settlement}', [SettlementController::class, 'show'])->name('settlements.show');

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/titipan', [ReportController::class, 'titipan'])->name('reports.titipan');
        Route::get('/reports/products', [ReportController::class, 'products'])->name('reports.products');

        // User Management
        Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
    });
});

require __DIR__.'/auth.php';
