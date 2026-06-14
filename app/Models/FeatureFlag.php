<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FeatureFlag extends Model
{
    use LogsActivity;

    protected $fillable = ['key', 'label', 'description', 'group', 'is_enabled'];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    public static function enabled(string $key, bool $default = true): bool
    {
        return Cache::rememberForever("feature_flag.$key", function () use ($key, $default) {
            $flag = static::where('key', $key)->first();

            return $flag ? (bool) $flag->is_enabled : $default;
        });
    }

    protected static function booted(): void
    {
        static::saved(fn (self $flag) => Cache::forget("feature_flag.{$flag->key}"));
        static::deleted(fn (self $flag) => Cache::forget("feature_flag.{$flag->key}"));
    }
}
