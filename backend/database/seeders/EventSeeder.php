<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $event = \App\Models\Event::create([
            'user_id' => 1, // ID Organizer tadi
            'category_id' => 1, // Music
            'title' => 'Neon Nights Music Fest',
            'description' => 'Experience the best electronic music in town.',
            'location' => 'Jakarta International Stadium',
            'event_date' => now()->addDays(30),
            'status' => 'published',
            'image' => 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'
        ]);

        // Buat tiket untuk event ini
        $event->tickets()->createMany([
            [
                'ticket_type' => 'Reguler',
                'price' => 150000,
                'stock' => 100
            ],
            [
                'ticket_type' => 'VIP',
                'price' => 500000,
                'stock' => 20
            ]
        ]);
    }
}
