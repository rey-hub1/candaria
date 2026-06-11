<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuOptionGroup extends Model
{
    protected $fillable = [
        'menu_item_id', 'name', 'type', 'is_required', 'min_select', 'max_select', 'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(MenuOption::class, 'option_group_id')->orderBy('sort_order');
    }
}
