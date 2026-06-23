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
use App\Services\ReportService;
use Maatwebsite\Excel\Facades\Excel;

use Inertia\Inertia;

class ReportController extends Controller
{
    // Laporan Penjualan Harian & Keuntungan Kantin
    public function sales(Request $request, ReportService $reportService)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $salesData = $reportService->getSalesData($startDate, $endDate);

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
    public function titipan(Request $request, ReportService $reportService)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $sellerId = $request->input('seller_id');
        $sellers = \App\Models\Seller::where('is_active', true)->get(['id', 'name', 'class']);

        $filters = [
            'search'   => $request->input('search', ''),
            'status'   => $request->input('status', ''),
            'sort'     => $request->input('sort', 'date'),
            'dir'      => $request->input('dir', 'desc'),
            'per_page' => $request->input('per_page', 15),
        ];

        $isPdf = $request->input('export') === 'pdf';
        $items = $reportService->getTitipanItems($startDate, $endDate, $sellerId, $isPdf, $filters);
        $summary = $reportService->getTitipanSummary($startDate, $endDate, $sellerId, $filters);

        if ($request->input('export') === 'pdf') {
            $pdf = Pdf::loadView('reports.titipan_pdf', compact(
                'items', 
                'startDate', 
                'endDate', 
                'summary',
                'sellerId',
                'sellers'
            ))->setPaper('a4', 'landscape');
            return $pdf->stream('laporan-titipan-siswa-' . $startDate . '-to-' . $endDate . '.pdf');
        }

        if ($request->input('export') === 'xlsx') {
            return Excel::download(new TitipanReportExport(
                $items,
                $startDate,
                $endDate,
                $summary,
                $sellerId,
                $sellers
            ), 'laporan-titipan-siswa-' . $startDate . '-to-' . $endDate . '.xlsx');
        }

        return Inertia::render('Reports/Titipan', compact('items', 'startDate', 'endDate', 'summary', 'sellerId', 'sellers', 'filters'));
    }

    // Laporan Penjualan untuk Siswa Penitip (read-only, scoped ke seller sendiri)
    public function penitip(Request $request, ReportService $reportService)
    {
        $user = $request->user();
        if ($user->role !== 'penitip') {
            abort(403);
        }

        $seller = \App\Models\Seller::where('phone', $user->phone)->first();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$seller) {
            $items = TransactionItem::whereRaw('0 = 1')->paginate(15);
            $summary = (object) ['total_qty' => 0, 'total_seller' => 0, 'total_kantin' => 0, 'qty_week' => 0, 'qty_month' => 0, 'qty_all' => 0, 'total_products' => 0];
        } else {
            $items = $reportService->getTitipanItems($startDate, $endDate, $seller->id);
            $summary = $reportService->getTitipanSummary($startDate, $endDate, $seller->id);
        }

        return Inertia::render('Reports/Penitip', compact('items', 'startDate', 'endDate', 'summary'));
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
        $date = $request->input('date')
            ? Carbon::parse($request->input('date'))->toDateString()
            : Carbon::now()->toDateString();
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
