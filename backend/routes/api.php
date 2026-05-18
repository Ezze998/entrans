<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public Routes (Tidak perlu login)
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout']);
Route::apiResource('events', EventController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('tickets', TicketController::class);

// Webhook
Route::post('/payment/notification', [PaymentController::class, 'notification']);

// Protected Routes (Wajib menyertakan Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('logout', [AuthController::class, 'logout']);

    // Endpoint untuk mendapatkan data user yang sedang login
    Route::get('user', function (Request $request) {
        return response()->json(['success' => true, 'data' => $request->user()]);
    });

    // Orders (Hanya user login yang bisa buat dan lihat order)
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::get('orders', [OrderController::class, 'getUserOrders']);
    Route::post('orders/{id}/process', [OrderController::class, 'processOrder']);
    Route::post('orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    Route::post('/midtrans-callback', [OrderController::class, 'callback']);
});
