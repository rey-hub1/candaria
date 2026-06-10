<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default('completed')->after('change_amount');
            $table->date('transaction_date')->nullable()->after('status');
            $table->timestamp('voided_at')->nullable()->after('transaction_date');
            $table->string('void_reason')->nullable()->after('voided_at');
            $table->foreignId('voided_by')->nullable()->after('void_reason')->constrained('users')->nullOnDelete();
        });

        // Backfill transaction_date from created_at for existing rows
        DB::table('transactions')->whereNull('transaction_date')->update([
            'transaction_date' => DB::raw('DATE(created_at)'),
        ]);

        // transaction_code resets daily (00001, 00002...), so it is NOT globally
        // unique — it is unique per day. Drop the global unique and add a
        // composite unique on (transaction_date, transaction_code).
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique('transactions_transaction_code_unique');
            $table->unique(['transaction_date', 'transaction_code'], 'transactions_date_code_unique');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique('transactions_date_code_unique');
            $table->unique('transaction_code', 'transactions_transaction_code_unique');
            $table->dropConstrainedForeignId('voided_by');
            $table->dropColumn(['status', 'transaction_date', 'voided_at', 'void_reason']);
        });
    }
};
