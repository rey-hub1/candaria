<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuOption extends Model
{
    protected $fillable = [
        'option_group_id', 'name', 'price_delta', 'is_default', 'sort_order',
    ];

    protected $casts = [
        'price_delta' => 'decimal:2',
        'is_default' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(MenuOptionGroup::class, 'option_group_id');
    }
}
