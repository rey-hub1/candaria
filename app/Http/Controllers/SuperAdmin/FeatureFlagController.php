<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\FeatureFlag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeatureFlagController extends Controller
{
    public function index()
    {
        $flags = FeatureFlag::orderBy('group')->orderBy('label')->get()->groupBy('group');

        return Inertia::render('SuperAdmin/FeatureFlags', [
            'flags' => $flags,
        ]);
    }

    public function update(Request $request, FeatureFlag $featureFlag)
    {
        $request->validate(['is_enabled' => 'required|boolean']);

        $featureFlag->update(['is_enabled' => $request->boolean('is_enabled')]);

        return back()->with('success', "Fitur \"{$featureFlag->label}\" berhasil diperbarui.");
    }

    /**
     * Apply a preset template across all feature flags.
     * v1 = hanya grup `general` (umum) nyala, sisanya mati. v2 = semua nyala.
     */
    public function applyTemplate(Request $request)
    {
        $validated = $request->validate([
            'template' => 'required|in:v1,v2',
        ]);

        $allOn = $validated['template'] === 'v2';

        FeatureFlag::query()->each(function (FeatureFlag $flag) use ($allOn) {
            // Use save() (not mass update) so booted() cache invalidation fires per key.
            $flag->is_enabled = $allOn || $flag->group === 'general';
            $flag->save();
        });

        $label = $allOn ? 'Template V2 (semua nyala)' : 'Template V1 (hanya umum nyala)';

        return back()->with("success", "{$label} berhasil diterapkan.");
    }
}
