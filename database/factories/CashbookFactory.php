<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashbookFactory extends Factory
{
    public function definition(): array
    {
        return [
            'date'         => $this->faker->dateTimeThisMonth()->format('Y-m-d'),
            'description'  => $this->faker->sentence(),
            'type'         => $this->faker->randomElement(['debit', 'credit']),
            'amount'       => $this->faker->numberBetween(1000, 100000),
            'source'       => 'manual',
            'reference_id' => null,
            'user_id'      => User::factory()->state(['role' => 'admin']),
        ];
    }

    public function debit(): static
    {
        return $this->state(['type' => 'debit']);
    }

    public function credit(): static
    {
        return $this->state(['type' => 'credit']);
    }

    public function fromTransaction(int $refId): static
    {
        return $this->state(['source' => 'transaction', 'reference_id' => $refId]);
    }

    public function fromSettlement(int $refId): static
    {
        return $this->state(['source' => 'settlement', 'reference_id' => $refId]);
    }
}
