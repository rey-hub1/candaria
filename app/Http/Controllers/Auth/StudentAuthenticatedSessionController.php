<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\StudentLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentAuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/StudentLogin', [
            'status' => session('status'),
        ]);
    }

    public function store(StudentLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $student = Auth::user()->student;

        if ($student && $student->must_change_password) {
            return redirect()->route('student.password.change');
        }

        return redirect()->route('student.dashboard');
    }
}
