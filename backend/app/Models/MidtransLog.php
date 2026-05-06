<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MidtransLog extends Model
{
    protected $fillable = [
        'order_id',
        'payload', 
        'full_response',
        'callback_status',
    ];

    protected $casts = [
        'payload' => 'array',
        'full_response' => 'array', 
    ];
}
