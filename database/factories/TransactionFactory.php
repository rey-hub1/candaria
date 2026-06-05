<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    public function definition(): array
    {
        $total = $this->faker->numberBetween(5000, 100000);
        $paid  = $total + $this->faker->numberBetween(0, 5000);

        return [
            'transaction_code' => str_pad($this->faker->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'user_id'          => User::factory()->state(['role' => 'cashier']),
            'total_amount'     => $total,
            'paid_amount'      => $paid,
            'change_amount'    => $paid - $total,
        ];
    }
}
