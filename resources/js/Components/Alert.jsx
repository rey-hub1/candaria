import React, { useState } from 'react';

export default function Alert({ children, type = 'info', className = '', dismissible = false }) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const styles = {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-primary-50 text-primary-800 border-primary-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        danger: 'bg-red-50 text-red-800 border-red-200',
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`p-4 mb-4 border rounded-lg ${style} ${className}`} role="alert">
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium">
                    {children}
                </div>
                {dismissible && (
                    <button 
                        type="button" 
                        onClick={() => setIsVisible(false)}
                        className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 inline-flex h-8 w-8 ${style} hover:bg-opacity-75 transition-opacity`}
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
