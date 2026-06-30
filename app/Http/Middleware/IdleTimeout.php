<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IdleTimeout
{
    /**
     * Idle timeout per role, dalam menit.
     *
     * Cookie session global panjang (lihat SESSION_LIFETIME) supaya PWA student/
     * penitip/vendor tetap login lama. Role staff yang pegang uang dipaksa
     * timeout lebih pendek lewat pengecekan last-activity di sini.
     *
     * Role yang tidak terdaftar = ikut SESSION_LIFETIME global (tanpa batasan ekstra).
     */
    private const IDLE_MINUTES = [
        'super_admin' => 720, // 12 jam
        'admin' => 480,       // 8 jam (1 hari kerja)
        'cashier' => 480,     // 8 jam (1 shift)
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && isset(self::IDLE_MINUTES[$user->role])) {
            $maxIdle = self::IDLE_MINUTES[$user->role] * 60; // detik
            $now = $request->server('REQUEST_TIME', time());
            $last = $request->session()->get('last_activity_at');

            if ($last !== null && ($now - $last) > $maxIdle) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'login' => 'Sesi berakhir karena tidak aktif. Silakan login kembali.',
                ]);
            }

            $request->session()->put('last_activity_at', $now);
        }

        return $next($request);
    }
}
