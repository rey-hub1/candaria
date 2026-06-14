<?php

namespace App\Http\Middleware;

use App\Models\FeatureFlag;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$keys): Response
    {
        foreach ($keys as $key) {
            if (! FeatureFlag::enabled($key)) {
                abort(404);
            }
        }

        return $next($request);
    }
}
