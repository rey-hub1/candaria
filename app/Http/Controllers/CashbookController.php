<?php

namespace App\Http\Controllers;

use App\Models\Cashbook;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CashbookController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'sort', 'dir', 'start_date', 'end_date', 'preset']);
        
        $query = Cashbook::with('user')->filter($filters, ['description', 'source']);

        if (!empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }
        
        
        // Default sort if not provided
        if (!$request->has('sort')) {
            $query->orderBy('date', 'desc')->orderBy('id', 'desc');
        }

        $cashbooks = $query->paginate(20)->withQueryString();
        
        // Calculate total balance
        $totalDebit = Cashbook::where('type', 'debit')->sum('amount');
        $totalCredit = Cashbook::where('type', 'credit')->sum('amount');
        $currentBalance = $totalDebit - $totalCredit;

        // Export Logic
        if ($request->input('export') === 'pdf' || $request->input('export') === 'xlsx') {
            $exportData = $query->get();
            $exportTotalDebit = $exportData->where('type', 'debit')->sum('amount');
            $exportTotalCredit = $exportData->where('type', 'credit')->sum('amount');
            $exportCurrentBalance = $exportTotalDebit - $exportTotalCredit;

            if ($request->input('export') === 'pdf') {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.cashbooks_pdf', compact('exportData', 'exportTotalDebit', 'exportTotalCredit', 'exportCurrentBalance'))
                    ->setPaper('a4', 'portrait');
                return $pdf->stream('laporan-buku-kas.pdf');
            }

            if ($request->input('export') === 'xlsx') {
                return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\CashbookExport($exportData, $exportTotalDebit, $exportTotalCredit, $exportCurrentBalance), 'laporan-buku-kas.xlsx');
            }
        }

        return Inertia::render('Cashbooks/Index', [
            'cashbooks' => $cashbooks,
            'filters' => $filters,
            'currentBalance' => $currentBalance,
            'totalDebit' => $totalDebit,
            'totalCredit' => $totalCredit,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'type' => 'required|in:debit,credit',
            'amount' => 'required|numeric|min:0',
        ]);

        Cashbook::create([
            'date' => $request->date,
            'description' => $request->description,
            'type' => $request->type,
            'amount' => $request->amount,
            'source' => 'manual',
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('cashbooks.index')->with('success', 'Transaksi kas berhasil ditambahkan.');
    }

    public function destroy(Cashbook $cashbook)
    {
        if ($cashbook->source !== 'manual') {
            return redirect()->route('cashbooks.index')->with('error', 'Tidak dapat menghapus transaksi otomatis dari sistem.');
        }

        $cashbook->delete();

        return redirect()->route('cashbooks.index')->with('success', 'Transaksi kas berhasil dihapus.');
    }
}
