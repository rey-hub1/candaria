<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * Apply search and sorting to the query builder.
     *
     * @param Builder $query
     * @param array $filters ['search' => '...', 'sort' => 'column', 'dir' => 'asc|desc']
     * @param array $searchableColumns Columns to search against (can include relations like 'category.name')
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters, array $searchableColumns = [])
    {
        $query->when($filters['search'] ?? null, function ($query, $search) use ($searchableColumns) {
            $query->where(function ($query) use ($search, $searchableColumns) {
                foreach ($searchableColumns as $column) {
                    if (str_contains($column, '.')) {
                        [$relation, $relationColumn] = explode('.', $column);
                        $query->orWhereHas($relation, function ($query) use ($relationColumn, $search) {
                            $query->where($relationColumn, 'like', '%'.$search.'%');
                        });
                    } else {
                        $query->orWhere($column, 'like', '%'.$search.'%');
                    }
                }
            });
        });

        $query->when($filters['sort'] ?? null, function ($query, $sort) use ($filters) {
            $dir = strtolower($filters['dir'] ?? 'asc') === 'asc' ? 'asc' : 'desc';
            
            // Basic handling for relations in sort (e.g., 'category.name')
            // For true relation sorting in Eloquent, you typically need joins, 
            // but for simplicity we only sort on the primary table or let collections handle relations.
            if (!str_contains($sort, '.')) {
                $query->orderBy($sort, $dir);
            }
        });

        return $query;
    }
}
