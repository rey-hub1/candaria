<?php

namespace Database\Factories;

use App\Models\Seller;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SellerSettlementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'seller_id'       => Seller::factory(),
            'user_id'         => User::factory()->state(['role' => 'admin']),
            'total_amount'    => $this->faker->numberBetween(5000, 50000),
            'settlement_date' => now(),
            'notes'           => $this->faker->sentence(),
        ];
    }
}
