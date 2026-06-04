import React from 'react';
import Modal from '@/Components/Modal';

const WarnIcon = () => (
    <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

/**
 * ConfirmModal — replaces native confirm() and alert().
 *
 * confirm mode: show Batal + confirmLabel buttons (default)
 * alert  mode: show single OK button (singleButton=true)
 * danger mode: red confirm button (default true for confirm, false for alert)
 */
export default function ConfirmModal({
    show = false,
    title = 'Konfirmasi',
    message = '',
    onConfirm,
    onClose,
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    danger = true,
    singleButton = false,
}) {
    return (
        <Modal show={show} maxWidth="sm" onClose={onClose} closeable>
            <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-rose-100' : 'bg-amber-50'}`}>
                        {danger ? <WarnIcon /> : <InfoIcon />}
                    </div>
                    <div className="pt-0.5">
                        <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                    {!singleButton && (
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                            {cancelLabel}
                        </button>
                    )}
                    <button type="button"
                        onClick={() => { onConfirm?.(); if (singleButton) onClose(); }}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition ${
                            danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
                        }`}>
                        {singleButton ? 'OK' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
