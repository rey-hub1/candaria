import { useState } from 'react';

const CLOSED = { show: false, title: '', message: '', danger: true, singleButton: false, onConfirm: null };

/**
 * Manages a single ConfirmModal / AlertModal state.
 *
 * Usage:
 *   const { dialog, confirm, alert, dialogConfirm, dialogClose } = useDialog();
 *
 *   confirm({ message: 'Hapus ini?' }, () => router.delete(...));
 *   alert({ message: 'Stok tidak cukup.', danger: false });
 *
 *   <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
 */
export function useDialog() {
    const [dialog, setDialog] = useState(CLOSED);

    function confirm({ title = 'Konfirmasi', message = '', danger = true } = {}, callback) {
        setDialog({ show: true, title, message, danger, singleButton: false, onConfirm: callback ?? null });
    }

    function alert({ title = 'Perhatian', message = '', danger = false } = {}) {
        setDialog({ show: true, title, message, danger, singleButton: true, onConfirm: null });
    }

    function dialogConfirm() {
        const cb = dialog.onConfirm;
        setDialog(CLOSED);
        cb?.();
    }

    function dialogClose() {
        setDialog(CLOSED);
    }

    return { dialog, confirm, alert, dialogConfirm, dialogClose };
}
