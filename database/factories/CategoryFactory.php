<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->word() . $this->faker->randomNumber(3);
        $prefix = strtoupper(substr($name, 0, 2));

        return [
            'name'   => ucfirst($name),
            'slug'   => Str::slug($name),
            'code'   => substr($prefix, 0, 2),
            'prefix' => $prefix[0],
        ];
    }
}
