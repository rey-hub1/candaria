<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function getSalesData($startDate, $endDate)
    {
        // Pakai transaction_date (tanggal bisnis) — konsisten dgn laporan mingguan & titipan.
        $salesDataQuery = Transaction::active()->select(
            DB::raw('DATE(transaction_date) as date'),
            DB::raw('COUNT(id) as transaction_count'),
            DB::raw('SUM(total_amount) as total_sales')
        )
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(transaction_date)'), [$startDate, $endDate]);
            })
            ->groupBy(DB::raw('DATE(transaction_date)'))
            ->orderBy('date', 'desc')
            ->get()->keyBy('date');

        // Profit per tanggal bisnis: join ke transactions (aktif), group by transaction_date.
        $profitsQuery = TransactionItem::query()
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', Transaction::STATUS_COMPLETED)
            ->select(
                DB::raw('DATE(transactions.transaction_date) as date'),
                DB::raw('SUM(transaction_items.profit_kantin) as profit_kantin'),
                DB::raw('SUM(transaction_items.profit_seller) as profit_seller')
            )
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(transactions.transaction_date)'), [$startDate, $endDate]);
            })
            ->groupBy(DB::raw('DATE(transactions.transaction_date)'))
            ->get()->keyBy('date');

        $result = [];
        foreach ($salesDataQuery as $date => $data) {
            $data->profit_kantin = $profitsQuery[$date]->profit_kantin ?? 0;
            $data->profit_seller = $profitsQuery[$date]->profit_seller ?? 0;
            $result[] = $data;
        }

        return collect($result);
    }

    public function getTitipanItems($startDate, $endDate, $sellerId, $isPdf = false, $filters = [])
    {
        $search = trim($filters['search'] ?? '');
        $status = $filters['status'] ?? '';
        $sort = $filters['sort'] ?? 'date';
        $dir = strtolower($filters['dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 15);
        $perPage = in_array($perPage, [15, 25, 50, 100]) ? $perPage : 15;

        // Kolom yang boleh di-sort (whitelist) — hindari SQL injection.
        // 'date' di-map ke transactions.transaction_date (butuh join).
        $sortMap = [
            'date' => 'transactions.transaction_date',
            'quantity' => 'transaction_items.quantity',
            'profit_seller' => 'transaction_items.profit_seller',
            'profit_kantin' => 'transaction_items.profit_kantin',
            'cost_price' => 'transaction_items.cost_price',
        ];
        $sort = array_key_exists($sort, $sortMap) ? $sort : 'date';
        $orderColumn = $sortMap[$sort];

        $query = TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.status', Transaction::STATUS_COMPLETED)
            ->select('transaction_items.*')
            ->whereHas('product', function ($q) use ($sellerId, $search) {
                $q->where('type', 'siswa')
                    ->when($sellerId, function ($q2) use ($sellerId) {
                        return $q2->where('seller_id', $sellerId);
                    })
                    ->when($search !== '', function ($q2) use ($search) {
                        return $q2->where(function ($q3) use ($search) {
                            $q3->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%")
                                ->orWhereHas('seller', fn ($q4) => $q4->where('name', 'like', "%{$search}%"));
                        });
                    });
            })
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(transactions.transaction_date)'), [$startDate, $endDate]);
            })
            ->when($status === 'paid', fn ($q) => $q->whereNotNull('transaction_items.seller_settlement_id'))
            ->when($status === 'unpaid', fn ($q) => $q->whereNull('transaction_items.seller_settlement_id'))
            ->with(['product.seller', 'transaction', 'settlement'])
            ->orderBy($orderColumn, $dir);

        $result = $isPdf ? $query->get() : $query->paginate($perPage)->withQueryString();

        // Stok awal = stok saat ini + total terjual sepanjang waktu (rekonstruksi penerimaan awal)
        $collection = $isPdf ? $result : $result->getCollection();
        $productIds = $collection->pluck('product_id')->unique()->filter();
        $soldTotals = TransactionItem::whereIn('product_id', $productIds)
            ->selectRaw('product_id, SUM(quantity) as sum_qty')
            ->groupBy('product_id')
            ->pluck('sum_qty', 'product_id');

        $collection->each(function ($item) use ($soldTotals) {
            $sold = $soldTotals[$item->product_id] ?? 0;
            $item->stok_awal = ($item->product->stock ?? 0) + $sold;
        });

        return $result;
    }

    public function getTitipanSummary($startDate, $endDate, $sellerId, $filters = [])
    {
        $search = trim($filters['search'] ?? '');
        $status = $filters['status'] ?? '';

        $base = fn () => TransactionItem::query()
            ->whereHas('transaction', fn ($t) => $t->where('status', Transaction::STATUS_COMPLETED))
            ->whereHas('product', function ($q) use ($sellerId, $search) {
                $q->where('type', 'siswa')
                    ->when($sellerId, function ($q2) use ($sellerId) {
                        return $q2->where('seller_id', $sellerId);
                    })
                    ->when($search !== '', function ($q2) use ($search) {
                        return $q2->where(function ($q3) use ($search) {
                            $q3->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%")
                                ->orWhereHas('seller', fn ($q4) => $q4->where('name', 'like', "%{$search}%"));
                        });
                    });
            });

        // Filter rentang tanggal pakai transactions.transaction_date (bukan created_at)
        $dateBetween = fn ($q, $from, $to) => $q->whereHas('transaction', fn ($t) => $t->whereBetween(DB::raw('DATE(transaction_date)'), [$from, $to]));

        $summary = $base()
            ->when($startDate && $endDate, fn ($q) => $dateBetween($q, $startDate, $endDate))
            ->when($status === 'paid', fn ($q) => $q->whereNotNull('seller_settlement_id'))
            ->when($status === 'unpaid', fn ($q) => $q->whereNull('seller_settlement_id'))
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_qty')
            ->selectRaw('COALESCE(SUM(profit_seller), 0) as total_seller')
            ->selectRaw('COALESCE(SUM(profit_kantin), 0) as total_kantin')
            ->first();

        // Barang terjual minggu ini / bulan ini / total (lepas dari filter tanggal)
        $summary->qty_week = $dateBetween($base(), now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString())
            ->sum('quantity');
        $summary->qty_month = $dateBetween($base(), now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString())
            ->sum('quantity');
        $summary->qty_all = $base()->sum('quantity');

        // Total produk titipan (jumlah produk, bukan stok)
        $summary->total_products = Product::where('type', 'siswa')
            ->when($sellerId, fn ($q) => $q->where('seller_id', $sellerId))
            ->when($search !== '', function ($q) use ($search) {
                return $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhereHas('seller', fn ($q3) => $q3->where('name', 'like', "%{$search}%"));
                });
            })
            ->count();

        return $summary;
    }
}
