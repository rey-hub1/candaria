<?php

namespace App\Models;

use App\Traits\Filterable;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Vendor extends Model
{
    use Filterable, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 'logo', 'category',
        'status', 'phone', 'address', 'balance', 'is_open', 'max_orders_per_slot', 'joined_at',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_open' => 'boolean',
        'joined_at' => 'datetime',
    ];

    protected $appends = ['logo_url'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (self $vendor) {
            if (empty($vendor->slug)) {
                $base = Str::slug($vendor->name);
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $base.'-'.(++$i);
                }
                $vendor->slug = $slug;
            }
        });
    }

    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/'.$this->logo) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function ledgers(): HasMany
    {
        return $this->hasMany(VendorLedger::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
