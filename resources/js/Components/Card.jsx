import React from 'react';

export default function Card({ children, className = '', title = null, footer = null }) {
    return (
        <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg border border-slate-200 ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-medium text-slate-800">{title}</h3>
                </div>
            )}
            
            <div className="p-6 text-slate-700">
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    {footer}
                </div>
            )}
        </div>
    );
}
