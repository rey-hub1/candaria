<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'sort', 'dir', 'event', 'start_date', 'end_date']);

        $query = ActivityLog::with('user:id,name,role')
            ->filter($filters, ['description', 'subject_type', 'event']);

        if (! empty($filters['event'])) {
            $query->where('event', $filters['event']);
        }
        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (! $request->has('sort')) {
            $query->latest();
        }

        $logs = $query->paginate(25)->withQueryString();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'events' => ['created', 'updated', 'deleted', 'checkout', 'voided'],
        ]);
    }
}
