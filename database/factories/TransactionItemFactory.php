<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionItemFactory extends Factory
{
    public function definition(): array
    {
        $cost    = $this->faker->numberBetween(1000, 5000);
        $selling = $cost + 500;
        $qty     = $this->faker->numberBetween(1, 5);

        return [
            'transaction_id'       => Transaction::factory(),
            'product_id'           => Product::factory(),
            'quantity'             => $qty,
            'cost_price'           => $cost,
            'selling_price'        => $selling,
            'profit_kantin'        => ($selling - $cost) * $qty,
            'profit_seller'        => 0,
            'seller_settlement_id' => null,
        ];
    }

    public function siswa(int $cost = 3000, int $qty = 1): static
    {
        $margin = 500;

        return $this->state([
            'cost_price'    => $cost,
            'selling_price' => $cost + $margin,
            'profit_kantin' => $margin * $qty,
            'profit_seller' => $cost * $qty,
            'quantity'      => $qty,
        ]);
    }
}
