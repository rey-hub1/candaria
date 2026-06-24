<?php

namespace App\Models;

use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use Filterable;

    const STATUS_COMPLETED = 'completed';

    const STATUS_VOIDED = 'voided';

    protected $fillable = [
        'transaction_code',
        'user_id',
        'total_amount',
        'paid_amount',
        'change_amount',
        'status',
        'transaction_date',
        'voided_at',
        'void_reason',
        'voided_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'voided_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function changeDebt(): HasOne
    {
        return $this->hasOne(ChangeDebt::class);
    }

    public function isVoided(): bool
    {
        return $this->status === self::STATUS_VOIDED;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeVoided(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_VOIDED);
    }
}
