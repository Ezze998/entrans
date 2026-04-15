<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Akun Admin/Organizer
        \App\Models\User::create([
            'name' => 'Entrans Organizer',
            'email' => 'admin@entrans.com',
            'password' => bcrypt('password'),
            'role' => 'organizer',
        ]);

        // Akun Customer untuk ngetes login
        \App\Models\User::create([
            'name' => 'Budi Pembeli',
            'email' => 'budi@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
    }
}
