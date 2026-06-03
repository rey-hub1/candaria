import React from 'react';
import { router } from '@inertiajs/react';

export default function SortableHeader({ column, label, filters = {}, className = "" }) {
    const isSorted = filters.sort === column;
    const isAsc = filters.dir === 'asc';

    const handleSort = () => {
        const newFilters = { ...filters };
        
        if (!isSorted) {
            newFilters.sort = column;
            newFilters.dir = 'asc';
        } else if (isAsc) {
            newFilters.sort = column;
            newFilters.dir = 'desc';
        } else {
            delete newFilters.sort;
            delete newFilters.dir;
        }

        router.get(window.location.pathname, newFilters, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    return (
        <th 
            className={`px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none ${className}`} 
            onClick={handleSort}
        >
            <div className="flex items-center gap-1">
                {label}
                <span className="text-[10px] opacity-70">
                    {isSorted ? (isAsc ? '▲' : '▼') : '↕'}
                </span>
            </div>
        </th>
    );
}
