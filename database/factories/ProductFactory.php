<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Seller;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $cost = $this->faker->numberBetween(1000, 10000);

        return [
            'category_id'   => Category::factory(),
            'seller_id'     => null,
            'type'          => 'kantin',
            'name'          => $this->faker->word() . ' ' . $this->faker->word(),
            'cost_price'    => $cost,
            'selling_price' => $cost + 500,
            'stock'         => $this->faker->numberBetween(5, 50),
        ];
    }

    public function kantin(): static
    {
        return $this->state(function (array $attr) {
            return [
                'type'          => 'kantin',
                'seller_id'     => null,
                'selling_price' => $attr['cost_price'] + 1000,
            ];
        });
    }

    public function siswa(): static
    {
        return $this->state([
            'type'      => 'siswa',
            'seller_id' => Seller::factory(),
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }
}
