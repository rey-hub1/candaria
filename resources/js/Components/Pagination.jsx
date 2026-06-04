import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (links.length <= 3) return null;
    return (
        <div className="flex flex-wrap gap-1 justify-center mt-4">
            {links.map((link, key) =>
                link.url === null ? (
                    <div key={key}
                        className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50"
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <Link key={key} href={link.url}
                        className={`px-3 py-1.5 text-xs border rounded-lg transition ${
                            link.active
                                ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                )
            )}
        </div>
    );
}
