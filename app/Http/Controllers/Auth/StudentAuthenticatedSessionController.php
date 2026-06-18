<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\StudentLoginRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentAuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        // Akun pengujian cepat — hanya siswa demo (NISN berawalan 00112233)
        // yang password default-nya (tanggal lahir) masih berlaku.
        $testAccounts = Student::where('nisn', 'like', '00112233%')
            ->where('must_change_password', false)
            ->orderBy('nisn')
            ->get()
            ->map(fn (Student $s) => [
                'nisn' => $s->nisn,
                'name' => $s->name,
                'password' => Student::generateDefaultPassword($s->birth_date),
            ]);

        return Inertia::render('Auth/StudentLogin', [
            'status' => session('status'),
            'testAccounts' => $testAccounts,
        ]);
    }

    public function store(StudentLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $student = Auth::user()->student;

        if ($student && $student->must_change_password && \App\Models\FeatureFlag::enabled('force_password_change')) {
            return redirect()->route('student.password.change');
        }

        return redirect()->route('student.dashboard');
    }
}
