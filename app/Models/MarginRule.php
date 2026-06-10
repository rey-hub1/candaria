<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarginRule extends Model
{
    use \App\Traits\Filterable, \App\Traits\LogsActivity, HasFactory;

    protected $fillable = [
        'min_price',
        'max_price',
        'margin',
    ];

    protected static function boot(): void
    {
        parent::boot();
        $bust = fn () => cache()->forget('margin_rules_all');
        static::saved($bust);
        static::deleted($bust);
    }
}
