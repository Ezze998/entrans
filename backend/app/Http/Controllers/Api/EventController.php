<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Public catalog: only published events are visible to visitors.
     */
    public function index()
    {
        $events = Event::with(['category', 'tickets', 'user'])
            ->where('status', 'published')
            ->latest()
            ->get();

        $events->each(function ($event) {
            if ($event->image && !Str::startsWith($event->image, ['http://', 'https://'])) {
                $event->image = url('storage/' . $event->image);
            }
        });

        return response()->json(['success' => true, 'data' => $events]);
    }

    public function organizerEvents()
    {
        $events = Event::with(['category', 'tickets', 'user'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        $events->each(function ($event) {
            if ($event->image && !Str::startsWith($event->image, ['http://', 'https://'])) {
                $event->image = url('storage/' . $event->image);
            }
        });

        return response()->json(['success' => true, 'data' => $events]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'event_date'  => 'required|date',
            'status'      => 'sometimes|in:draft,published',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $validated['user_id'] = Auth::id();
        $validated['status'] = $validated['status'] ?? 'draft';

        $event = Event::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully.',
            'data' => $event,
        ], 201);
    }

    public function show($id)
    {
        $event = Event::with(['category', 'tickets', 'user'])->find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        if ($event->image && !Str::startsWith($event->image, ['http://', 'https://'])) {
            $event->image = url('storage/' . $event->image);
        }

        return response()->json(['success' => true, 'data' => $event]);
    }

    public function update(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized Action'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location'    => 'sometimes|string|max:255',
            'event_date'  => 'sometimes|date',
            'status'      => 'sometimes|in:draft,published,cancelled',
            'image'       => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($event->image && !Str::startsWith($event->image, ['http://', 'https://'])) {
                Storage::disk('public')->delete($event->image);
            }
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return response()->json(['success' => true, 'data' => $event->fresh()]);
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized Action'], 403);
        }

        $hasTransactions = DB::table('orders')
            ->where('event_id', $event->id)
            ->exists();

        if ($hasTransactions && !$request->boolean('force')) {
            return response()->json([
                'success' => false,
                'has_transactions' => true,
                'message' => 'Event ini tidak bisa dihapus secara normal karena tiketnya telah dibeli oleh pengunjung.'
            ], 400);
        }

        DB::transaction(function () use ($event) {
            $orderIds = DB::table('orders')->where('event_id', $event->id)->pluck('id');

            DB::table('payments')->whereIn('order_id', $orderIds)->delete();
            DB::table('orders')->whereIn('id', $orderIds)->delete();
            DB::table('tickets')->where('event_id', $event->id)->delete();

            if ($event->image && !Str::startsWith($event->image, ['http://', 'https://'])) {
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
