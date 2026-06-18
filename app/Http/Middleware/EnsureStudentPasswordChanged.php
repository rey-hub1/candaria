<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentPasswordChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $student = $request->user()?->student;

        if ($student && $student->must_change_password && \App\Models\FeatureFlag::enabled('force_password_change') && ! $request->routeIs('student.password.*')) {
            return redirect()->route('student.password.change');
        }

        return $next($request);
    }
}
