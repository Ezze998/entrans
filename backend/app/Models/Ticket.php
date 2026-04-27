<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    // Tambahkan baris ini untuk mengizinkan semua kolom diisi
    protected $guarded = []; 

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
