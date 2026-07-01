<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Supported UI locales. Keep in sync with resources/js/i18n.
     */
    public const SUPPORTED = ['id', 'en'];

    public const DEFAULT = 'id';

    /**
     * Apply the user's chosen locale (session-persisted) before the request
     * is handled, so validation messages and any server-side strings match
     * the UI. Must run before HandleInertiaRequests so the shared `locale`
     * prop reflects the active value.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale', self::DEFAULT);

        if (! in_array($locale, self::SUPPORTED, true)) {
            $locale = self::DEFAULT;
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
