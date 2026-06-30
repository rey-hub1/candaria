<?php

namespace App\Http\Middleware;

use App\Models\FeatureFlag;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Paksa penitip & vendor mengganti password saat pertama login — hanya saat
     * feature flag `force_password_change` menyala. Siswa ditangani oleh
     * EnsureStudentPasswordChanged.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user
            && in_array($user->role, ['penitip', 'vendor'], true)
            && $user->must_change_password
            && FeatureFlag::enabled('force_password_change')
            && ! $request->routeIs('password.force', 'logout')
        ) {
            return redirect()->route('password.force');
        }

        return $next($request);
    }
}
