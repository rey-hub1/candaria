<?php

namespace App\Services;

use App\Exceptions\TransactionException;
use App\Models\ActivityLog;
use App\Models\Cashbook;
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
    public function checkout(array $items, float $paidAmount, User $cashier): Transaction
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

        return DB::transaction(function () use ($cart, $totalAmount, $paidAmount, $changeAmount, $cashier) {
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

        foreach ($transaction->items as $item) {
            if ($item->seller_settlement_id !== null) {
                throw new TransactionException('Transaksi tidak dapat dibatalkan karena keuntungan sudah dicairkan ke penitip.');
            }
        }

        return DB::transaction(function () use ($transaction, $reason, $admin) {
            foreach ($transaction->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if ($product) {
                    $product->increment('stock', $item->quantity);
                }
                $item->delete(); // soft delete — excluded from all aggregates
            }

            // Contra entry keeps the cashbook audit trail intact (net zero).
            Cashbook::create([
                'date' => now()->toDateString(),
                'description' => 'Pembatalan '.$transaction->transaction_code,
                'type' => 'credit',
                'amount' => $transaction->total_amount,
                'source' => 'transaction',
                'reference_id' => $transaction->id,
                'user_id' => $admin->id,
            ]);

            $transaction->update([
                'status' => Transaction::STATUS_VOIDED,
                'voided_at' => now(),
                'void_reason' => $reason,
                'voided_by' => $admin->id,
            ]);

            ActivityLog::record('voided', "Membatalkan transaksi {$transaction->transaction_code}", $transaction, [
                'reason' => $reason,
            ]);

            return $transaction;
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
