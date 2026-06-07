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
                <span className="opacity-70 inline-flex">
                    {isSorted ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={isAsc ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                    ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    )}
                </span>
            </div>
        </th>
    );
}
