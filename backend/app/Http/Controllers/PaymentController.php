<?php

namespace App\Http\Controllers;

use App\Models\MidtransLog;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function notification(Request $request)
    {
        $serverKey = config('midtrans.server_key');
        $payload   = $request->all();


        // 1. Verify signature key
        $signatureKey = hash('sha512',
            $payload['order_id'] .
            $payload['status_code'] .
            $payload['gross_amount'] .
            $serverKey
        );

        if ($signatureKey !== $payload['signature_key']) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // 2. Find order by order_number
        $order = Order::where('order_number', $payload['order_id'])->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $payload['transaction_status'];
        $fraudStatus       = $payload['fraud_status'] ?? null;

        // 3. Determine final status
        if ($transactionStatus === 'capture') {
            $newStatus = ($fraudStatus === 'accept') ? 'settlement' : 'cancel';
        } elseif ($transactionStatus === 'settlement') {
            $newStatus = 'settlement';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $newStatus = $transactionStatus === 'expire' ? 'expire' : 'cancel';
        } else {
            $newStatus = 'pending';
        }

        // 4. Update order status
        $order->update(['status' => $newStatus]);

        // 5. Create or update payment record
        if (in_array($newStatus, ['settlement'])) {
            Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'transaction_id' => $payload['transaction_id'],
                    'payment_type'   => $payload['payment_type'],
                    'status'         => $newStatus,
                    'paid_at'        => now(),
                ]
            );
        }

        // 6. Restore ticket stock if cancelled or expired
        if (in_array($newStatus, ['cancel', 'expire'])) {
            $order->load('order_details.ticket');
            foreach ($order->order_details as $detail) {
                if ($detail->ticket) {
                    $detail->ticket->increment('stock', $detail->quantity);
                }
            }
        }

        // 7. Log raw Midtrans response
        MidtransLog::create([
            'order_id'        => $payload['order_id'],
            'full_response'   => json_encode($payload),
            'callback_status' => $transactionStatus,
        ]);

        return response()->json(['message' => 'Notification handled']);
    }
}