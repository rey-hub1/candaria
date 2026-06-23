<?php

namespace App\Http\Controllers;

use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Inertia\Inertia;

class DailyUploadController extends Controller
{
    public function __construct(protected WeeklyReportService $service) {}

    public function index()
    {
        $today = Carbon::today();
        [$start, $end] = $this->service->weekRange($today->toDateString());
        $days = $this->service->activeDays($start, $end);

        $activeDays = collect($days)->map(fn($d) => [
            'date'  => $d->toDateString(),
            'label' => $this->service->namaHari($d) . ', ' . $d->format('d M Y'),
            'isToday' => $d->isSameDay($today),
        ])->values();

        return Inertia::render('DailyUpload/Index', [
            'weekStart'  => $start->toDateString(),
            'weekEnd'    => $end->toDateString(),
            'activeDays' => $activeDays,
            'todayHasData' => $activeDays->contains('isToday', true),
        ]);
    }
}
