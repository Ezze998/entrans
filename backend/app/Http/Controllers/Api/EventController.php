<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::with(['category', 'tickets'])->latest()->get();
        
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'description' => 'required',
            'location'    => 'required',
            'event_date'  => 'required|date',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Maksimal 2MB
        ]);

            // 2. Handle Upload Image
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('events', 'public');
            }

            // 3. Simpan Event
            $event = Event::create([
                'user_id'     => 1, 
                'category_id' => $request->category_id,
                'title'       => $request->title,
                'description' => $request->description,
                'location'    => $request->location,
                'event_date'  => $request->event_date,
                'image'       => $imagePath, 
                'status'      => 'draft',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event created as draft. Please add tickets and pay to publish.',
                'data'    => $event
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $event = Event::with(['category', 'tickets'])->find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        if ($event->image) {
            $event->image = url('storage/' . $event->image);
        }

        return response()->json(['success' => true, 'data' => $event]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes',
            'location'    => 'sometimes',
            'event_date'  => 'sometimes|date',
            'status'      => 'sometimes|in:draft,published,cancelled',
            'image'       => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048', // Maksimal 2MB
        ]);

         // Handle Upload Image
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
    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['success' => true, 'message' => 'Event deleted successfully']);
    }
}
