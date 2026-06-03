<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;

class MarginRule extends Model
{
    use \App\Traits\Filterable;

    protected $fillable = [
        'min_price',
        'max_price',
        'margin'
    ];
}
