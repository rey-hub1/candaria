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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('seller_id')->nullable()->constrained()->onDelete('cascade'); // Nullable if type is 'kantin'
            $table->string('name');
            $table->string('code')->unique()->nullable(); // SKU/Barcode/Shortcode
            $table->enum('type', ['kantin', 'siswa'])->default('kantin');
            $table->decimal('cost_price', 12, 2)->default(0); // modal (kantin) / harga dari siswa (titipan)
            $table->decimal('selling_price', 12, 2)->default(0); // harga jual ke pembeli (for titipan, it will be cost_price + 500)
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
