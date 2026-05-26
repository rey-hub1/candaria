<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Seller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Common Data for Both
        $today = Carbon::today();
        $todaySalesCount = Transaction::whereDate('created_at', $today)->count();
        $todaySalesTotal = Transaction::whereDate('created_at', $today)->sum('total_amount');
        
        $recentTransactions = Transaction::with(['user', 'items.product'])
            ->latest()
            ->take(5)
            ->get();

        if ($user->role === 'admin') {
            // 2. Admin Specific Data
            $totalSellers = Seller::count();
            $totalProducts = Product::count();
            // Total unpaid to students
            $pendingSettlementAmount = TransactionItem::whereHas('product', function($q) {
                    $q->where('type', 'siswa');
                })
                ->whereNull('seller_settlement_id')
                ->sum('profit_seller');

            // Canteen profit calculation
            // Today's profit
            $todayProfit = TransactionItem::whereDate('created_at', $today)->sum('profit_kantin');
            // This month's sales and profit
            $thisMonthStart = Carbon::now()->startOfMonth();
            $thisMonthSales = Transaction::where('created_at', '>=', $thisMonthStart)->sum('total_amount');
            $thisMonthProfit = TransactionItem::where('created_at', '>=', $thisMonthStart)->sum('profit_kantin');

            // Low stock products alert (stock <= 5)
            $lowStockProducts = Product::where('stock', '<=', 5)
                ->with('category')
                ->orderBy('stock', 'asc')
                ->take(10)
                ->get();

            return view('dashboard', compact(
                'todaySalesCount',
                'todaySalesTotal',
                'recentTransactions',
                'totalSellers',
                'totalProducts',
                'pendingSettlementAmount',
                'todayProfit',
                'thisMonthSales',
                'thisMonthProfit',
                'lowStockProducts'
            ));
        }

        // Cashier dashboard
        return view('dashboard', compact(
            'todaySalesCount',
            'todaySalesTotal',
            'recentTransactions'
        ));
    }
}
