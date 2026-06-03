import React, { useState, useEffect } from 'react';

export default function NetworkIndicator() {
    const [isOnline, setIsOnline] = useState(true); // Default to true, we'll check in useEffect
    const [showBackOnline, setShowBackOnline] = useState(false);

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowBackOnline(true);
            
            // Hide the "back online" message after 3 seconds
            setTimeout(() => {
                setShowBackOnline(false);
            }, 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBackOnline(false); // Hide the success message if it was showing
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't render anything if online and no temporary success message is shown
    if (isOnline && !showBackOnline) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full px-4 max-w-sm">
            {!isOnline && (
                <div className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-rose-600/30 border border-rose-500/50 flex items-start gap-3 w-full animate-fade-in-up">
                    <div className="mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Koneksi Terputus</h4>
                        <p className="text-xs text-rose-100 mt-0.5">Jaringan internet Anda terputus. Beberapa fitur mungkin tidak berfungsi dengan baik.</p>
                    </div>
                </div>
            )}

            {isOnline && showBackOnline && (
                <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-500/50 flex items-start gap-3 w-full animate-fade-in-up">
                    <div className="mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Kembali Online</h4>
                        <p className="text-xs text-emerald-100 mt-0.5">Koneksi internet Anda telah kembali.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
