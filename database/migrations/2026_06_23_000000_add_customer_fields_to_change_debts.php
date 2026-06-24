<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Identitas customer pada hutang kembalian dipecah jadi Nama + Kelas terstruktur
 * (sebelumnya cuma `customer_note` teks bebas). `customer_note` dibiarkan untuk
 * fallback baris lama.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('change_debts', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('transaction_id');
            $table->string('customer_class')->nullable()->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::table('change_debts', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_class']);
        });
    }
};
