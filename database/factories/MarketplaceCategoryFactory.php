<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
class MarketplaceCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'type' => 'menu',
            'is_active' => true,
        ];
    }
}
