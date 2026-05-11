<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $categories = [
        ['category_name' => 'Music', 'slug' => 'music'],
        ['category_name' => 'Workshop', 'slug' => 'workshop'],
    ];

    foreach ($categories as $category) {
        \App\Models\Category::updateOrCreate(
            ['slug' => $category['slug']], // Cek berdasarkan slug
            ['category_name' => $category['category_name']] // Update jika ada, create jika tidak ada
        );
    }
}
}
