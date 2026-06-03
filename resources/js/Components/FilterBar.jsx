import React from 'react';
import { router } from '@inertiajs/react';

export default function FilterBar({ filters = {}, searchPlaceholder = "Cari data...", showDateFilter = false }) {
    const handleSearch = (e) => {
        const value = e.target.value;
        const query = { ...filters, search: value };
        if (!value) delete query.search;
        
        router.get(window.location.pathname, query, { 
            preserveState: true, 
            preserveScroll: true, 
            replace: true 
        });
    };

    const handleDateChange = (type, value) => {
        const query = { ...filters, [type]: value };
        if (!value) delete query[type];
        
        router.get(window.location.pathname, query, { 
            preserveState: true, 
            preserveScroll: true, 
            replace: true 
        });
    };

    return (
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <input 
                type="text" 
                defaultValue={filters.search || ''} 
                onChange={(e) => {
                    clearTimeout(window.searchTimeout);
                    const evt = { ...e, target: { ...e.target, value: e.target.value } };
                    window.searchTimeout = setTimeout(() => handleSearch(evt), 300);
                }}
                placeholder={searchPlaceholder} 
                className="w-full sm:flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {showDateFilter && (
                <div className="flex gap-2">
                    <input 
                        type="date"
                        value={filters.start_date || ''}
                        onChange={(e) => handleDateChange('start_date', e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="self-center text-slate-400">s/d</span>
                    <input 
                        type="date"
                        value={filters.end_date || ''}
                        onChange={(e) => handleDateChange('end_date', e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            )}
        </div>
    );
}
