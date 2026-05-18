<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * UNTUK PUBLIK / BUYER: Menampilkan list tiket umum
     */
    public function index(Request $request)
    {
        // Dikembalikan ke umum agar buyer bisa melihat pilihan tiket saat checkout
        if ($request->has('event_id')) {
            $tickets = Ticket::where('event_id', $request->event_id)->get();
        } else {
            $tickets = Ticket::all();
        }

        return response()->json([
            'success' => true,
            'data'    => $tickets
        ]);
    }

    /**
     * ✨ UNTUK DASHBOARD ORGANIZER: Hanya menampilkan tiket dari event miliknya sendiri
     */
    public function organizerTickets()
    {
        $tickets = Ticket::whereHas('event', function ($query) {
            $query->where('user_id', Auth::id());
        })->with('event')->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $tickets
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_id'    => 'required|exists:events,id',
            'ticket_type' => 'required|string|max:255', 
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:1',
        ]);

        $event = Event::where('id', $request->event_id)
            ->where('user_id', Auth::id())
            ->firstOrFail(); 

        $ticket = Ticket::create([
            'event_id'    => $request->event_id,
            'ticket_type' => $request->ticket_type,
            'price'       => $request->price,
            'stock'       => $request->stock,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ticket added to event successfully',
            'data'    => $ticket
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $ticket
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $ticket = Ticket::whereHas('event', function ($query) {
            $query->where('user_id', Auth::id());
        })->find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found or unauthorized'], 404);
        }

        $request->validate([
            'ticket_type' => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
        ]);

        $ticket->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'data'    => $ticket
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ticket = Ticket::whereHas('event', function ($query) {
            $query->where('user_id', Auth::id());
        })->find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found or unauthorized'], 404);
        }

        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket deleted successfully'
        ]);
    }
}