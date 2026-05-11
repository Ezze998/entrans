<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Tambahkan validasi role
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'nullable|in:customer,organizer', // Hindari 'admin' didaftarkan sembarangan
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // 2. Masukkan role ke dalam proses create
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'customer', // Jika tidak diisi di Postman/Frontend, otomatis jadi customer
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success'      => true,
            'message'      => 'Register success',
            'data'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer'
        ], 201);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success'      => true,
            'message'      => 'Login success',
            'data'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer'
        ]);
    }

    public function logout(Request $request)
    {
        // Menghapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout success'
        ]);
    }
}