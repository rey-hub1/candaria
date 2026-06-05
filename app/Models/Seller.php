<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Seller extends Model
{
    use HasFactory, \App\Traits\Filterable;

    protected $fillable = ['name', 'class', 'phone', 'is_active'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(SellerSettlement::class);
    }

    public function transactionItems(): HasManyThrough
    {
        return $this->hasManyThrough(TransactionItem::class, Product::class);
    }
}
