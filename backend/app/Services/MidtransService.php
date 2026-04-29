<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function createSnapToken(Order $order): array
    {
        $order->load('order_details.ticket', 'user');

        // Build item_details from order_details
        $itemDetails = $order->order_details->map(function ($detail) {
            return [
                'id'       => $detail->ticket_id,
                'price'    => (int) $detail->price,
                'quantity' => $detail->quantity,
                'name'     => $detail->ticket->ticket_type,
            ];
        })->toArray();

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total_amount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $order->user->name,
                'email'      => $order->user->email,
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return [
            'snap_token'  => $snapToken,
            'payment_url' => config('midtrans.is_production')
                ? "https://app.midtrans.com/snap/v2/vtweb/{$snapToken}"
                : "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}",
        ];
    }
}