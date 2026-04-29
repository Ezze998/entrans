# Midtrans Payment Implementation Plan

## Overview

This app uses **Midtrans Snap** — user gets a `snap_token` + `payment_url` after order creation,
then pays via Midtrans hosted page. Midtrans notifies the backend via webhook after payment.

Database schema already ready:
- `orders`: `snap_token`, `payment_url`, `status`
- `payments`: `transaction_id`, `payment_type`, `status`, `paid_at`
- `midtrans_logs`: `order_id`, `full_response`, `callback_status`

---

## Step 1 — Install Midtrans PHP SDK

```bash
composer require midtrans/midtrans-php
```

---

## Step 2 — Add credentials to `.env`

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_IS_PRODUCTION=false
```

Get keys from: https://dashboard.sandbox.midtrans.com → Settings → Access Keys

---

## Step 3 — Create `config/midtrans.php`

```php
<?php

return [
    'server_key'    => env('MIDTRANS_SERVER_KEY'),
    'client_key'    => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
];
```

---

## Step 4 — Create `app/Services/MidtransService.php`

This service handles communicating with Midtrans Snap API.

```php
<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function createSnapToken(Order $order): array
    {
        $order->load('order_details.ticket', 'user');

        // Build item_details from order_details
        $itemDetails = $order->order_details->map(function ($detail) {
            return [
                'id'       => $detail->ticket_id,
                'price'    => (int) $detail->price,
                'quantity' => $detail->quantity,
                'name'     => $detail->ticket->ticket_type,
            ];
        })->toArray();

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total_amount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $order->user->name,
                'email'      => $order->user->email,
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return [
            'snap_token'  => $snapToken,
            'payment_url' => config('midtrans.is_production')
                ? "https://app.midtrans.com/snap/v2/vtweb/{$snapToken}"
                : "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}",
        ];
    }
}
```

---

## Step 5 — Update `OrderController::store()`

After order + order_details are created inside the DB transaction, call `MidtransService`.

Changes needed in `store()`:

1. Inject or instantiate `MidtransService`
2. After `$order->update(['total_amount' => $total])`, call:

```php
$midtrans = new \App\Services\MidtransService();
$snap     = $midtrans->createSnapToken($order);

$order->update([
    'snap_token'  => $snap['snap_token'],
    'payment_url' => $snap['payment_url'],
]);
```

3. Update the response to include snap data:

```php
return response()->json([
    'success'     => true,
    'message'     => 'Order created successfully',
    'data'        => $order->load('event'),
    'snap_token'  => $snap['snap_token'],
    'payment_url' => $snap['payment_url'],
], 201);
```

> Also replace `user_id => 1` with `auth()->id()` once auth is implemented.

---

## Step 6 — Create `app/Http/Controllers/PaymentController.php`

This controller handles the Midtrans webhook notification.

```php
<?php

namespace App\Http\Controllers;

