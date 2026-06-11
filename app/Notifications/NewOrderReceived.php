<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification
{
    public function __construct(public Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pesanan Baru',
            'message' => "Pesanan {$this->order->order_code} masuk untuk slot {$this->order->delivery_slot}.",
            'order_id' => $this->order->id,
            'url' => route('vendor.orders.index'),
        ];
    }
}
