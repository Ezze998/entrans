<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Ticket;
use App\Services\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Mengambil SEMUA order milik user yang sedang login dalam bentuk Array
        $orders = Order::with(['event'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $orders // Ini akan mengirimkan [ {...}, {...} ]
        ]);
    }

    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'items' => 'required|array',
            'items.*.ticket_id' => 'required|exists:tickets,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Generate nomor invoice
            $orderNumber = 'ENTR-' . time();

            // 2. Buat data Order baru (Status default 'pending' dari migration)
            $order = Order::create([
                'user_id'      => Auth::id(),
                'event_id'     => $request->event_id,
                'order_number' => $orderNumber,
                'total_amount' => 0,
            ]);

            $total = 0;

            // 3. Looping untuk membuat OrderDetail
            foreach ($request->items as $item) {
                $ticket = Ticket::find($item['ticket_id']);

                if ($ticket->stock < $item['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stok tiket {$ticket->ticket_type} tidak cukup. Sisa stok: {$ticket->stock}"
                    ], 400);
                }

                $subtotal = $ticket->price * $item['quantity'];

                OrderDetail::create([
                    'order_id'  => $order->id,
                    'ticket_id' => $ticket->id,
                    'quantity'  => $item['quantity'],
                    'price'     => $ticket->price,
                    'subtotal'  => $subtotal,
                ]);

                $ticket->decrement('stock', $item['quantity']);

                $total += $subtotal;
            }

            // 4. Update total_amount pada Order tadi
            $order->update([
                'total_amount' => $total
            ]);

            // Buat objek MidtransService yang kita gunakan untuk mendapatkan snap_token
            $midtrans = new MidtransService;
            $snap = $midtrans->createSnapToken($order);

            // Update informasi pembayaran pada order
            $order->update([
                'snap_token' => $snap['snap_token'],
                'payment_url' => $snap['payment_url'],

            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data'    => $order->load('event')
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = Order::with(['event', 'order_details.ticket'])
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $order
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }

    public function processOrder($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        // Update status menjadi settlement
        $order->update([
            'status' => 'settlement'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status order berhasil diubah menjadi settlement',
            'data'    => $order
        ]);
    }

    public function cancelOrder($id)
    {
        // Panggil order beserta detailnya agar kita bisa mengembalikan stok
        $order = Order::with('order_details.ticket')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        if ($order->status === 'settlement') {
            return response()->json([
                'success' => false,
                'message' => 'Order yang sudah lunas tidak dapat dibatalkan!'
            ], 400);
        }

        foreach ($order->order_details as $detail) {
            if ($detail->ticket) {
                $detail->ticket->increment('stock', $detail->quantity);
            }
        }

        $order->update([
            'status' => 'cancel'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dibatalkan dan stok tiket telah dikembalikan',
            'data'    => $order
        ]);
    }

    public function callback(Request $request)
    {
        $serverKey = config('midtrans.server_key');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        // Validasi apakah data benar-benar dari Midtrans
        if ($hashed == $request->signature_key) {
            if ($request->transaction_status == 'capture' || $request->transaction_status == 'settlement') {
                $order = Order::where('order_number', $request->order_id)->first();
                if ($order) {
                    $order->update(['status' => 'settlement']);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
    public function getUserOrders()
    {
        $orders = Order::with(['event'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $orders
        ]);
    }
}
