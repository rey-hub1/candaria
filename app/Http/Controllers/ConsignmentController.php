<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use App\Models\Product;
use App\Models\Seller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ConsignmentController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();

        $intakeToday = Consignment::where('type', 'in')
            ->whereDate('date', $today)
            ->groupBy('product_id')
            ->selectRaw('product_id as pid, SUM(quantity) as qty')
            ->pluck('qty', 'pid');

        $sellers = Seller::where('is_active', true)
            ->with(['products' => fn ($q) => $q->where('type', 'siswa')->orderBy('name')])
            ->orderBy('name')
            ->get()
            ->map(fn ($seller) => [
                'id' => $seller->id,
                'name' => $seller->name,
                'class' => $seller->class,
                'phone' => $seller->phone,
                'products' => $seller->products->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'code' => $p->code,
                    'cost_price' => (int) $p->cost_price,
                    'stock' => (int) $p->stock,
                    'intake_today' => (int) ($intakeToday[$p->id] ?? 0),
                ])->values(),
            ])
            ->filter(fn ($s) => count($s['products']) > 0)
            ->values();

        return Inertia::render('Consignments/Index', [
            'sellers' => $sellers,
            'today' => $today,
        ]);
    }

    public function intake(Request $request)
    {
        // Penyesuaian stok harian: delta bertanda.
        // delta > 0 = stok masuk (Consignment type=in), delta < 0 = stok keluar (type=out).
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.delta' => 'required|integer',
        ]);

        $today = Carbon::today()->toDateString();
        $count = 0;

        DB::transaction(function () use ($validated, $today, &$count) {
            foreach ($validated['items'] as $item) {
                $delta = (int) $item['delta'];
                if ($delta === 0) {
                    continue;
                }

                $product = Product::where('id', $item['product_id'])
                    ->where('type', 'siswa')
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    continue;
                }

                if ($delta > 0) {
                    $product->increment('stock', $delta);
                    Consignment::create([
                        'seller_id' => $product->seller_id,
                        'product_id' => $product->id,
                        'type' => 'in',
                        'quantity' => $delta,
                        'date' => $today,
                        'notes' => 'Penerimaan titipan harian',
                    ]);
                } else {
                    // clamp supaya stok tak negatif
                    $take = min(abs($delta), (int) $product->stock);
                    if ($take > 0) {
                        $product->decrement('stock', $take);
                        Consignment::create([
                            'seller_id' => $product->seller_id,
                            'product_id' => $product->id,
                            'type' => 'out',
                            'quantity' => $take,
                            'date' => $today,
                            'notes' => 'Pengurangan stok harian',
                        ]);
                    }
                }

                $count++;
            }
        });

        return back()->with('success', "Stok diperbarui: {$count} produk.");
    }

    public function takeBack(Request $request)
    {
        // Terima single {product_id, leave} ATAU batch {items:[{product_id, leave}]}.
        $items = $request->input('items');
        if (!is_array($items)) {
            $items = [['product_id' => $request->input('product_id'), 'leave' => $request->input('leave')]];
        }
        $request->merge(['items' => $items]);

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.leave' => 'required|integer|min:0',
        ]);

        $today = Carbon::today()->toDateString();

        DB::transaction(function () use ($validated, $today) {
            foreach ($validated['items'] as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('type', 'siswa')
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    continue;
                }

                $leave = min((int) $item['leave'], (int) $product->stock);
                $taken = max(0, (int) $product->stock - $leave);

                if ($taken > 0) {
                    Consignment::create([
                        'seller_id' => $product->seller_id,
                        'product_id' => $product->id,
                        'type' => 'out',
                        'quantity' => $taken,
                        'date' => $today,
                        'notes' => 'Sisa diambil penitip',
                    ]);
                }

                $product->update(['stock' => $leave]);
            }
        });

        return back()->with('success', 'Sisa stok diperbarui.');
    }
}
