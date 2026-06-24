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

        $base = ChangeDebt::with(['transaction:id,transaction_code', 'creator:id,name', 'payer:id,name'])
            ->when(in_array($status, ['unpaid', 'paid']), fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where(function ($sub) use ($search) {
                $sub->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_class', 'like', "%{$search}%")
                    ->orWhere('customer_note', 'like', "%{$search}%");
            }))
            ->latest();

        // Export (filtered set, unpaginated) — konsisten dgn laporan lain.
        $export = $request->input('export');
        if (in_array($export, ['xlsx', 'pdf'], true)) {
            $rows = $base->get();
            $total = (int) $rows->sum('amount');
            $unpaid = (int) $rows->where('status', 'unpaid')->sum('amount');
            $fname = 'laporan-hutang-kembalian-'.now()->format('Ymd');

            if ($export === 'pdf') {
                return \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.change_debts_pdf', [
                    'debts' => $rows, 'total' => $total, 'unpaid' => $unpaid,
                ])->setPaper('a4', 'portrait')->stream($fname.'.pdf');
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ChangeDebtsExport($rows, $total, $unpaid), $fname.'.xlsx'
            );
        }

        $debts = $base->paginate(20)->withQueryString();

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
