<?php

namespace App\Models;

use App\Traits\Filterable;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use Filterable, HasFactory, LogsActivity;

    protected $fillable = ['user_id', 'nisn', 'name', 'class', 'birth_date', 'must_change_password'];

    protected $casts = [
        'birth_date' => 'date',
        'must_change_password' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateDefaultPassword(\DateTimeInterface $birthDate): string
    {
        return $birthDate->format('dmY');
    }
}
