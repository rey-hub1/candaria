<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SellerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'      => $this->faker->name(),
            'class'     => 'X MIPA ' . $this->faker->numberBetween(1, 6),
            'phone'     => '08' . $this->faker->unique()->numerify('#########'),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function withoutPhone(): static
    {
        return $this->state(['phone' => null]);
    }
}
