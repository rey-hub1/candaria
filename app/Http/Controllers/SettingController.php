<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'settings' => [
                'admin_whatsapp' => Setting::get('admin_whatsapp', ''),
                'keyboard_default_mode' => Setting::get('keyboard_default_mode', 'prefix'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'admin_whatsapp' => 'required|string|max:20',
            'keyboard_default_mode' => 'required|in:full,prefix',
        ]);

        // Normalisasi: hilangkan non-digit, ubah 0 depan jadi 62
        $number = preg_replace('/\D/', '', $validated['admin_whatsapp']);
        if (str_starts_with($number, '0')) {
            $number = '62' . substr($number, 1);
        }

        Setting::set('admin_whatsapp', $number);
        Setting::set('keyboard_default_mode', $validated['keyboard_default_mode']);

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
