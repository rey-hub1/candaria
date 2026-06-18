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
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SuperAdmin\FeatureFlagController;
use App\Http\Controllers\SuperAdmin\DemoDataController;
use App\Http\Controllers\Admin\VendorController as AdminVendorController;
use App\Http\Controllers\Admin\MarketplaceCategoryController;
use App\Http\Controllers\Admin\Marketplace\OrderController as AdminMarketplaceOrderController;
use App\Http\Controllers\Admin\MarketplaceReportController;
use App\Http\Controllers\Vendor\DashboardController as VendorDashboardController;
use App\Http\Controllers\Vendor\MenuItemController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\PasswordController as StudentPasswordController;
use App\Http\Controllers\Student\MarketplaceController;
use App\Http\Controllers\Student\OrderController as StudentOrderController;
use App\Http\Controllers\Vendor\OrderController as VendorOrderController;
use App\Http\Controllers\Vendor\WalletController as VendorWalletController;
use App\Http\Controllers\Admin\VendorSettlementController;
use Illuminate\Support\Facades\Route;

// Public pages
Route::get('/', [PublicController::class, 'welcome']);
Route::get('/menu', [PublicController::class, 'menu'])->name('menu');

Route::middleware(['auth', 'password.changed'])->group(function () {
    // Wajib ganti password saat pertama login (penitip) — gated by flag
    Route::get('/ganti-password', [\App\Http\Controllers\Auth\ForcePasswordController::class, 'edit'])->name('password.force');
    Route::put('/ganti-password', [\App\Http\Controllers\Auth\ForcePasswordController::class, 'update'])->name('password.force.update');

    // Dashboard (accessible by both admin & cashier)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [DashboardController::class, 'exportPenitip'])->name('penitip.export');
    Route::get('/laporan', [ReportController::class, 'penitip'])->name('reports.penitip');

    // Profile (standard Laravel Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // In-app notifications
    Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifikasi/{id}/baca', [NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::post('/notifikasi/baca-semua', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');

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
        Route::middleware(['feature:cashbook'])->group(function () {
            Route::resource('cashbooks', CashbookController::class)->only(['index', 'store', 'destroy']);
        });
        
        Route::get('/settlements/{settlement}', [SettlementController::class, 'show'])->name('settlements.show');

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/titipan', [ReportController::class, 'titipan'])->name('reports.titipan');
        Route::get('/reports/products', [ReportController::class, 'products'])->name('reports.products');
        Route::get('/reports/stock', [ReportController::class, 'stock'])->name('reports.stock');

        // Margin Rules
        Route::resource('margin-rules', MarginRuleController::class)->except(['show']);

        // Pengaturan (nomor WhatsApp admin, dll)
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');

        // Log Aktivitas (audit trail)
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    });

    // User Management — accessible by admin & super_admin
    Route::middleware(['role:admin,super_admin'])->group(function () {
        Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    // Marketplace: admin manages vendors/mitra
    Route::middleware(['role:admin', 'feature:marketplace'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('vendors', AdminVendorController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::resource('marketplace-categories', MarketplaceCategoryController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['marketplace-categories' => 'marketplaceCategory']);

        Route::get('/marketplace/pesanan', [AdminMarketplaceOrderController::class, 'index'])->name('marketplace.orders');
        Route::get('/reports/marketplace-sales', [MarketplaceReportController::class, 'sales'])->name('reports.marketplace-sales');

        Route::middleware(['feature:vendor_wallet'])->group(function () {
            Route::get('/vendor-settlements', [VendorSettlementController::class, 'index'])->name('vendor-settlements.index');
            Route::post('/vendor-settlements', [VendorSettlementController::class, 'store'])->name('vendor-settlements.store');
        });
    });

    // Marketplace: vendor/mitra dashboard
    Route::middleware(['role:vendor', 'feature:marketplace'])->prefix('mitra')->name('vendor.')->group(function () {
        Route::get('/', [VendorDashboardController::class, 'index'])->name('dashboard');
        Route::get('/profile', [VendorDashboardController::class, 'profile'])->name('profile');
        Route::put('/profile', [VendorDashboardController::class, 'updateProfile'])->name('profile.update');

        Route::post('/menu', [MenuItemController::class, 'store'])->name('menu.store');
        Route::put('/menu/{menuItem}', [MenuItemController::class, 'update'])->name('menu.update');
        Route::delete('/menu/{menuItem}', [MenuItemController::class, 'destroy'])->name('menu.destroy');
        Route::post('/menu/{menuItem}/toggle', [MenuItemController::class, 'toggleActive'])->name('menu.toggle');
        Route::get('/menu', [MenuItemController::class, 'index'])->name('menu.index');

        Route::get('/pesanan', [VendorOrderController::class, 'index'])->name('orders.index');
        Route::put('/pesanan/{order}/status', [VendorOrderController::class, 'updateStatus'])->name('orders.updateStatus');

        Route::middleware(['feature:vendor_wallet'])->group(function () {
            Route::get('/saldo', [VendorWalletController::class, 'index'])->name('wallet.index');
        });
    });

    // Marketplace: student account
    Route::middleware(['role:student', 'feature:student_login'])->prefix('siswa')->name('student.')->group(function () {
        Route::get('/ganti-password', [StudentPasswordController::class, 'edit'])->name('password.change');
        Route::put('/ganti-password', [StudentPasswordController::class, 'update'])->name('password.update');

        Route::middleware(['student.password_changed'])->group(function () {
            Route::get('/', [StudentDashboardController::class, 'index'])->name('dashboard');
        });
    });

    // Marketplace: student browse & order
    Route::middleware(['role:student', 'feature:marketplace', 'student.password_changed'])->name('student.')->group(function () {
        Route::get('/jajan', [MarketplaceController::class, 'index'])->name('marketplace.index');
        Route::middleware(['feature:marketplace_orders'])->group(function () {
            Route::get('/jajan/checkout', [MarketplaceController::class, 'checkout'])->name('marketplace.checkout');
            Route::post('/jajan/checkout', [StudentOrderController::class, 'store'])->name('orders.store');
            Route::get('/siswa/pesanan', [StudentOrderController::class, 'index'])->name('orders.index');
            Route::get('/siswa/pesanan/{order}', [StudentOrderController::class, 'show'])->name('orders.show');
            Route::post('/siswa/pesanan/{order}/batal', [StudentOrderController::class, 'cancel'])->name('orders.cancel');
        });

        Route::get('/jajan/{vendor:slug}', [MarketplaceController::class, 'show'])->name('marketplace.show');
    });

    // Super Admin only
    Route::middleware(['role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
        Route::get('/feature-flags', [FeatureFlagController::class, 'index'])->name('feature-flags.index');
        Route::post('/feature-flags/template', [FeatureFlagController::class, 'applyTemplate'])->name('feature-flags.template');
        Route::put('/feature-flags/{featureFlag}', [FeatureFlagController::class, 'update'])->name('feature-flags.update');
        Route::get('/demo-data', [DemoDataController::class, 'index'])->name('demo-data.index');
        Route::post('/demo-data', [DemoDataController::class, 'apply'])->name('demo-data.apply');
        
        Route::get('/test-runner', [\App\Http\Controllers\SuperAdmin\TestRunnerController::class, 'index'])->name('test-runner.index');
        Route::post('/test-runner/run', [\App\Http\Controllers\SuperAdmin\TestRunnerController::class, 'run'])->name('test-runner.run');
    });
});

require __DIR__.'/auth.php';
