<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminOrganizerController extends Controller
{
    public function toggleStatus(Request $request, $id)
    {
        // 1. Validasi input request body
        $request->validate([
            'status' => 'required|in:active,suspended'
        ]);

        // 2. Cari data organizer berdasarkan ID
        $organizer = User::find($id); // Sesuaikan jika nama Model-nya berbeda

        if (!$organizer) {
            return response()->json([
                'success' => false,
                'message' => 'Organizer tidak ditemukan.'
            ], 404);
        }

        // 3. Update status di database
        $organizer->status = $request->status;
        $organizer->save();

        // 4. Kembalikan respon sukses ke frontend
        return response()->json([
            'success' => true,
            'message' => 'Status akun organizer berhasil diperbarui menjadi ' . $request->status,
            'data' => $organizer
        ], 200);
    }
}
