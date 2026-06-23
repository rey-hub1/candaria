<?php

namespace App\Http\Controllers;

use App\Exceptions\TransactionException;
use App\Models\ChangeDebt;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChangeDebtController extends Controller
{
    public function __construct(protected TransactionService $service) {}

    /** Daftar hutang kembalian (default: yang belum lunas). */
    public function index(Request $request)
    {
        $status = $request->input('status', 'unpaid');
        $search = $request->input('search');

        $debts = ChangeDebt::with(['transaction:id,transaction_code', 'creator:id,name', 'payer:id,name'])
            ->when(in_array($status, ['unpaid', 'paid']), fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where('customer_note', 'like', "%{$search}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $totals = [
            'unpaid_count' => ChangeDebt::unpaid()->count(),
            'unpaid_amount' => (int) ChangeDebt::unpaid()->sum('amount'),
        ];

        return Inertia::render('ChangeDebts/Index', [
            'debts' => $debts,
            'filters' => ['status' => $status, 'search' => $search],
            'totals' => $totals,
        ]);
    }

    /** Tandai lunas (uang kembalian akhirnya diberikan). */
    public function pay(ChangeDebt $changeDebt, Request $request)
    {
        try {
            $this->service->settleChangeDebt($changeDebt, $request->user());
        } catch (TransactionException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Hutang kembalian ditandai lunas.');
    }
}
