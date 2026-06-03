<?php
$user = \App\Models\User::where('phone', '081234567890')->first();
if ($user) {
    echo "User exists. ID: {$user->id}, Phone: {$user->phone}\n";
    $auth = \Illuminate\Support\Facades\Auth::attempt(['phone' => '081234567890', 'password' => 'candaria123']);
    echo "Auth attempt result: " . ($auth ? "SUCCESS" : "FAILED") . "\n";
} else {
    echo "User DOES NOT EXIST\n";
}
