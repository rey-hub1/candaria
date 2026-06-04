<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Seller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Common Data for Both
        $today = Carbon::today();
        
        $todayStats = Transaction::whereDate('created_at', $today)
            ->selectRaw('COUNT(id) as count, SUM(total_amount) as total')
            ->first();
        $todaySalesCount = $todayStats->count ?? 0;
        $todaySalesTotal = $todayStats->total ?? 0;
        
        $recentTransactions = Transaction::with(['user', 'items.product'])
            ->latest()
            ->take(5)
            ->get();

        if ($user->role === 'admin') {
            // 2. Admin Specific Data
            $totalSellers = Seller::count();
            $totalProducts = Product::count();
            
            // Total unpaid to students
            $totalEarnings = TransactionItem::join('products', 'transaction_items.product_id', '=', 'products.id')
                ->where('products.type', 'siswa')
                ->sum('transaction_items.profit_seller');
            
            $totalPaid = \App\Models\SellerSettlement::sum('total_amount');
            
            $pendingSettlementAmount = $totalEarnings - $totalPaid;

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

            return Inertia::render('Dashboard', [
                'todaySalesCount' => $todaySalesCount,
                'todaySalesTotal' => (float) $todaySalesTotal,
                'recentTransactions' => $recentTransactions,
                'totalSellers' => $totalSellers,
                'totalProducts' => $totalProducts,
                'pendingSettlementAmount' => (float) $pendingSettlementAmount,
                'todayProfit' => (float) $todayProfit,
                'thisMonthSales' => (float) $thisMonthSales,
                'thisMonthProfit' => (float) $thisMonthProfit,
                'lowStockProducts' => $lowStockProducts,
            ]);
        }

        if ($user->role === 'penitip') {
            $seller = Seller::where('phone', $user->phone)->first();
            $myProducts = [];
            $myEarningsToday = 0;
            $myEarningsMonth = 0;
            $myPendingSettlement = 0;
            $mySettlements = [];
            $myLowStockProducts = [];
            $mySalesChart = [];
            $topProducts = [];

            if ($seller) {
                $myProducts = Product::where('seller_id', $seller->id)->get();
                $productIds = $myProducts->pluck('id')->toArray();
                
                $myEarningsToday = TransactionItem::whereIn('product_id', $productIds)
                    ->whereDate('created_at', $today)
                    ->sum('profit_seller');

                $thisMonthStart = Carbon::now()->startOfMonth();
                $myEarningsMonth = TransactionItem::whereIn('product_id', $productIds)
                    ->where('created_at', '>=', $thisMonthStart)
                    ->sum('profit_seller');

                $totalEarnings = TransactionItem::whereIn('product_id', $productIds)->sum('profit_seller');
                $totalPaid = \App\Models\SellerSettlement::where('seller_id', $seller->id)->sum('total_amount');
                $myPendingSettlement = $totalEarnings - $totalPaid;

                $mySettlements = \App\Models\SellerSettlement::where('seller_id', $seller->id)
                    ->latest()
                    ->take(5)
                    ->get();
                
                $myLowStockProducts = Product::where('seller_id', $seller->id)
                    ->where('stock', '<=', 5)
                    ->orderBy('stock', 'asc')
                    ->get();

                $salesByDate = TransactionItem::whereIn('product_id', $productIds)
                    ->where('created_at', '>=', Carbon::today()->subDays(6)->startOfDay())
                    ->selectRaw('DATE(created_at) as date, SUM(profit_seller) as amount')
                    ->groupBy('date')
                    ->pluck('amount', 'date');

                for ($i = 6; $i >= 0; $i--) {
                    $d = Carbon::today()->subDays($i);
                    $mySalesChart[] = [
                        'date' => $d->format('d M'),
                        'amount' => (float)($salesByDate[$d->toDateString()] ?? 0),
                    ];
                }

                $topProducts = TransactionItem::whereIn('product_id', $productIds)
                    ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(profit_seller) as total_profit'))
                    ->groupBy('product_id')
                    ->orderByDesc('total_qty')
                    ->take(5)
                    ->with('product')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->product_id,
                            'name' => $item->product ? $item->product->name : 'Unknown',
                            'qty' => (int)$item->total_qty,
                            'profit' => (float)$item->total_profit,
                        ];
                    });
            }

            return Inertia::render('Dashboard', [
                'isPenitip' => true,
                'myProducts' => $myProducts,
                'myEarningsToday' => (float) $myEarningsToday,
                'myEarningsMonth' => (float) $myEarningsMonth,
                'myPendingSettlement' => (float) $myPendingSettlement,
                'mySettlements' => $mySettlements,
                'myLowStockProducts' => $myLowStockProducts,
                'mySalesChart' => $mySalesChart,
                'topProducts' => $topProducts,
            ]);
        }

        // Cashier dashboard
        return Inertia::render('Dashboard', [
            'todaySalesCount' => $todaySalesCount,
            'todaySalesTotal' => (float) $todaySalesTotal,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function exportPenitip(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'penitip') {
            abort(403);
        }

        $seller = Seller::where('phone', $user->phone)->first();
        if (!$seller) {
            abort(404);
        }

        $products = Product::where('seller_id', $seller->id)->pluck('id')->toArray();
        $items = TransactionItem::with(['transaction', 'product'])
            ->whereIn('product_id', $products)
            ->latest()
            ->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=laporan_penitipan_" . date('Y-m-d') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($items) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tanggal', 'No. Transaksi', 'Produk', 'Harga Beli (Modal)', 'Qty', 'Total Profit']);

            foreach ($items as $item) {
                fputcsv($file, [
                    $item->created_at->format('Y-m-d H:i'),
                    $item->transaction->transaction_code,
                    $item->product->name ?? 'Unknown',
                    $item->cost_price,
                    $item->quantity,
                    $item->profit_seller,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
