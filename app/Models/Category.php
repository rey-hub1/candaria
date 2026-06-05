<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory, \App\Traits\Filterable;

    protected $fillable = ['name', 'slug', 'code', 'prefix'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
