<?php

namespace App\Services;

use App\Models\FeatureFlag;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    private const SLOT_FLAGS = [
        '09:00' => 'order_slot_09',
        '12:00' => 'order_slot_12',
    ];

    private const SLOT_CUTOFF_KEYS = [
        '09:00' => ['key' => 'marketplace_cutoff_09', 'default' => '08:00'],
        '12:00' => ['key' => 'marketplace_cutoff_12', 'default' => '10:30'],
    ];

    public function createOrder(array $validated, $user): Order
    {
        if ($validated['payment_method'] === 'qris' && ! FeatureFlag::enabled('payment_qris')) {
            throw ValidationException::withMessages(['payment_method' => 'Pembayaran QRIS belum tersedia.']);
        }

        $vendor = Vendor::findOrFail($validated['vendor_id']);
        abort_unless($vendor->status === 'active', 404);

        if (! $vendor->is_open) {
            throw ValidationException::withMessages(['vendor_id' => 'Toko sedang tutup.']);
        }

        $slot = $validated['delivery_slot'];
        $this->ensureSlotAvailable($slot);

        return DB::transaction(function () use ($validated, $vendor, $slot, $user) {
            $this->ensureSlotQuotaAvailable($vendor, $slot);

            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::where('vendor_id', $vendor->id)
                    ->where('is_active', true)
                    ->findOrFail($item['menu_item_id']);

                $unitPrice = $menuItem->price;
                $itemSubtotal = $unitPrice * $item['qty'];
                $subtotal += $itemSubtotal;

                $itemsToCreate[] = [
                    'menu_item_id' => $menuItem->id,
                    'name_snapshot' => $menuItem->name,
                    'price_snapshot' => $unitPrice,
                    'qty' => $item['qty'],
                    'notes' => $item['notes'] ?? null,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $order = Order::create([
                'student_id' => $user->id,
                'vendor_id' => $vendor->id,
                'delivery_slot' => $slot,
                'delivery_date' => now()->toDateString(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'unpaid',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $item) {
                $order->items()->create([
                    'menu_item_id' => $item['menu_item_id'],
                    'name_snapshot' => $item['name_snapshot'],
                    'price_snapshot' => $item['price_snapshot'],
                    'qty' => $item['qty'],
                    'notes' => $item['notes'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            return $order;
        });
    }

    private function ensureSlotAvailable(string $slot): void
    {
        if (! FeatureFlag::enabled(self::SLOT_FLAGS[$slot])) {
            throw ValidationException::withMessages(['delivery_slot' => 'Slot pengantaran ini sedang tidak tersedia.']);
        }

        $cutoff = self::SLOT_CUTOFF_KEYS[$slot];
        $cutoffTime = Setting::get($cutoff['key'], $cutoff['default']);

        if (now()->format('H:i') > $cutoffTime) {
            throw ValidationException::withMessages(['delivery_slot' => "Pemesanan untuk slot {$slot} sudah ditutup (batas {$cutoffTime})."]);
        }
    }

    private function ensureSlotQuotaAvailable(Vendor $vendor, string $slot): void
    {
        if ($vendor->max_orders_per_slot === null) {
            return;
        }

        $count = Order::where('vendor_id', $vendor->id)
            ->whereDate('delivery_date', now()->toDateString())
            ->where('delivery_slot', $slot)
            ->where('status', '!=', 'cancelled')
            ->lockForUpdate()
            ->count();

        if ($count >= $vendor->max_orders_per_slot) {
            throw ValidationException::withMessages(['delivery_slot' => "Slot {$slot} untuk toko ini sudah penuh."]);
        }
    }
}
