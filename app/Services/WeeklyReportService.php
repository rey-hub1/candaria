<?php

namespace App\Services;

use App\Models\Cashbook;
use App\Models\ChangeDebt;
use App\Models\Consignment;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Laporan mingguan: rekap KONSYIANSI (per hari, per seller) & HARIAN
 * (penjualan / pengeluaran / keuangan). Semua angka diturunkan dari data POS
 * (transaction_date untuk transaksi, kolom date untuk consignment & cashbook).
 * Baris manual (kas masuk, hutang customer, dst) tidak ada di POS → dikosongkan.
 */
class WeeklyReportService
{
    public const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    public const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    /** "15 Juni 2026" (config locale default 'en', jadi format manual). */
    public function tanggalIndo(Carbon $date): string
    {
        return $date->format('d').' '.self::BULAN[$date->month].' '.$date->format('Y');
    }

    /** Senin–Minggu dari minggu yang memuat $anchor. */
    public function weekRange($anchor): array
    {
        $date = $anchor ? Carbon::parse($anchor) : Carbon::today();

        return [$date->copy()->startOfWeek(Carbon::MONDAY), $date->copy()->endOfWeek(Carbon::SUNDAY)];
    }

    public function namaHari(Carbon $date): string
    {
        return self::HARI[$date->dayOfWeekIso - 1];
    }

