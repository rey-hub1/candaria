<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consignment extends Model
{
    use \App\Traits\Filterable;

    protected $fillable = [
        'seller_id',
        'product_id',
        'type',
        'quantity',
        'date',
        'notes',
    ];

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
