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
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('cost_price', 12, 2); // snapshot of cost_price at sale time
            $table->decimal('selling_price', 12, 2); // snapshot of selling_price at sale time
            $table->decimal('profit_kantin', 12, 2); // calculated: for titipan: 500 * qty, for kantin: (selling_price - cost_price) * qty
            $table->decimal('profit_seller', 12, 2); // calculated: for titipan: cost_price * qty, for kantin: 0
            $table->foreignId('seller_settlement_id')->nullable()->constrained('seller_settlements')->onDelete('set null'); // if set, this item is settled (paid to seller)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
