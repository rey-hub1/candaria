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
}
