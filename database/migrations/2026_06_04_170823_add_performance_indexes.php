<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->index('created_at');
            $table->index(['product_id', 'created_at']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('created_at');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('stock');
        });

        Schema::table('cashbooks', function (Blueprint $table) {
            $table->index('date');
            $table->index(['source', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['product_id', 'created_at']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['stock']);
        });

        Schema::table('cashbooks', function (Blueprint $table) {
            $table->dropIndex(['date']);
            $table->dropIndex(['source', 'reference_id']);
        });
    }
};
