<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Vendor;
use App\Models\VendorLedger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VendorWalletService
{
    public function credit(Vendor $vendor, float $amount, ?Order $order, string $description): VendorLedger
    {
        return $this->applyMutation($vendor, $amount, 'credit', $order, $description);
    }

    public function debit(Vendor $vendor, float $amount, string $description): VendorLedger
    {
        return $this->applyMutation($vendor, -$amount, 'debit', null, $description);
    }

    private function applyMutation(Vendor $vendor, float $signedAmount, string $type, ?Order $order, string $description): VendorLedger
    {
        return DB::transaction(function () use ($vendor, $signedAmount, $type, $order, $description) {
            $locked = Vendor::lockForUpdate()->findOrFail($vendor->id);

            $balanceAfter = $locked->balance + $signedAmount;

            if ($balanceAfter < 0) {
                throw ValidationException::withMessages([
                    'amount' => "Saldo {$locked->name} tidak mencukupi.",
                ]);
            }

            $locked->update(['balance' => $balanceAfter]);

            return VendorLedger::create([
                'vendor_id' => $locked->id,
                'order_id' => $order?->id,
                'type' => $type,
                'amount' => abs($signedAmount),
                'balance_after' => $balanceAfter,
                'description' => $description,
                'created_by' => Auth::id(),
            ]);
        });
    }
}
