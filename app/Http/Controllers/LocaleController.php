<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    /**
     * Switch the UI language. Stored in the session so it survives navigation
     * for both guests (login/welcome) and authenticated users. The frontend
     * dictionaries live in resources/js/i18n.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', Rule::in(SetLocale::SUPPORTED)],
        ]);

        $request->session()->put('locale', $validated['locale']);

        return back();
    }
}
