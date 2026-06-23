<?php

namespace App\Http\Controllers;

use App\Exceptions\TransactionException;
use App\Http\Requests\CheckoutRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $service) {}

    // List all transactions (for reports/history)
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'dir', 'start_date', 'end_date']);
        $query = Transaction::with(['user', 'items.product'])->filter($filters, ['transaction_code']);

        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        $transactions = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Transactions/Index', ['transactions' => $transactions, 'filters' => $filters]);
    }

    // Cashier interface
    public function create(Request $request)
    {
        $search = $request->input('search');

        $query = Product::with(['category', 'seller']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Out-of-stock products stay visible but sink to the bottom of the list
        $query->orderByRaw('CASE WHEN stock > 0 THEN 0 ELSE 1 END');
        if ($search) {
            $query->orderByRaw('CASE WHEN code LIKE ? THEN 1 ELSE 2 END', ["{$search}%"]);
        }
        $query->orderBy('name');

        // Limit to 50 for performance
        $products = $query->take(50)->get();

        // Use 'prefix' column (active) for the kasir keyboard prefix buttons
        $prefixes = Category::whereNotNull('prefix')->distinct()->pluck('prefix')->values();

        return Inertia::render('Transactions/Create', [
            'products' => $products,
            'search' => $search,
            'prefixes' => $prefixes,
        ]);
    }

    // Checkout / Store Transaction
    public function checkout(CheckoutRequest $request)
    {
        try {
            $transaction = $this->service->checkout(
                $request->validated('items'),
                (float) $request->validated('paid_amount'),
                $request->user(),
                (float) ($request->validated('change_debt') ?? 0),
                $request->validated('customer_note'),
            );
        } catch (TransactionException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->route('transactions.show', $transaction->id)
            ->with('success', 'Transaksi berhasil disimpan!')
            ->with('print_modal', true);
    }

    // View transaction receipt / detail
    public function show($id)
    {
        $transaction = Transaction::with([
            'user',
            'voider',
            'items' => fn ($q) => $q->withTrashed()->with('product.seller'),
        ])->findOrFail($id);

        $printModal = session()->get('print_modal', false);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'printModal' => (bool) $printModal,
        ]);
    }

    // Void / Cancel Transaction (soft void — record is kept for audit)
    public function destroy(Request $request, $id)
    {
        $transaction = Transaction::with('items')->findOrFail($id);

        try {
            $this->service->void($transaction, $request->input('reason'), $request->user());
        } catch (TransactionException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil dibatalkan (void). Stok telah dikembalikan.');
    }
}
