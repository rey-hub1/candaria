<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendorExists
{
    /**
     * Pastikan user role `vendor` punya record Vendor terkait. Tanpa ini,
     * controller vendor memanggil `$user->vendor->id` pada null → fatal error.
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->vendor, 403, 'Akun mitra belum terhubung ke data toko. Hubungi admin.');

        return $next($request);
    }
}
