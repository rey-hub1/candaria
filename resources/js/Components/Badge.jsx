import React from 'react';

export default function Badge({ children, type = 'primary', className = '' }) {
    const types = {
        primary: 'bg-primary-100 text-primary-800 border-primary-200',
        secondary: 'bg-slate-100 text-slate-800 border-slate-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const typeClasses = types[type] || types.primary;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeClasses} ${className}`}>
            {children}
        </span>
    );
}
