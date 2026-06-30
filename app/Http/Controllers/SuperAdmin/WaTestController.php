<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WaTestController extends Controller
{
    private const DEFAULT_PHONE_KEY = 'wa_test_default_phone';
    private const DEFAULT_PHONE     = '085880593086';

    public function index(WhatsAppService $wa)
    {
        return Inertia::render('SuperAdmin/WaTest', [
            'config' => [
                'enabled'  => (bool) config('services.waha.enabled'),
                'base_url' => config('services.waha.base_url'),
                'session'  => config('services.waha.session'),
                'has_key'  => ! empty(config('services.waha.api_key')),
            ],
            'defaultPhone' => Setting::get(self::DEFAULT_PHONE_KEY, self::DEFAULT_PHONE),
            'status'       => session('wa_status'),
            'result'       => session('wa_result'),
        ]);
    }

    public function savePhone(Request $request)
    {
        $request->validate(['phone' => 'required|string|max:20']);
        Setting::set(self::DEFAULT_PHONE_KEY, $request->input('phone'));
        return back()->with('wa_status', ['ok' => true, 'type' => 'phone', 'message' => 'Nomor default disimpan.']);
    }

    public function testText(Request $request, WhatsAppService $wa)
    {
        $request->validate(['phone' => 'required|string|max:20']);
        $result = $wa->send($request->input('phone'), "✅ Ini pesan test teks dari Candaria.\n\nWaktu: " . now()->format('d/m/Y H:i:s'));
        return back()->with('wa_result', array_merge($result, ['type' => 'text']));
    }

    public function testImage(Request $request, WhatsAppService $wa)
    {
        $request->validate(['phone' => 'required|string|max:20']);
        $result = $wa->sendImage(
            $request->input('phone'),
            '📸 Test kirim foto dari Candaria — ' . now()->format('d/m/Y H:i:s'),
            'https://picsum.photos/800/600',
        );
        return back()->with('wa_result', array_merge($result, ['type' => 'image']));
    }

    public function testDocument(Request $request, WhatsAppService $wa)
    {
        $request->validate(['phone' => 'required|string|max:20']);
        $result = $wa->sendDocument(
            $request->input('phone'),
            '📄 Test kirim dokumen dari Candaria — ' . now()->format('d/m/Y H:i:s'),
            'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
            'test-candaria.pdf',
        );
        return back()->with('wa_result', array_merge($result, ['type' => 'document']));
    }

    public function pingStatus(WhatsAppService $wa)
    {
        return response()->json($wa->status());
    }
}
