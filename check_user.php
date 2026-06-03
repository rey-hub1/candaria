<?php
$user = \App\Models\User::where('phone', '081234567890')->first();
echo $user ? "EXISTS. ID: " . $user->id : "NOT EXISTS";
echo "\n";
