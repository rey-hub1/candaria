<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
class VendorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company(),
            'slug' => fake()->slug(),
            'status' => 'active',
            'phone' => fake()->phoneNumber(),
            'is_open' => true,
        ];
    }
}
