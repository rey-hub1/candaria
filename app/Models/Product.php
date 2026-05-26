<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'seller_id',
        'name',
        'code',
        'type',
        'cost_price',
        'selling_price',
        'stock'
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            if ($product->type === 'siswa') {
                $product->selling_price = $product->cost_price + 500;
            }

            if (empty($product->code)) {
                // Generate simple sequential code (e.g., 001, 002)
                $latest = static::orderBy('code', 'desc')->first();
                $nextNumber = $latest && preg_match('/^(\d{3,})$/', $latest->code) ? ((int)$latest->code) + 1 : 1;
                $code = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
                // Ensure uniqueness (unlikely to collide but double‑check)
                while (static::where('code', $code)->exists()) {
                    $nextNumber++;
                    $code = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
                }
                $product->code = $code;
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
