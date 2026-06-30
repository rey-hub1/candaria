<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

class OrderCancelledByStudent extends Notification
{
    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pesanan Dibatalkan',
            'message' => "Pesanan {$this->order->order_code} dibatalkan oleh siswa.",
            'order_id' => $this->order->id,
            'url' => route('vendor.orders.index'),
        ];
    }
}
