<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use \App\Traits\Filterable, \App\Traits\LogsActivity, HasFactory;

    protected $fillable = ['name', 'slug', 'code', 'prefix'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
