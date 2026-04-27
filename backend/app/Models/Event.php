<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $guarded = [];

        protected $fillable = [
            'user_id',
            'category_id',
            'title',
            'description',
            'location',
            'event_date',
            'image',
            'status',
        ];

        
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function organizer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
    public function orders() {
        return $this->hasMany(Order::class);
    }
}
