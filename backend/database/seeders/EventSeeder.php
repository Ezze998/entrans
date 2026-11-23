<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cari relasi berdasarkan data, jangan mengasumsikan ID selalu 1.
        $organizer = User::where('role', 'organizer')->first();
        $category = Category::where('slug', 'music')->first();

        if (!$organizer || !$category) {
            $this->command?->warn('Event demo dilewati: akun organizer atau kategori Music belum tersedia.');
            return;
        }

        $event = Event::updateOrCreate(
            ['title' => 'Neon Nights Music Fest'],
            [
                'user_id' => $organizer->id,
                'category_id' => $category->id,
                'description' => 'Experience the best electronic music in town.',
                'location' => 'Jakarta International Stadium',
                'event_date' => now()->addDays(30),
                'status' => 'published',
                'image' => 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500',
            ]
        );

        $event->tickets()->updateOrCreate(
            ['ticket_type' => 'Reguler'],
            ['price' => 150000, 'stock' => 100]
        );

        $event->tickets()->updateOrCreate(
            ['ticket_type' => 'VIP'],
            ['price' => 500000, 'stock' => 20]
        );
    }
}
