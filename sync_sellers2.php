<?php
\App\Models\User::where('role', 'penitip')->whereNull('phone')->delete();

use App\Models\Seller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$sellers = Seller::whereNotNull('phone')->where('phone', '!=', '')->get();
$count = 0;

foreach ($sellers as $seller) {
    $user = User::where('phone', $seller->phone)->first();
    if (!$user) {
        User::create([
            'name' => $seller->name,
            'phone' => $seller->phone,
            'password' => Hash::make('candaria123'),
            'role' => 'penitip',
        ]);
        $count++;
    }
}

echo "Created {$count} missing user accounts.\n";