    /** Tanggal dalam rentang yang punya aktivitas (transaksi atau consignment). */
    public function activeDays(Carbon $start, Carbon $end): array
    {
        $txnDays = Transaction::active()
            ->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()])
            ->pluck('transaction_date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString());

        $consDays = Consignment::whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->pluck('date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString());

        return $txnDays->merge($consDays)->unique()->sort()->values()
            ->map(fn ($d) => Carbon::parse($d))->all();
    }

    /** Qty terjual per product pada satu tanggal (transaction_date), transaksi aktif saja. */
    protected function soldByProduct(string $date): Collection
    {
        return TransactionItem::query()
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', Transaction::STATUS_COMPLETED)
            ->whereDate('transactions.transaction_date', $date)
            ->groupBy('transaction_items.product_id')
            ->selectRaw('transaction_items.product_id as pid, SUM(transaction_items.quantity) as qty')
            ->pluck('qty', 'pid');
    }

    /** Stok masuk (type=in) per product pada satu tanggal. */
    protected function stockInByProduct(string $date): Collection
    {
        return Consignment::where('type', 'in')
            ->whereDate('date', $date)
            ->groupBy('product_id')
            ->selectRaw('product_id as pid, SUM(quantity) as qty')
            ->pluck('qty', 'pid');
    }

    /**
     * Rekap konsyiansi satu hari: list seller (punya produk titipan) beserta
     * baris produk & subtotal stor. Seller tanpa aktivitas tetap ditampilkan
     * (mirip file referensi) agar daftar penitip konsisten tiap minggu.
     */
    public function consignmentDay(Carbon $date): array
    {
        $d = $date->toDateString();
        $sold = $this->soldByProduct($d);
        $stockIn = $this->stockInByProduct($d);

        $sellers = Seller::where('is_active', true)
            ->with(['products' => fn ($q) => $q->where('type', 'siswa')->orderBy('name')])
            ->orderBy('name')
            ->get();

        $rows = [];
        foreach ($sellers as $seller) {
            $products = [];
            $subtotalStor = 0;
            foreach ($seller->products as $p) {
                $terjual = (int) ($sold[$p->id] ?? 0);
                $stokAwal = (int) ($stockIn[$p->id] ?? 0);
                $cost = (int) $p->cost_price;
                $sell = (int) $p->selling_price;
                $penerimaan = $terjual * $sell;
                $stor = $terjual * $cost;
                $laba = $terjual * ($sell - $cost);
                $subtotalStor += $stor;
                $products[] = [
                    'name' => $p->name,
                    'stok_awal' => $stokAwal,
                    'sisa' => max(0, $stokAwal - $terjual),
                    'terjual' => $terjual,
                    'harga_reseller' => $cost,
                    'harga_jual' => $sell,
                    'penerimaan' => $penerimaan,
                    'stor' => $stor,
                    'laba' => $laba,
                ];
            }
            $rows[] = [
                'name' => $seller->name,
                'class' => $seller->class,
                'phone' => $seller->phone,
                'products' => $products,
                'subtotal_stor' => $subtotalStor,
            ];
        }

        return $rows;
    }

    /** Penjualan harian produk kantin (rekonstruksi stok seperti ReportController::stock). */
    public function dailySales(Carbon $date): array
    {
        $d = $date->toDateString();
        $sold = $this->soldByProduct($d);

        // Qty terjual SETELAH tanggal ini (untuk merekonstruksi stok historis).
        $soldAfter = TransactionItem::query()
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', Transaction::STATUS_COMPLETED)
            ->whereDate('transactions.transaction_date', '>', $d)
            ->groupBy('transaction_items.product_id')
            ->selectRaw('transaction_items.product_id as pid, SUM(transaction_items.quantity) as qty')
            ->pluck('qty', 'pid');

        $products = Product::where('type', 'kantin')->orderBy('name')->get();
        $rows = [];
        foreach ($products as $p) {
            $terjual = (int) ($sold[$p->id] ?? 0);
            $after = (int) ($soldAfter[$p->id] ?? 0);
            $sisa = (int) $p->stock + $after;          // sisa di akhir hari D
            $total = $sisa + $terjual;                 // total stok tersedia hari D
            $rows[] = [
                'name' => $p->name,
                'stok_pagi' => $total,
                'tambahan' => 0,
                'total_stok' => $total,
                'sisa' => $sisa,
                'terjual' => $terjual,
                'hpp' => (int) $p->cost_price,
                'harga_jual' => (int) $p->selling_price,
                'total_harga' => $terjual * (int) $p->selling_price,
            ];
        }

        return $rows;
    }

    /** Pengeluaran manual dari buku kas (type=credit/keluar, source=manual). */
    public function dailyExpenses(Carbon $date): array
    {
        return Cashbook::where('type', 'credit')
            ->where('source', 'manual')
            ->whereDate('date', $date->toDateString())
            ->orderBy('id')
            ->get(['description', 'amount'])
            ->map(fn ($c) => ['keterangan' => $c->description, 'total' => (int) $c->amount])
            ->all();
    }

    /** Ringkasan keuangan harian yang bisa diturunkan dari POS. */
    public function dailyFinance(Carbon $date): array
    {
        $d = $date->toDateString();

        $penjualanHarian = (int) Transaction::active()->whereDate('transaction_date', $d)->sum('total_amount');

        $pengeluaran = (int) Cashbook::where('type', 'credit')->where('source', 'manual')
            ->whereDate('date', $d)->sum('amount');

        // Konsyiansi: penerimaan = Σ harga jual×qty produk titipan; stor = Σ HPP×qty (profit_seller).
        $kons = TransactionItem::query()
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->where('transactions.status', Transaction::STATUS_COMPLETED)
            ->where('products.type', 'siswa')
            ->whereDate('transactions.transaction_date', $d)
            ->selectRaw('COALESCE(SUM(transaction_items.selling_price * transaction_items.quantity),0) as omset')
            ->selectRaw('COALESCE(SUM(transaction_items.profit_seller),0) as stor')
            ->first();

        // Hutang kembalian: yang baru dititip (kas masuk) & yang dilunasi (kas keluar) hari itu.
        $hutangCustomer = (int) ChangeDebt::whereDate('date', $d)->sum('amount');
        $pembayaranUtang = (int) ChangeDebt::where('status', ChangeDebt::STATUS_PAID)
            ->whereDate('paid_at', $d)->sum('amount');

        return [
            // Kantin-only: total penjualan dikurangi omset konsinyasi, supaya tidak
            // double-count dengan baris "Omset Konsyiansi" di ledger harian.
            'penjualan_harian' => $penjualanHarian - (int) $kons->omset,
            'pengeluaran' => $pengeluaran,
            'omset_konsyiansi' => (int) $kons->omset,
            'stor_ke_seller' => (int) $kons->stor,
            'hutang_customer' => $hutangCustomer,
            'pembayaran_utang' => $pembayaranUtang,
        ];
    }

    /** Rincian hutang kembalian ke customer yang dibuat pada satu tanggal. */
    public function changeDebtsForDay(Carbon $date): Collection
    {
        return ChangeDebt::whereDate('date', $date->toDateString())
            ->orderBy('id')
            ->get(['customer_name', 'customer_class', 'customer_note', 'amount', 'status']);
    }
}
