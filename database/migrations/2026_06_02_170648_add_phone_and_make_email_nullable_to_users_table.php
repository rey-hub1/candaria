<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->unique()->after('email');
            $table->string('email')->nullable()->change();
        });

        // Seed existing sellers to users table
        $sellers = DB::table('sellers')->whereNotNull('phone')->get();
        foreach ($sellers as $seller) {
            // Check if phone already exists
            $exists = DB::table('users')->where('phone', $seller->phone)->exists();
            if (! $exists) {
                DB::table('users')->insert([
                    'name' => $seller->name,
                    'phone' => $seller->phone,
                    'password' => Hash::make('candaria123'),
                    'role' => 'penitip',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
            $table->string('email')->nullable(false)->change();
        });
    }
};
