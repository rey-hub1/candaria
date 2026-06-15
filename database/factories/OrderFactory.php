<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Vendor;
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'student_id' => User::factory(),
            'order_code' => fake()->numerify('ORD-####'),
            'total' => 10000,
            'subtotal' => 10000,
            'status' => 'pending',
            'delivery_date' => now()->toDateString(),
            'delivery_slot' => '09:00',
            'payment_method' => 'cash',
        ];
    }
}
