<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChangeDebt extends Model
{
    use \App\Traits\Filterable, \App\Traits\LogsActivity;

    public const STATUS_UNPAID = 'unpaid';
    public const STATUS_PAID = 'paid';

    protected $fillable = [
        'transaction_id',
        'customer_name',
        'customer_class',
        'customer_note',
        'amount',
        'status',
        'date',
        'paid_at',
        'created_by',
        'paid_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function scopeUnpaid($query)
    {
        return $query->where('status', self::STATUS_UNPAID);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}
