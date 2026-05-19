<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Cek apakah kolom sudah ada, jika BELUM ada baru jalankan perintah tambah
        if (!Schema::hasColumn('orders', 'admin_fee')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->integer('admin_fee')->default(0)->after('order_number');
            });
        }
    }

    public function down()
    {
        // Cek apakah kolom sudah ada, jika ADA baru hapus
        if (Schema::hasColumn('orders', 'admin_fee')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('admin_fee');
            });
        }
    }
};