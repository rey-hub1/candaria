<?php

namespace App\Http\Controllers;

use App\Models\MarginRule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarginRuleController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'dir']);
        $rules = MarginRule::filter($filters, ['margin', 'min_price'])->orderBy('min_price', 'asc')->paginate(15)->withQueryString();
        return Inertia::render('MarginRules/Index', ['rules' => $rules, 'filters' => $filters]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'nullable|numeric|gt:min_price',
            'margin' => 'required|numeric|min:0',
        ]);

        MarginRule::create($request->all());

        return redirect()->back()->with('success', 'Aturan profit berhasil ditambahkan.');
    }

    public function update(Request $request, MarginRule $marginRule)
    {
        $request->validate([
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'nullable|numeric|gt:min_price',
            'margin' => 'required|numeric|min:0',
        ]);

        $marginRule->update($request->all());

        return redirect()->back()->with('success', 'Aturan profit berhasil diperbarui.');
    }

    public function destroy(MarginRule $marginRule)
    {
        $marginRule->delete();
        return redirect()->back()->with('success', 'Aturan profit berhasil dihapus.');
    }
}
