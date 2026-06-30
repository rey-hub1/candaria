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

        if ($this->overlaps($request->min_price, $request->max_price)) {
            return redirect()->back()->with('error', 'Rentang harga bertabrakan dengan aturan profit yang sudah ada.');
        }

        MarginRule::create($request->all());
        cache()->forget('margin_rules_all');

        return redirect()->back()->with('success', 'Aturan profit berhasil ditambahkan.');
    }

    public function update(Request $request, MarginRule $marginRule)
    {
        $request->validate([
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'nullable|numeric|gt:min_price',
            'margin' => 'required|numeric|min:0',
        ]);

        if ($this->overlaps($request->min_price, $request->max_price, $marginRule->id)) {
            return redirect()->back()->with('error', 'Rentang harga bertabrakan dengan aturan profit yang sudah ada.');
        }

        $marginRule->update($request->all());
        cache()->forget('margin_rules_all');

        return redirect()->back()->with('success', 'Aturan profit berhasil diperbarui.');
    }

    /**
     * Cek apakah rentang [min, max] (max null = tak terbatas) bertabrakan dengan
     * aturan lain. Dua rentang overlap bila masing-masing awal ≤ akhir lawan.
     */
    private function overlaps($min, $max, ?int $ignoreId = null): bool
    {
        $newMax = $max === null || $max === '' ? PHP_INT_MAX : (float) $max;
        $newMin = (float) $min;

        return MarginRule::when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->get(['id', 'min_price', 'max_price'])
            ->contains(function ($rule) use ($newMin, $newMax) {
                $existMax = $rule->max_price === null ? PHP_INT_MAX : (float) $rule->max_price;

                return $newMin <= $existMax && (float) $rule->min_price <= $newMax;
            });
    }

    public function destroy(MarginRule $marginRule)
    {
        $marginRule->delete();

        return redirect()->back()->with('success', 'Aturan profit berhasil dihapus.');
    }
}
