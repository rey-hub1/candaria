<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\SalesReportExport;
use App\Exports\TitipanReportExport;
use App\Exports\ProductsReportExport;
use Maatwebsite\Excel\Facades\Excel;

use Inertia\Inertia;

class ReportController extends Controller
{
    // Laporan Penjualan Harian & Keuntungan Kantin
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $salesDataQuery = Transaction::active()->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as transaction_count'),
                DB::raw('SUM(total_amount) as total_sales')
            )
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->get()->keyBy('date');

        $profitsQuery = TransactionItem::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(profit_kantin) as profit_kantin'),
                DB::raw('SUM(profit_seller) as profit_seller')
            )
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()->keyBy('date');

        $result = [];
        foreach ($salesDataQuery as $date => $data) {
            $data->profit_kantin = $profitsQuery[$date]->profit_kantin ?? 0;
            $data->profit_seller = $profitsQuery[$date]->profit_seller ?? 0;
            $result[] = $data;
        }
        
        $salesData = collect($result);

        // Totals
        $grandTotalSales = $salesData->sum('total_sales');
        $grandTotalProfitKantin = $salesData->sum('profit_kantin');
        $grandTotalProfitSeller = $salesData->sum('profit_seller');

        if ($request->input('export') === 'pdf') {
            $pdf = Pdf::loadView('reports.sales_pdf', compact(
                'salesData', 
                'startDate', 
                'endDate',
                'grandTotalSales',
                'grandTotalProfitKantin',
                'grandTotalProfitSeller'
            ))->setPaper('a4', 'portrait');
            return $pdf->stream('laporan-penjualan-' . $startDate . '-to-' . $endDate . '.pdf');
        }

        if ($request->input('export') === 'xlsx') {
            return Excel::download(new SalesReportExport(
                $salesData, 
                $startDate, 
                $endDate,
                $grandTotalSales,
                $grandTotalProfitKantin,
                $grandTotalProfitSeller
            ), 'laporan-penjualan-' . $startDate . '-to-' . $endDate . '.xlsx');
        }

        return Inertia::render('Reports/Sales', compact(
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

        if ($request->input('export') !== 'pdf') {
            // Get transaction items for products that are of type 'siswa' (paginated for web)
            $items = TransactionItem::whereHas('product', function($q) {
                    $q->where('type', 'siswa');
                })
                ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
                ->with(['product.seller', 'transaction', 'settlement'])
                ->latest()
                ->paginate(15);
        } else {
            // For PDF, get all matching items
            $items = TransactionItem::whereHas('product', function($q) {
                    $q->where('type', 'siswa');
                })
                ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
                ->with(['product.seller', 'transaction', 'settlement'])
                ->latest()
                ->get();
        }

        // Summaries
        $summary = TransactionItem::whereHas('product', function($q) {
                $q->where('type', 'siswa');
            })
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_qty')
            ->selectRaw('COALESCE(SUM(profit_seller), 0) as total_seller')
            ->selectRaw('COALESCE(SUM(profit_kantin), 0) as total_kantin')
            ->first();

        if ($request->input('export') === 'pdf') {
            $pdf = Pdf::loadView('reports.titipan_pdf', compact(
                'items', 
                'startDate', 
                'endDate', 
                'summary'
            ))->setPaper('a4', 'landscape');
            return $pdf->stream('laporan-titipan-siswa-' . $startDate . '-to-' . $endDate . '.pdf');
        }

        if ($request->input('export') === 'xlsx') {
            return Excel::download(new TitipanReportExport(
                $items,
                $startDate,
                $endDate,
                $summary
            ), 'laporan-titipan-siswa-' . $startDate . '-to-' . $endDate . '.xlsx');
        }

        return Inertia::render('Reports/Titipan', compact('items', 'startDate', 'endDate', 'summary'));
    }

    // Laporan Produk Terlaris & Stok
    public function products(Request $request)
    {
        // 1. ALL Products (primary — full inventory view)
        $allProducts = Product::with(['category', 'seller'])
            ->withSum('transactionItems as sold_count', 'quantity')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get();
        $allProducts->each(fn ($p) => $p->sold_count = (int) ($p->sold_count ?? 0));

        // 2. Top Selling Products (Kantin) — secondary insight
        $topProductsKantin = $allProducts->where('type', 'kantin')
            ->sortByDesc('sold_count')
            ->take(15)
            ->values();

        // Top Selling Products (Siswa) — secondary insight
        $topProductsSiswa = $allProducts->where('type', 'siswa')
            ->sortByDesc('sold_count')
            ->take(15)
            ->values();

        // 3. Low Stock Products
        $lowStockProductsKantin = $allProducts->where('type', 'kantin')
            ->where('stock', '<=', 5)
            ->sortBy('stock')
            ->values();

        $lowStockProductsSiswa = $allProducts->where('type', 'siswa')
            ->where('stock', '<=', 5)
            ->sortBy('stock')
            ->values();

        if ($request->input('export') === 'pdf') {
            $pdf = Pdf::loadView('reports.products_pdf', compact('topProductsKantin', 'topProductsSiswa', 'lowStockProductsKantin', 'lowStockProductsSiswa'))
                ->setPaper('a4', 'portrait');
            return $pdf->stream('laporan-produk-terlaris-dan-stok.pdf');
        }

        if ($request->input('export') === 'xlsx') {
            return Excel::download(new ProductsReportExport($topProductsKantin, $topProductsSiswa, $lowStockProductsKantin, $lowStockProductsSiswa), 'laporan-produk-terlaris-dan-stok.xlsx');
        }

        return Inertia::render('Reports/Products', [
            'allProducts'           => $allProducts->values(),
            'topProductsKantin'     => $topProductsKantin->values(),
            'topProductsSiswa'      => $topProductsSiswa->values(),
            'lowStockProductsKantin'=> $lowStockProductsKantin->values(),
            'lowStockProductsSiswa' => $lowStockProductsSiswa->values(),
        ]);
    }

    // Laporan Produk & Stok Harian
    public function stock(Request $request)
    {
        $date = $request->input('date', Carbon::now()->toDateString());
        $products = Product::with(['seller', 'category'])->get();

        // Bulk load qtySold for all products on this date
        $qtySoldQuery = TransactionItem::whereDate('created_at', $date)
            ->selectRaw('product_id, SUM(quantity) as sum_qty')
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        // Bulk load qtySoldAfter for all products
        $qtySoldAfterQuery = TransactionItem::whereDate('created_at', '>', $date)
            ->selectRaw('product_id, SUM(quantity) as sum_qty')
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $reportData = [];
        foreach ($products as $product) {
            // Quantity sold on this date
            $qtySold = $qtySoldQuery[$product->id]->sum_qty ?? 0;

            // Quantity sold after this date (to reconstruct historical stock)
            $qtySoldAfter = $qtySoldAfterQuery[$product->id]->sum_qty ?? 0;

            // Sisa Stok at the end of this date
            $sisaStok = $product->stock + $qtySoldAfter;

            // Total Stok available on this date
            $totalStok = $sisaStok + $qtySold;

            // Tambahan Stok Masuk on this date (using created_at as reference)
            $isCreatedToday = Carbon::parse($product->created_at)->toDateString() === $date;
            if ($isCreatedToday) {
                $tambahanStok = $totalStok;
                $stokPagi = 0;
            } else {
                $tambahanStok = 0;
                $stokPagi = $totalStok;
            }

            // Owner (Pemilik)
            $pemilik = $product->type === 'kantin' 
                ? 'Kantin' 
                : ($product->seller ? $product->seller->name : 'Siswa');

            // Total Harga (Total Sales Value)
            $totalHarga = $qtySold * $product->selling_price;

            $reportData[] = (object)[
                'product' => $product,
                'stok_pagi' => $stokPagi,
                'tambahan_stok' => $tambahanStok,
                'total_stok' => $totalStok,
                'sisa_stok' => $sisaStok,
                'pemilik' => $pemilik,
                'qty_sold' => $qtySold,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'total_harga' => $totalHarga,
            ];
        }

        if ($request->input('export') === 'pdf') {
            $pdf = Pdf::loadView('reports.stock_pdf', compact('reportData', 'date'))
                ->setPaper('a4', 'landscape'); // Landscape to fit 10 columns
            return $pdf->stream('laporan-stok-harian-' . $date . '.pdf');
        }

        if ($request->input('export') === 'xlsx') {
            return Excel::download(new \App\Exports\StockReportExport($reportData, $date), 'laporan-stok-harian-' . $date . '.xlsx');
        }

        return Inertia::render('Reports/Stock', compact('reportData', 'date'));
    }
}
