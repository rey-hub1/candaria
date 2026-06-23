<?php

namespace App\Http\Controllers;

use App\Exports\WeeklyConsignmentExport;
use App\Exports\WeeklyDailyExport;
use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class WeeklyReportController extends Controller
{
    public function __construct(protected WeeklyReportService $service) {}

    /** Halaman pilih minggu + tombol unduh 2 laporan. */
    public function index(Request $request)
    {
        [$start, $end] = $this->service->weekRange($request->input('week'));
        $days = $this->service->activeDays($start, $end);

        return Inertia::render('Reports/Weekly', [
            'weekStart' => $start->toDateString(),
            'weekEnd' => $end->toDateString(),
            'anchor' => $request->input('week', Carbon::today()->toDateString()),
            'activeDays' => collect($days)->map(fn ($d) => [
                'date' => $d->toDateString(),
                'label' => $this->service->namaHari($d) . ', ' . $d->format('d M Y'),
            ]),
        ]);
    }

    public function consignment(Request $request)
    {
        [$start, $end] = $this->service->weekRange($request->input('week'));
        $name = 'LAPORAN KONSYIANSI ' . $this->fileRange($start, $start->copy()->addDays(4)) . '.xlsx';

        return Excel::download(new WeeklyConsignmentExport($start, $end, $this->service), $name);
    }

    public function daily(Request $request)
    {
        [$start, $end] = $this->service->weekRange($request->input('week'));
        $name = 'LAPORAN HARIAN ' . $this->fileRange($start, $start->copy()->addDays(4)) . '.xlsx';

        return Excel::download(new WeeklyDailyExport($start, $end, $this->service), $name);
    }

    /** "15-19 JUNI 2026" — meniru penamaan file referensi. */
    protected function fileRange(Carbon $start, Carbon $end): string
    {
        $bulan = ['', 'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
        if ($start->month === $end->month) {
            return $start->format('d') . '-' . $end->format('d') . ' ' . $bulan[$end->month] . ' ' . $end->format('Y');
        }
        return $start->format('d') . ' ' . $bulan[$start->month] . '-' . $end->format('d') . ' ' . $bulan[$end->month] . ' ' . $end->format('Y');
    }
}
