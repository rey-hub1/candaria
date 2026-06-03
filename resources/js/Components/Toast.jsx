import React, { useEffect, useState } from 'react';

export function Toast({ type = 'success', message, duration = 3000, onClose }) {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        // Trigger entrance animation shortly after mount
        const timerVisible = setTimeout(() => setVisible(true), 10);

        // Auto-close after duration
        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timerVisible);
            clearTimeout(closeTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setClosing(true);
        // Wait for exit animation to finish before unmounting
        setTimeout(onClose, 300);
    };

    const typeConfig = {
        success: {
            iconColor: 'text-emerald-400',
            bgGlow: 'shadow-emerald-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            ),
        },
        error: {
            iconColor: 'text-rose-400',
            bgGlow: 'shadow-rose-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        warning: {
            iconColor: 'text-amber-400',
            bgGlow: 'shadow-amber-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            ),
        },
        info: {
            iconColor: 'text-blue-400',
            bgGlow: 'shadow-blue-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 1 1 1.085 1.085l-.04.04m-2.138 3.75h3.0m-3.0-3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
            ),
        },
    }[type];

    return (
        <div
            className={`flex items-center gap-3 px-5 py-3.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-full shadow-xl transition-all duration-300 ease-out transform pointer-events-auto max-w-sm w-max ${typeConfig.bgGlow} ${
                visible && !closing
                    ? 'translate-y-0 opacity-100 scale-100'
                    : '-translate-y-8 opacity-0 scale-90'
            }`}
        >
            {/* Icon */}
            <div className={`shrink-0 ${typeConfig.iconColor}`}>
                {typeConfig.icon}
            </div>

            {/* Message */}
            <div className="flex-1 pr-2">
                <p className="text-[13px] sm:text-sm font-semibold text-slate-100 tracking-wide">
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="shrink-0 text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none bg-slate-800 hover:bg-slate-700 rounded-full p-1"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full px-4 pointer-events-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
