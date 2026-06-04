import { useState, useEffect } from 'react';

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function toDateString(dt) {
    const d = new Date(dt);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

export function formatDateIndonesian(dateString) {
    if (!dateString) return '-';
    const d = new Date(dateString + 'T00:00:00');
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * @param {string} initialStart  - YYYY-MM-DD
 * @param {string} initialEnd    - YYYY-MM-DD
 * @param {(start: string, end: string) => void} onNavigate - called on every filter change
 */
export function useDateFilter({ initialStart = '', initialEnd = '', initialPreset = null, onNavigate }) {
    const [localStartDate, setLocalStartDate] = useState(initialStart);
    const [localEndDate, setLocalEndDate] = useState(initialEnd);
    const [activePreset, setActivePreset] = useState(initialPreset);

    useEffect(() => {
        setLocalStartDate(initialStart);
        setLocalEndDate(initialEnd);
        setActivePreset(initialPreset);
    }, [initialStart, initialEnd, initialPreset]);

    function applyPreset(preset) {
        setActivePreset(preset);

        if (preset === 'all') {
            setLocalStartDate('');
            setLocalEndDate('');
            onNavigate('', '', preset);
            return;
        }

        const today = new Date();
        let start = new Date();
        let end   = new Date();

        switch (preset) {
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'last7':
                start.setDate(today.getDate() - 6);
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end   = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            // 'today' → start=end=today, already set
        }

        const s = toDateString(start);
        const e = toDateString(end);
        setLocalStartDate(s);
        setLocalEndDate(e);
        onNavigate(s, e, preset);
    }

    function handleFilterSubmit(e) {
        if (e) e.preventDefault();
        onNavigate(localStartDate, localEndDate);
    }

    const activeDateLabel = localStartDate && localEndDate
        ? `${formatDateIndonesian(localStartDate)} — ${formatDateIndonesian(localEndDate)}`
        : localStartDate
            ? `Sejak ${formatDateIndonesian(localStartDate)}`
            : 'Semua Waktu';

    return {
        localStartDate, setLocalStartDate,
        localEndDate,   setLocalEndDate,
        activePreset,
        applyPreset,
        handleFilterSubmit,
        activeDateLabel,
    };
}
