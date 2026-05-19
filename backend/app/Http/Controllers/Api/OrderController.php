<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Ticket;
use App\Models\Event;
use App\Models\User;
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
        $orders = Order::with(['event'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $orders
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
            $orderNumber = 'ENTR-' . time();

            // Membuat draf order awal
            $order = Order::create([
                'user_id'      => Auth::id(),
                'event_id'     => $request->event_id,
                'order_number' => $orderNumber,
                'admin_fee'    => 0, // Inisialisasi awal
                'total_amount' => 0, // Inisialisasi awal
            ]);

            $ticketTotal = 0;

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

                $ticketTotal += $subtotal;
            }

            // 🛠️ PENGATURAN BIAYA ADMIN (ADMIN FEE)
            // Biaya flat Rp 5.000 hanya jika total harga tiket di atas 0 (bukan event gratis)
            $adminFee = $ticketTotal > 0 ? 5000 : 0; 
            
            // Gross amount = akumulasi harga tiket + biaya admin platform
            $grossAmount = $ticketTotal + $adminFee;

            // Update data finansial final pada order
            $order->update([
                'admin_fee'    => $adminFee,
                'total_amount' => $grossAmount
            ]);

            // Kirim data order yang sudah final ke layanan Midtrans Snap
            $midtrans = new MidtransService;
            $snap = $midtrans->createSnapToken($order);

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

    public function edit(Order $order)
    {
        //
    }

    public function update(Request $request, Order $order)
    {
        //
    }

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

    /**
     * UNTUK ORGANIZER: Ringkasan penjualan toko/organizer itu sendiri
     */
    public function summary()
    {
        $organizerId = Auth::id();

        // 🛠️ PENYESUAIAN: total_revenue milik organizer adalah total_amount dikurangi admin_fee platform
        $summary = Order::whereHas('event', function ($query) use ($organizerId) {
            $query->where('user_id', $organizerId);
        })
            ->select(
                DB::raw("COUNT(CASE WHEN status = 'settlement' THEN 1 END) as total_orders"),
                DB::raw("SUM(CASE WHEN status = 'settlement' THEN (total_amount - admin_fee) ELSE 0 END) as total_revenue"),
                DB::raw("COUNT(CASE WHEN status = 'cancel' THEN 1 END) as total_cancelled")
            )
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total_orders'    => (int) $summary->total_orders,
                'total_revenue'   => (int) $summary->total_revenue,
                'total_cancelled' => (int) $summary->total_cancelled,
            ]
        ]);
    }

    public function organizerOrders()
    {
        $organizerId = Auth::id();

        $orders = Order::with(['event', 'order_details.ticket'])
            ->whereHas('event', function ($query) use ($organizerId) {
                $query->where('user_id', $organizerId);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $orders
        ]);
    }

    /**
     * UNTUK ADMIN PLATFORM GLOBAL SUMMARY:
     */
    public function adminSummary()
    {
        $totalOrders = Order::where('status', 'settlement')->count();
        $totalGrossRevenue = Order::where('status', 'settlement')->sum('total_amount');
        
        // 🛠️ FITUR BARU: Menghitung total laba bersih murni dari kucuran Biaya Admin untuk kantong platform Admin
        $totalAdminEarnings = Order::where('status', 'settlement')->sum('admin_fee'); 
        
        $totalEvents = Event::where('status', 'published')->count();
        $totalOrganizers = User::where('role', 'organizer')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_global_orders'    => (int) $totalOrders,
                'total_global_revenue'   => (int) $totalGrossRevenue, // Total perputaran uang di web
                'total_admin_earnings'   => (int) $totalAdminEarnings, // 💎 Keuntungan murni milik Anda!
                'total_published_events' => (int) $totalEvents,
                'total_organizers'       => (int) $totalOrganizers,
            ]
        ]);
    }
}