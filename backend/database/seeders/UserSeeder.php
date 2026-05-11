<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Membuat akun Admin Utama
        User::create([
            'name'     => 'Super Admin',
            'email'    => 'syarif@entrans.com', // Ganti dengan email kamu
            'password' => Hash::make('midtrans99'), // Ganti dengan password yang aman
            'role'     => 'admin',
        ]);

        // Opsional: Boleh sekalian buat akun organizer/customer untuk testing
        User::create([
            'name'     => 'EO Jakarta',
            'email'    => 'eo@entrans.com',
            'password' => Hash::make('password123'),
            'role'     => 'organizer',
        ]);
    }
}