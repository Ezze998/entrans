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
        ['category_name' => 'Seminar', 'slug' => 'seminar'],
        ['category_name' => 'Workshop', 'slug' => 'workshop'],
        ['category_name' => 'Sports', 'slug' => 'sports'],
    ];

    foreach ($categories as $cat) {
        \App\Models\Category::create($cat);
    }
}
}