use App\Models\MidtransLog;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function notification(Request $request)
    {
        $serverKey = config('midtrans.server_key');
        $payload   = $request->all();

        // 1. Verify signature key
        $signatureKey = hash('sha512',
            $payload['order_id'] .
            $payload['status_code'] .
            $payload['gross_amount'] .
            $serverKey
        );

        if ($signatureKey !== $payload['signature_key']) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // 2. Find order by order_number
        $order = Order::where('order_number', $payload['order_id'])->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $payload['transaction_status'];
        $fraudStatus       = $payload['fraud_status'] ?? null;

        // 3. Determine final status
        if ($transactionStatus === 'capture') {
            $newStatus = ($fraudStatus === 'accept') ? 'settlement' : 'cancel';
        } elseif ($transactionStatus === 'settlement') {
            $newStatus = 'settlement';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $newStatus = $transactionStatus === 'expire' ? 'expire' : 'cancel';
        } else {
            $newStatus = 'pending';
        }

        // 4. Update order status
        $order->update(['status' => $newStatus]);

        // 5. Create or update payment record
        if (in_array($newStatus, ['settlement'])) {
            Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'transaction_id' => $payload['transaction_id'],
                    'payment_type'   => $payload['payment_type'],
                    'status'         => $newStatus,
                    'paid_at'        => now(),
                ]
            );
        }

        // 6. Restore ticket stock if cancelled or expired
        if (in_array($newStatus, ['cancel', 'expire'])) {
            $order->load('order_details.ticket');
            foreach ($order->order_details as $detail) {
                if ($detail->ticket) {
                    $detail->ticket->increment('stock', $detail->quantity);
                }
            }
        }

        // 7. Log raw Midtrans response
        MidtransLog::create([
            'order_id'        => $payload['order_id'],
            'full_response'   => json_encode($payload),
            'callback_status' => $transactionStatus,
        ]);

        return response()->json(['message' => 'Notification handled']);
    }
}
```

---

## Step 7 — Create `app/Models/MidtransLog.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MidtransLog extends Model
{
    protected $fillable = ['order_id', 'full_response', 'callback_status'];
}
```

Also create `app/Models/Payment.php` if not yet exists:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'transaction_id', 'payment_type', 'status', 'paid_at'
    ];
}
```

---

## Step 8 — Register routes in `routes/api.php`

```php
use App\Http\Controllers\PaymentController;

// Webhook — must be public, no auth middleware
Route::post('payment/notification', [PaymentController::class, 'notification']);
```

---

## Step 9 — Exclude webhook from CSRF (if applicable)

**Laravel 11** — in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'api/payment/notification',
    ]);
})
```

**Laravel 10** — in `app/Http/Middleware/VerifyCsrfToken.php`:

```php
protected $except = [
    'api/payment/notification',
];
```

> API routes typically skip CSRF by default (they use `api` middleware group),
> so this step may not be needed. Verify by checking your `bootstrap/app.php` or `app/Http/Kernel.php`.

---

## Step 10 — Expose local server for webhook (dev only)

Midtrans needs a public URL to send notifications. Use ngrok:

```bash
ngrok http 8000
```

Copy the `https://xxxx.ngrok.io` URL. Then set in:

**Midtrans Dashboard** → Settings → Configuration → Payment Notification URL:
```
https://xxxx.ngrok.io/api/payment/notification
```

---

## Step 11 — Test with Midtrans Sandbox

1. Call `POST /api/orders` → get `payment_url` in response
2. Open `payment_url` in browser → complete payment using test card/credentials
3. Check `midtrans_logs` table — should have a new entry
4. Check `orders.status` — should be `settlement`
5. Check `payments` table — should have a record with `paid_at`

**Test credentials**: https://docs.midtrans.com/docs/testing-payment-on-sandbox

---

## Final Flow Diagram

```
POST /api/orders
  ├─ Validate request
  ├─ Create order (status: pending)
  ├─ Create order_details, decrement stock
  ├─ Call Midtrans Snap API
  ├─ Save snap_token + payment_url to orders
  └─ Return { order, snap_token, payment_url }

User opens payment_url → pays via Midtrans hosted page

Midtrans → POST /api/payment/notification
  ├─ Verify signature
  ├─ Find order by order_number
  ├─ Update orders.status
  ├─ Insert into payments (if settled)
  ├─ Restore stock (if cancelled/expired)
  └─ Insert into midtrans_logs
```

---

## Checklist

- [ ] `composer require midtrans/midtrans-php`
- [ ] Add `.env` keys
- [ ] Create `config/midtrans.php`
- [ ] Create `app/Services/MidtransService.php`
- [ ] Update `OrderController::store()` to call Snap API
- [ ] Create `app/Models/Payment.php`
- [ ] Create `app/Models/MidtransLog.php`
- [ ] Create `app/Http/Controllers/PaymentController.php`
- [ ] Register `POST /payment/notification` route
- [ ] Verify CSRF exclusion for notification route
- [ ] Test with ngrok + Midtrans sandbox