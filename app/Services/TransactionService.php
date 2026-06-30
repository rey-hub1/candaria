<?php

namespace App\Services;

use App\Exceptions\TransactionException;
use App\Models\ActivityLog;
use App\Models\Cashbook;
use App\Models\ChangeDebt;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    private const MAX_CODE_ATTEMPTS = 5;

    /**
     * Process a sale: validate stock & payment, persist the transaction,
     * deduct stock under row locks, and record the cashbook income.
     *
     * @param  array  $items  [['id' => int, 'quantity' => int], ...]
     *
     * @throws TransactionException
     */
    public function checkout(array $items, float $paidAmount, User $cashier, float $changeDebt = 0, ?string $customerName = null, ?string $customerClass = null): Transaction
    {
        $itemIds = array_column($items, 'id');
        $products = Product::whereIn('id', $itemIds)->get()->keyBy('id');

        $cart = [];
        $totalAmount = 0;

        foreach ($items as $item) {
            $product = $products[$item['id']] ?? null;
            if (! $product) {
                continue;
            }
            if ($product->stock < $item['quantity']) {
                throw new TransactionException("Stok {$product->name} tidak cukup.");
            }
            $totalAmount += $product->selling_price * $item['quantity'];
            $cart[] = ['product' => $product, 'quantity' => $item['quantity']];
        }

        if (empty($cart)) {
            throw new TransactionException('Keranjang belanja kosong.');
        }
        if ($paidAmount < $totalAmount) {
            throw new TransactionException('Uang bayar kurang dari total belanja.');
        }

        $changeAmount = $paidAmount - $totalAmount;

        // Kembalian yang dititipkan tak boleh melebihi kembalian sebenarnya.
        $changeDebt = max(0, min($changeDebt, $changeAmount));

        return DB::transaction(function () use ($cart, $totalAmount, $paidAmount, $changeAmount, $changeDebt, $customerName, $customerClass, $cashier) {
            $transaction = $this->createTransactionWithCode($cashier, $totalAmount, $paidAmount, $changeAmount);

            foreach ($cart as $line) {
                /** @var Product $product */
                $product = $line['product'];
                $qty = $line['quantity'];

                $locked = Product::lockForUpdate()->findOrFail($product->id);
                if ($locked->stock < $qty) {
                    throw new TransactionException("Stok produk {$locked->name} tidak mencukupi.");
                }
                $locked->decrement('stock', $qty);

                $costPrice = $locked->cost_price;
                $sellingPrice = $locked->selling_price;
                $profitKantin = ($sellingPrice - $costPrice) * $qty;
                $profitSeller = $locked->type === 'siswa' ? $costPrice * $qty : 0;

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $locked->id,
                    'quantity' => $qty,
                    'cost_price' => $costPrice,
                    'selling_price' => $sellingPrice,
                    'profit_kantin' => $profitKantin,
                    'profit_seller' => $profitSeller,
                    'seller_settlement_id' => null,
                ]);
            }

            Cashbook::create([
                'date' => now()->toDateString(),
                'description' => 'Penjualan '.$transaction->transaction_code,
                'type' => 'debit',
                'amount' => $transaction->total_amount,
                'source' => 'transaction',
                'reference_id' => $transaction->id,
                'user_id' => $cashier->id,
            ]);

            // Kembalian dititip (kasir tak bisa kasih kembalian penuh) → hutang ke
            // customer. Uang receh-nya tetap di laci, jadi catat sebagai kas masuk.
            if ($changeDebt > 0) {
                $debt = ChangeDebt::create([
                    'transaction_id' => $transaction->id,
                    'customer_name' => $customerName,
                    'customer_class' => $customerClass,
                    'amount' => $changeDebt,
                    'status' => ChangeDebt::STATUS_UNPAID,
                    'date' => now()->toDateString(),
                    'created_by' => $cashier->id,
                ]);

                $label = trim(($customerName ?? '').($customerClass ? ' - '.$customerClass : ''));

                Cashbook::create([
                    'date' => now()->toDateString(),
                    'description' => 'Hutang kembalian '.$transaction->transaction_code.($label !== '' ? ' ('.$label.')' : ''),
                    'type' => 'debit',
                    'amount' => $changeDebt,
                    'source' => 'change_debt',
                    'reference_id' => $debt->id,
                    'user_id' => $cashier->id,
                ]);
            }

            ActivityLog::record('checkout', "Transaksi {$transaction->transaction_code} sebesar Rp".number_format($totalAmount, 0, ',', '.'), $transaction, [
                'total_amount' => $totalAmount,
                'items' => count($cart),
            ]);

            return $transaction;
        });
    }

    /**
     * Void a transaction: reverse stock, soft-delete its items (so reports
     * exclude them), keep the record with a voided status, and post a contra
     * cashbook entry instead of deleting the original income.
     *
     * @throws TransactionException
     */
    public function void(Transaction $transaction, ?string $reason, User $admin): Transaction
    {
        if ($transaction->isVoided()) {
            throw new TransactionException('Transaksi sudah dibatalkan sebelumnya.');
        }

        return DB::transaction(function () use ($transaction, $reason, $admin) {
            // Re-fetch + lock di dalam transaction supaya dua request void bersamaan
            // tidak menggandakan pengembalian stok & contra cashbook (cek TOCTOU).
            $locked = Transaction::lockForUpdate()->findOrFail($transaction->id);
            if ($locked->isVoided()) {
                throw new TransactionException('Transaksi sudah dibatalkan sebelumnya.');
            }

            $items = $locked->items()->get();

            foreach ($items as $item) {
                if ($item->seller_settlement_id !== null) {
                    throw new TransactionException('Transaksi tidak dapat dibatalkan karena keuntungan sudah dicairkan ke penitip.');
                }
            }

            $itemsByProduct = $items->groupBy('product_id');

            foreach ($itemsByProduct as $productId => $group) {
                $product = Product::lockForUpdate()->find($productId);
                if ($product) {
                    $product->increment('stock', $group->sum('quantity'));
                }
            }

            // Bulk soft-delete in one query — excluded from all aggregates
            TransactionItem::whereIn('id', $items->pluck('id'))->update(['deleted_at' => now()]);

            // Contra entry keeps the cashbook audit trail intact (net zero).
            Cashbook::create([
                'date' => now()->toDateString(),
                'description' => 'Pembatalan '.$locked->transaction_code,
                'type' => 'credit',
                'amount' => $locked->total_amount,
                'source' => 'transaction',
                'reference_id' => $locked->id,
                'user_id' => $admin->id,
            ]);

            // Hutang kembalian ikut dibatalkan: kalau belum dilunasi, balikkan kas
            // receh-nya (contra credit) dan tandai cancelled supaya tak bisa "dibayar"
            // untuk transaksi yang sudah tidak ada. Kalau sudah dilunasi, kas debit
            // (checkout) & credit (pelunasan) sudah net-zero — tak perlu apa-apa.
            $debt = $locked->changeDebt;
            if ($debt && $debt->status === ChangeDebt::STATUS_UNPAID) {
                Cashbook::create([
                    'date' => now()->toDateString(),
                    'description' => 'Pembatalan hutang kembalian '.$locked->transaction_code,
                    'type' => 'credit',
                    'amount' => $debt->amount,
                    'source' => 'change_debt',
                    'reference_id' => $debt->id,
                    'user_id' => $admin->id,
                ]);

                $debt->update(['status' => ChangeDebt::STATUS_CANCELLED]);
            }

            $locked->update([
                'status' => Transaction::STATUS_VOIDED,
                'voided_at' => now(),
                'void_reason' => $reason,
                'voided_by' => $admin->id,
            ]);

            ActivityLog::record('voided', "Membatalkan transaksi {$locked->transaction_code}", $locked, [
                'reason' => $reason,
            ]);

            return $locked;
        });
    }

    /**
     * Lunasi hutang kembalian: tandai paid + catat kas keluar (uang receh
     * akhirnya diberikan ke customer). Idempotent — abaikan jika sudah lunas.
     *
     * @throws TransactionException
     */
    public function settleChangeDebt(ChangeDebt $debt, User $user): ChangeDebt
    {
        if ($debt->status !== ChangeDebt::STATUS_UNPAID) {
            throw new TransactionException('Hutang kembalian ini sudah dilunasi atau dibatalkan.');
        }

        return DB::transaction(function () use ($debt, $user) {
            // Lock + re-cek status di dalam transaction supaya dua request pelunasan
            // bersamaan tidak menggandakan kas keluar (race double-payment).
            $locked = ChangeDebt::lockForUpdate()->findOrFail($debt->id);
            if ($locked->status !== ChangeDebt::STATUS_UNPAID) {
                throw new TransactionException('Hutang kembalian ini sudah dilunasi atau dibatalkan.');
            }

            $locked->update([
                'status' => ChangeDebt::STATUS_PAID,
                'paid_at' => now(),
                'paid_by' => $user->id,
            ]);

            Cashbook::create([
                'date' => now()->toDateString(),
                'description' => 'Pembayaran hutang kembalian'.($locked->transaction ? ' '.$locked->transaction->transaction_code : '').($locked->customer_note ? ' ('.$locked->customer_note.')' : ''),
                'type' => 'credit',
                'amount' => $locked->amount,
                'source' => 'change_debt',
                'reference_id' => $locked->id,
                'user_id' => $user->id,
            ]);

            return $locked;
        });
    }

    /**
     * Generate a daily-sequential 5-digit code, retrying on the rare
     * concurrent-collision (two cashiers checking out simultaneously).
     */
    private function createTransactionWithCode(User $cashier, float $total, float $paid, float $change): Transaction
    {
        $date = now()->toDateString();
        $max = Transaction::where('transaction_date', $date)->max('transaction_code');
        $next = $max ? ((int) $max) + 1 : 1;

        $lastError = null;
        for ($attempt = 0; $attempt < self::MAX_CODE_ATTEMPTS; $attempt++) {
            $code = str_pad($next, 5, '0', STR_PAD_LEFT);
            try {
                return Transaction::create([
                    'transaction_code' => $code,
                    'transaction_date' => $date,
                    'user_id' => $cashier->id,
                    'total_amount' => $total,
                    'paid_amount' => $paid,
                    'change_amount' => $change,
                    'status' => Transaction::STATUS_COMPLETED,
                ]);
            } catch (QueryException $e) {
                // Composite unique (transaction_date, transaction_code) hit:
                // another sale grabbed this number first — bump and retry.
                $lastError = $e;
                $next++;
            }
        }

        throw new TransactionException('Gagal membuat kode transaksi, coba lagi.', 0, $lastError);
    }
}
