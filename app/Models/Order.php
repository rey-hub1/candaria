<?php

namespace App\Models;

use App\Traits\Filterable;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Order extends Model
{
    use Filterable, HasFactory, LogsActivity;

    protected $fillable = [
        'order_code', 'student_id', 'vendor_id', 'delivery_slot', 'delivery_date',
        'status', 'subtotal', 'total', 'payment_method', 'payment_status',
        'qris_reference', 'notes', 'cancelled_reason',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (self $order) {
            if (empty($order->order_code)) {
                $prefix = 'ORD-'.now()->format('Ymd').'-';

                $latest = static::where('order_code', 'like', $prefix.'%')
                    ->orderBy('order_code', 'desc')
                    ->first();

                $nextNumber = 1;
                if ($latest && preg_match('/(\d+)$/', $latest->order_code, $matches)) {
                    $nextNumber = ((int) $matches[1]) + 1;
                }

                $order->order_code = $prefix.str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            }
        });

        static::created(function (self $order) {
            $order->statusHistories()->create([
                'from_status' => null,
                'to_status' => $order->status,
                'changed_by' => Auth::id(),
            ]);
        });

        static::updating(function (self $order) {
            if ($order->isDirty('status')) {
                $order->statusHistories()->create([
                    'from_status' => $order->getOriginal('status'),
                    'to_status' => $order->status,
                    'changed_by' => Auth::id(),
                ]);
            }
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
}
