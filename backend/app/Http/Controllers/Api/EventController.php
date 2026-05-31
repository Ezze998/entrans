<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * UNTUK PUBLIK / BUYER: Menampilkan semua list event
     */
    public function index()
    {
        // Dikembalikan seperti semula agar landing page buyer tidak kosong
        $events = Event::with(['category', 'tickets', 'user'])->latest()->get();

        $events->map(function ($event) {
            if ($event->image) {
                $event->image = url('storage/' . $event->image);
            }
            return $event;
        });

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function organizerEvents()
    {
        $events = Event::with(['category', 'tickets', 'user'])
            ->where('user_id', Auth::id()) // Dikunci berdasarkan ID yang login
            ->latest()
            ->get();

        $events->map(function ($event) {
            if ($event->image) {
                $event->image = url('storage/' . $event->image);
            }
            return $event;
        });

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'description' => 'required',
            'location'    => 'required',
            'event_date'  => 'required|date',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
        }

        $event = Event::create([
            'user_id'     => Auth::id(),
            'category_id' => $request->category_id,
            'title'       => $request->title,
            'description' => $request->description,
            'location'    => $request->location,
            'event_date'  => $request->event_date,
            'image'       => $imagePath,
            'status'      => $request->status ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully.',
            'data'    => $event
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $event = Event::with(['category', 'tickets', 'user'])->find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        if ($event->image) {
            $event->image = url('storage/' . $event->image);
        }

        return response()->json(['success' => true, 'data' => $event]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized Action'], 403);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes',
            'location'    => 'sometimes',
            'event_date'  => 'sometimes|date',
            'status'      => 'sometimes|in:draft,published,cancelled',
            'image'       => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            $event->image = $request->file('image')->store('events', 'public');
        }

        $event->update($request->all());
        return response()->json(['success' => true, 'data' => $event]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized Action'], 403);
        }

        $hasTransactions = DB::table('orders')
            ->whereIn('event_id', DB::table('tickets')->where('event_id', $event->id)->pluck('id'))
            ->exists();

        if ($hasTransactions && !$request->query('force')) {
            return response()->json([
                'success' => false,
                'has_transactions' => true,
                'message' => 'Event ini tidak bisa dihapus secara normal karena tiketnya telah dibeli oleh pengunjung.'
            ], 400);
        }

        DB::transaction(function () use ($event) {
            $orderIds = DB::table('orders')->whereIn('event_id', [$event->id])->pluck('id');

            DB::table('payments')->whereIn('order_id', $orderIds)->delete();
            DB::table('orders')->whereIn('event_id', [$event->id])->delete();
            DB::table('tickets')->where('event_id', $event->id)->delete();

            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }

            $event->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Event beserta seluruh data transaksi terkait berhasil dibersihkan dari sistem.'
        ]);
    }
}
