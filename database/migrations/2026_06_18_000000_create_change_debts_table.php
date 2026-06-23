<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hutang kembalian ke customer: kembalian yang belum/tak bisa diberikan saat
 * checkout (kasir kehabisan uang receh), diambil customer di kemudian hari.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('change_debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_note')->nullable();   // nama/kelas/keterangan
            $table->decimal('amount', 12, 2);              // nominal kembalian yang dititipkan
            $table->string('status')->default('unpaid');   // unpaid | paid
            $table->date('date');                          // tanggal bisnis (untuk laporan)
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('change_debts');
    }
};
