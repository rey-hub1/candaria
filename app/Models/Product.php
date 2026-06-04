<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use \App\Traits\Filterable;

    protected $fillable = [
        'category_id',
        'seller_id',
        'name',
        'code',
        'type',
        'cost_price',
        'selling_price',
        'stock',
        'image'
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            if ($product->type === 'siswa') {
                $product->selling_price = $product->cost_price + static::resolveMargin($product->cost_price);
            }

            if (empty($product->code)) {
                $category = \App\Models\Category::find($product->category_id);
                $prefix = $category ? ($category->prefix ?: strtoupper(substr($category->name, 0, 1))) : 'X';
                
                $latest = static::where('code', 'like', $prefix . '%')
                                ->orderBy('code', 'desc')
                                ->first();
                
                $nextNumber = 1;
                if ($latest && preg_match('/^' . preg_quote($prefix, '/') . '(\d+)$/', $latest->code, $matches)) {
                    $nextNumber = ((int)$matches[1]) + 1;
                }
                
                $code = $prefix . str_pad($nextNumber, 2, '0', STR_PAD_LEFT);
                while (static::where('code', $code)->exists()) {
                    $nextNumber++;
                    $code = $prefix . str_pad($nextNumber, 2, '0', STR_PAD_LEFT);
                }
                $product->code = $code;
            }
        });
    }

    public static function resolveMargin(int|float $costPrice): int
    {
        $rules = cache()->remember('margin_rules_all', 3600, function () {
            return \App\Models\MarginRule::orderBy('min_price', 'desc')->get(['min_price', 'max_price', 'margin']);
        });

        foreach ($rules as $rule) {
            if ($rule->min_price <= $costPrice && (is_null($rule->max_price) || $rule->max_price > $costPrice)) {
                return (int) $rule->margin;
            }
        }

        return 500;
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
