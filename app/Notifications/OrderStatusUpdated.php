<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification
{
    private const STATUS_LABEL = [
        'confirmed' => 'dikonfirmasi mitra',
        'preparing' => 'sedang disiapkan',
        'ready' => 'siap diambil',
        'delivered' => 'selesai',
        'cancelled' => 'dibatalkan',
    ];

    public function __construct(public Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $statusText = self::STATUS_LABEL[$this->order->status] ?? $this->order->status;

        return [
            'title' => 'Status Pesanan Diperbarui',
            'message' => "Pesanan {$this->order->order_code} {$statusText}.",
            'order_id' => $this->order->id,
            'url' => route('student.orders.show', $this->order->id),
        ];
    }
}
