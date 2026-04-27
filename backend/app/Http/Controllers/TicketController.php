<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
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
        $request->validate([
            'event_id'    => 'required|exists:events,id',
            'ticket_type' => 'required|string|max:255', // misal: VIP 1, Regular 2
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:1',
        ]);

        // $event = Event::where('id', $request->event_id)->where('user_id', auth()->id())->firstOrFail();

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
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
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
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket deleted successfully'
        ]);
    }
}
