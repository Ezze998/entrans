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

        // 1. Build item_details dari order_details (Data Tiket)
        $itemDetails = $order->order_details->map(function ($detail) {
            return [
                'id'       => 'ticket-' . $detail->ticket_id, 
                'price'    => (int) $detail->price,
                'quantity' => (int) $detail->quantity,
                'name'     => substr('Tiket: ' . $detail->ticket->ticket_type, 0, 50), 
            ];
        })->toArray();

        // 2. ✨ BARU: Sisipkan Admin Fee ke dalam keranjang belanjaan Midtrans
        // Pengecekan ini penting agar jika event gratis (admin fee = 0), tidak muncul di struk
        if ($order->admin_fee > 0) {
            $itemDetails[] = [
                'id'       => 'admin-fee',
                'price'    => (int) $order->admin_fee,
                'quantity' => 1, // Kuantitas selalu 1 untuk biaya admin
                'name'     => 'Biaya Admin & Layanan',
            ];
        }

        // 3. Susun parameter Midtrans
        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total_amount, // Sekarang total uang & barang sudah seimbang
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $order->user->name,
                'email'      => $order->user->email,
            ],
        ];

        // 4. Dapatkan Token
        $snapToken = Snap::getSnapToken($params);

        return [
            'snap_token'  => $snapToken,
            'payment_url' => config('midtrans.is_production')
                ? "https://app.midtrans.com/snap/v2/vtweb/{$snapToken}"
                : "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}",
        ];
    }
}