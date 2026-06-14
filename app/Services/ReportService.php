<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    public function getSalesData($startDate, $endDate)
    {
        $salesDataQuery = Transaction::active()->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as transaction_count'),
                DB::raw('SUM(total_amount) as total_sales')
            )
            ->when($startDate && $endDate, function($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            })
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->get()->keyBy('date');

        $profitsQuery = TransactionItem::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(profit_kantin) as profit_kantin'),
                DB::raw('SUM(profit_seller) as profit_seller')
            )
            ->when($startDate && $endDate, function($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            })
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()->keyBy('date');

        $result = [];
        foreach ($salesDataQuery as $date => $data) {
            $data->profit_kantin = $profitsQuery[$date]->profit_kantin ?? 0;
            $data->profit_seller = $profitsQuery[$date]->profit_seller ?? 0;
            $result[] = $data;
        }
        
        return collect($result);
    }

    public function getTitipanItems($startDate, $endDate, $sellerId, $isPdf = false)
    {
        $query = TransactionItem::whereHas('product', function($q) use ($sellerId) {
                $q->where('type', 'siswa')
                  ->when($sellerId, function($q2) use ($sellerId) {
                      return $q2->where('seller_id', $sellerId);
                  });
            })
            ->when($startDate && $endDate, function($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            })
            ->with(['product.seller', 'transaction', 'settlement'])
            ->latest();

        return $isPdf ? $query->get() : $query->paginate(15);
    }

    public function getTitipanSummary($startDate, $endDate, $sellerId)
    {
        return TransactionItem::whereHas('product', function($q) use ($sellerId) {
                $q->where('type', 'siswa')
                  ->when($sellerId, function($q2) use ($sellerId) {
                      return $q2->where('seller_id', $sellerId);
                  });
            })
            ->when($startDate && $endDate, function($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            })
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_qty')
            ->selectRaw('COALESCE(SUM(profit_seller), 0) as total_seller')
            ->selectRaw('COALESCE(SUM(profit_kantin), 0) as total_kantin')
            ->first();
    }
}
