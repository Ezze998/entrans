<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==================== ROUTE PUBLIK (BUYER) ====================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::apiResource('events', EventController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('tickets', TicketController::class)->only(['index', 'show']);

// Webhook Midtrans
Route::post('/payment/notification', [PaymentController::class, 'notification']);

// ==================== ROUTE PROTECTED (ORGANIZER & CUSTOMER LOGGED IN) ====================
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', function (Request $request) {
        return response()->json(['success' => true, 'data' => $request->user()]);
    });

    // ✨ TAMBAHAN: Endpoint Khusus Dashboard Organizer (Wajib di atas apiResource)
    Route::get('organizer/events', [EventController::class, 'organizerEvents']);
    Route::get('organizer/tickets', [TicketController::class, 'organizerTickets']);

    Route::apiResource('events', EventController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('tickets', TicketController::class)->except(['index', 'show']);

    // Orders 
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::get('orders', [OrderController::class, 'getUserOrders']);
    Route::post('orders/{id}/process', [OrderController::class, 'processOrder']);
    Route::post('orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    Route::post('/midtrans-callback', [OrderController::class, 'callback']);
});