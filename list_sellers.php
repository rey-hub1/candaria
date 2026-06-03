<?php
$sellers = \App\Models\Seller::all();
foreach ($sellers as $seller) {
    echo "ID: {$seller->id}, Name: {$seller->name}, Phone: {$seller->phone}\n";
}
