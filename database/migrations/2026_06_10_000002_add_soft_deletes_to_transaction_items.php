<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Voiding a transaction soft-deletes its items so every existing
        // aggregate query (reports, dashboard, settlements) excludes them
        // automatically while the rows remain for audit.
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
