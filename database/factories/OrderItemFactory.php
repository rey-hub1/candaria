<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Order;
use App\Models\MenuItem;
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'menu_item_id' => MenuItem::factory(),
            'qty' => 1,
            'price_snapshot' => 10000,
            'name_snapshot' => 'Nasi',
            'subtotal' => 10000,
        ];
    }
}
