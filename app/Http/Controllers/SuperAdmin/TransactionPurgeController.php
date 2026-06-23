<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionPurgeController extends Controller
{
    /**
     * Hapus transaksi yang LEBIH TUA dari rentang terpilih (purge arsip).
     * Item transaksi ikut terhapus otomatis lewat FK cascade DB.
     * Entri buku kas (Cashbook source=transaction) sengaja DIBIARKAN.
     */
    public const RANGES = ['1w', '1m', '3m', '6m', '1y'];

    /** Hitung tanggal batas: transaksi dengan transaction_date < cutoff akan dihapus. */
    private function cutoff(string $range): Carbon
    {
        $today = Carbon::today();

        return match ($range) {
            '1w' => $today->copy()->subWeek(),
            '1m' => $today->copy()->subMonth(),
            '3m' => $today->copy()->subMonths(3),
            '6m' => $today->copy()->subMonths(6),
            '1y' => $today->copy()->subYear(),
        };
    }

    public function index(): Response
    {
        $previews = [];
        foreach (self::RANGES as $range) {
            $cutoff = $this->cutoff($range);
            $previews[$range] = [
                'cutoff' => $cutoff->toDateString(),
                'count' => Transaction::whereDate('transaction_date', '<', $cutoff)->count(),
            ];
        }

        return Inertia::render('SuperAdmin/PurgeTransactions', [
            'previews' => $previews,
            'totals' => [
                'transactions' => Transaction::count(),
                'oldest' => optional(Transaction::min('transaction_date'))
                    ? Carbon::parse(Transaction::min('transaction_date'))->toDateString()
                    : null,
            ],
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'range' => ['required', 'in:'.implode(',', self::RANGES)],
        ]);

        $cutoff = $this->cutoff($validated['range']);

        $deleted = DB::transaction(function () use ($cutoff) {
            // Query-builder delete → SQL DELETE memicu FK cascade pada transaction_items.
            // Buku kas (Cashbook) tidak disentuh.
            return Transaction::whereDate('transaction_date', '<', $cutoff)->delete();
        });

        $labels = ['1w' => '1 minggu', '1m' => '1 bulan', '3m' => '3 bulan', '6m' => '6 bulan', '1y' => '1 tahun'];
        $label = $labels[$validated['range']];

        return redirect()->route('super-admin.purge-transactions.index')
            ->with('success', "{$deleted} transaksi lebih tua dari {$label} (sebelum {$cutoff->toDateString()}) berhasil dihapus permanen.");
    }
}
