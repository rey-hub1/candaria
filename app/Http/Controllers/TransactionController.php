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
    public function index(Request $request)
    {
        $filters = $request->only([
            'search', 'sort', 'dir', 'start_date', 'end_date',
            'status', 'cashier_id', 'min_amount', 'max_amount',
        ]);

        $query = Transaction::with(['user', 'items.product', 'changeDebt'])
            ->filter($filters, ['transaction_code']);

        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }
        if (! empty($filters['status']) && in_array($filters['status'], [Transaction::STATUS_COMPLETED, Transaction::STATUS_VOIDED], true)) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['cashier_id'])) {
            $query->where('user_id', $filters['cashier_id']);
        }
        if (is_numeric($filters['min_amount'] ?? null)) {
            $query->where('total_amount', '>=', $filters['min_amount']);
        }
        if (is_numeric($filters['max_amount'] ?? null)) {
            $query->where('total_amount', '<=', $filters['max_amount']);
        }

        // Export filtered set (full, unpaginated)
        $export = $request->input('export');
        if (in_array($export, ['xlsx', 'pdf'], true)) {
            $rows = $query->latest()->get();
            $fname = 'riwayat-transaksi-'.now()->format('Ymd-His');

            if ($export === 'pdf') {
                return \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.transactions_pdf', [
                    'transactions' => $rows,
                    'filters' => $filters,
                ])->setPaper('a4', 'landscape')->stream($fname.'.pdf');
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\TransactionsExport($rows, $filters),
                $fname.'.xlsx'
            );
        }

        $transactions = $query->latest()->paginate(15)->withQueryString();

        $cashiers = \App\Models\User::whereIn('id', Transaction::query()->distinct()->pluck('user_id'))
            ->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $filters,
            'cashiers' => $cashiers,
        ]);
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
                $request->validated('customer_name'),
                $request->validated('customer_class'),
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
            'changeDebt',
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
