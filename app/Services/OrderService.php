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
                $menuItem = MenuItem::with('optionGroups.options')
                    ->where('vendor_id', $vendor->id)
                    ->where('is_active', true)
                    ->findOrFail($item['menu_item_id']);

                $optionIds = collect($item['option_ids'] ?? []);
                $selectedOptions = collect();

                foreach ($menuItem->optionGroups as $group) {
                    $selectedInGroup = $group->options->whereIn('id', $optionIds);
                    $count = $selectedInGroup->count();

                    if ($group->type === 'single') {
                        if ($count > 1) {
                            throw ValidationException::withMessages(['items' => "Pilihan \"{$group->name}\" hanya boleh 1."]);
                        }
                        if ($group->is_required && $count !== 1) {
                            throw ValidationException::withMessages(['items' => "Pilihan \"{$group->name}\" wajib dipilih."]);
                        }
                    } else {
                        if ($count < $group->min_select) {
                            throw ValidationException::withMessages(['items' => "Pilihan \"{$group->name}\" minimal {$group->min_select}."]);
                        }
                        if ($group->max_select !== null && $count > $group->max_select) {
                            throw ValidationException::withMessages(['items' => "Pilihan \"{$group->name}\" maksimal {$group->max_select}."]);
                        }
                    }

                    foreach ($selectedInGroup as $option) {
                        $selectedOptions->push([
                            'group_name' => $group->name,
                            'option_name' => $option->name,
                            'price_delta' => $option->price_delta,
                        ]);
                    }
                }

                $unitPrice = $menuItem->price + $selectedOptions->sum('price_delta');
                $itemSubtotal = $unitPrice * $item['qty'];
                $subtotal += $itemSubtotal;

                $itemsToCreate[] = [
                    'menu_item_id' => $menuItem->id,
                    'name_snapshot' => $menuItem->name,
                    'price_snapshot' => $unitPrice,
                    'qty' => $item['qty'],
                    'notes' => $item['notes'] ?? null,
                    'subtotal' => $itemSubtotal,
                    'options' => $selectedOptions,
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
                $orderItem = $order->items()->create([
                    'menu_item_id' => $item['menu_item_id'],
                    'name_snapshot' => $item['name_snapshot'],
                    'price_snapshot' => $item['price_snapshot'],
                    'qty' => $item['qty'],
                    'notes' => $item['notes'],
                    'subtotal' => $item['subtotal'],
                ]);

                foreach ($item['options'] as $option) {
                    $orderItem->options()->create([
                        'option_group_name_snapshot' => $option['group_name'],
                        'option_name_snapshot' => $option['option_name'],
                        'price_delta_snapshot' => $option['price_delta'],
                    ]);
                }
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
