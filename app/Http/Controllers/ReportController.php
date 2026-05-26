<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    // Laporan Penjualan Harian & Keuntungan Kantin
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Group transactions by date
        $salesData = Transaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as transaction_count'),
                DB::raw('SUM(total_amount) as total_sales')
            )
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->get();

        // Calculate canteen profit per day
        foreach ($salesData as $data) {
            $data->profit_kantin = TransactionItem::whereDate('created_at', $data->date)->sum('profit_kantin');
            $data->profit_seller = TransactionItem::whereDate('created_at', $data->date)->sum('profit_seller');
        }

        // Totals
        $grandTotalSales = $salesData->sum('total_sales');
        $grandTotalProfitKantin = $salesData->sum('profit_kantin');
        $grandTotalProfitSeller = $salesData->sum('profit_seller');

        return view('reports.sales', compact(
            'salesData', 
            'startDate', 
            'endDate',
            'grandTotalSales',
            'grandTotalProfitKantin',
            'grandTotalProfitSeller'
        ));
    }

    // Laporan Titipan (Siswa Penitip)
    public function titipan(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Get transaction items for products that are of type 'siswa'
        $items = TransactionItem::whereHas('product', function($q) {
                $q->where('type', 'siswa');
            })
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->with(['product.seller', 'transaction', 'settlement'])
            ->latest()
            ->paginate(15);

        // Summaries
        $summary = TransactionItem::whereHas('product', function($q) {
                $q->where('type', 'siswa');
            })
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_qty')
            ->selectRaw('COALESCE(SUM(profit_seller), 0) as total_seller')
            ->selectRaw('COALESCE(SUM(profit_kantin), 0) as total_kantin')
            ->first();

        return view('reports.titipan', compact('items', 'startDate', 'endDate', 'summary'));
    }

    // Laporan Produk Terlaris & Stok
    public function products()
    {
        // 1. Top Selling Products
        $topProducts = Product::select('products.*')
            ->selectSub(function($query) {
                $query->selectRaw('COALESCE(SUM(transaction_items.quantity), 0)')
                    ->from('transaction_items')
                    ->whereColumn('transaction_items.product_id', 'products.id');
            }, 'sold_count')
            ->with(['category', 'seller'])
            ->orderBy('sold_count', 'desc')
            ->take(15)
            ->get();

        // 2. Low Stock Products
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->with(['category', 'seller'])
            ->orderBy('stock', 'asc')
            ->get();

        return view('reports.products', compact('topProducts', 'lowStockProducts'));
    }
}
