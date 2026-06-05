<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MarginRuleFactory extends Factory
{
    public function definition(): array
    {
        $min = $this->faker->numberBetween(0, 5000);

        return [
            'min_price' => $min,
            'max_price' => $min + $this->faker->numberBetween(1000, 10000),
            'margin'    => $this->faker->numberBetween(200, 2000),
        ];
    }

    public function openEnded(): static
    {
        return $this->state(['max_price' => null]);
    }
}
