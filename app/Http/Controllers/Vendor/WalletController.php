<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $vendor = $request->user()->vendor;

        $ledgers = $vendor->ledgers()
            ->with('order:id,order_code')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Vendor/Wallet/Index', [
            'balance' => $vendor->balance,
            'ledgers' => $ledgers,
        ]);
    }
}
