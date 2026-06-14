import React, { useRef, useState, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

export default function CustomKeyboard({
    inputValue,
    onChange,
    layout = "default", // "default" or "numeric"
    onClose,
    onSubmit,
    prefixes = [],
    defaultMode = "prefix", // "full" or "prefix"
}) {
    const keyboard = useRef();
    const [isShift, setIsShift] = useState(false);
    const [isFullMode, setIsFullMode] = useState(defaultMode === "full");
    const [isMobile, setIsMobile] = useState(false);

    // Mobile = icon-only labels so keys don't wrap/overflow
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Keep keyboard internal state synced with external value changes
    useEffect(() => {
        if (keyboard.current) {
            keyboard.current.setInput(inputValue ? String(inputValue) : "");
        }
    }, [inputValue]);

    const handleChange = (input) => {
        onChange(input);
    };

    const handleShift = () => {
        setIsShift(!isShift);
    };

    const handleModeToggle = () => {
        setIsFullMode(!isFullMode);
    };

    const onKeyPress = (button) => {
        if (button === "{shift}" || button === "{lock}") handleShift();
        if (button === "{mode}") handleModeToggle();
        if (button === "{close}") onClose();
        if (button === "{clear}") {
            onChange("");
            keyboard.current.setInput("");
        }
        if (button === "{enter}" && onSubmit) {
            onSubmit();
        }
    };

    const getPrefixRows = (prefs) => {
        if (!prefs || prefs.length === 0) return null;
        const rows = [];
        for (let i = 0; i < prefs.length; i += 10) {
            // Capitalize prefixes to match codes
            rows.push(prefs.slice(i, i + 10).map(p => p.toUpperCase()).join(" "));
        }
        return rows;
    };

    const prefixRows = getPrefixRows(prefixes);

    // SVG icon strings — react-simple-keyboard renders `display` as innerHTML
    const kbIcon = (inner) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-4px">${inner}</svg>`;
    const ICONS = {
        search: kbIcon('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
        bksp: kbIcon('<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>'),
        shift: kbIcon('<path d="M12 4l7 8h-4v6H9v-6H5l7-8z"/>'),
        close: kbIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
        trash: kbIcon('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
        kbd: kbIcon('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>'),
        space: kbIcon('<path d="M3 8v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/>'),
    };

    const getKeyboardLayout = () => {
        if (layout === "numeric") {
            return {
                default: [
                    "1 2 3",
                    "4 5 6",
                    "7 8 9",
                    "{bksp} 0 {enter}"
                ]
            };
        }
        
        const baseLayout = {
            full: [
                "1 2 3 4 5 6 7 8 9 0 {bksp}",
                "q w e r t y u i o p",
                "a s d f g h j k l",
                "{shift} z x c v b n m",
                (prefixRows ? "{mode} " : "") + "{space} {close} {enter}"
            ],
            shift: [
                "1 2 3 4 5 6 7 8 9 0 {bksp}",
                "Q W E R T Y U I O P",
                "A S D F G H J K L",
                "{shift} Z X C V B N M",
                (prefixRows ? "{mode} " : "") + "{space} {close} {enter}"
            ]
        };

        if (prefixRows) {
            return {
                ...baseLayout,
                default: [
                    "1 2 3 4 5 6 7 8 9 0 {bksp}",
                    ...prefixRows,
                    "{mode} {clear} {close} {enter}"
                ]
            };
        }

        return {
            ...baseLayout,
            default: baseLayout.full
        };
    };

    let currentLayoutName = "default";
    if (layout === "numeric") {
        currentLayoutName = "default";
    } else {
        if (prefixRows && !isFullMode) {
            currentLayoutName = "default";
        } else {
            currentLayoutName = isShift ? "shift" : "full";
        }
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-slate-100 border-t border-slate-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] px-1 pt-1 pb-2 sm:p-2 sm:pb-4 animate-slide-up">
            <div className="flex justify-between items-center px-2 mb-1 sm:mb-2">
                <div className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    Keyboard Kasir
                </div>
                <button onClick={onClose} className="px-3 py-1 sm:px-4 sm:py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-200 transition shadow-sm active:scale-95">SELESAI</button>
            </div>
            <div className="max-w-4xl mx-auto">
                <Keyboard
                    keyboardRef={r => (keyboard.current = r)}
                    layoutName={currentLayoutName}
                    layout={getKeyboardLayout()}
                    display={{
                        "{bksp}": isMobile ? ICONS.bksp : ICONS.bksp + " Hapus",
                        "{enter}": isMobile ? ICONS.search : ICONS.search + " Cari",
                        "{shift}": isMobile ? ICONS.shift : ICONS.shift + " Caps",
                        "{space}": isMobile ? ICONS.space : ICONS.space + " Spasi",
                        "{close}": isMobile ? ICONS.close : ICONS.close + " Tutup",
                        "{clear}": isMobile ? ICONS.trash : ICONS.trash + " Hapus Semua",
                        "{mode}": isMobile ? ICONS.kbd : ICONS.kbd + (isFullMode ? " Prefix" : " Lengkap"),
                    }}
                    theme={"hg-theme-default custom-keyboard-theme"}
                    onChange={handleChange}
                    onKeyPress={onKeyPress}
                    value={inputValue ? String(inputValue) : ""}
                />
            </div>
            <style>{`
                .custom-keyboard-theme {
                    background-color: transparent !important;
                }
                .custom-keyboard-theme .hg-button {
                    height: 55px !important;
                    flex: 1 1 0 !important;
                    min-width: 0 !important;
                    max-width: none !important;
                    border-radius: 12px !important;
                    font-weight: 800 !important;
                    font-size: 1.1rem !important;
                    color: #0f172a !important;
                    background: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: 0 4px 0 #cbd5e1 !important;
                    transition: all 0.1s !important;
                }
                .custom-keyboard-theme .hg-button:active {
                    transform: translateY(4px) !important;
                    box-shadow: none !important;
                }
                .custom-keyboard-theme .hg-button-bksp {
                    background: #fee2e2 !important;
                    color: #b91c1c !important;
                    border-color: #fca5a5 !important;
                    box-shadow: 0 4px 0 #fca5a5 !important;
                }
                .custom-keyboard-theme .hg-button-clear {
                    background: #fef3c7 !important;
                    color: #b45309 !important;
                    border-color: #fcd34d !important;
                    box-shadow: 0 4px 0 #fcd34d !important;
                }
                .custom-keyboard-theme .hg-button-enter {
                    background: #d1fae5 !important;
                    color: #047857 !important;
                    border-color: #a7f3d0 !important;
                    box-shadow: 0 4px 0 #a7f3d0 !important;
                }
                .custom-keyboard-theme .hg-button-mode {
                    background: #e0f2fe !important;
                    color: #0369a1 !important;
                    border-color: #bae6fd !important;
                    box-shadow: 0 4px 0 #bae6fd !important;
                }
                .custom-keyboard-theme .hg-button {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 6px !important;
                }
                .custom-keyboard-theme .hg-button > span {
                    white-space: nowrap !important;
                    overflow: visible !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                }
                .custom-keyboard-theme .hg-button svg {
                    flex-shrink: 0 !important;
                }
                /* Tombol fungsi (punya label teks) butuh lebih lebar + font lebih kecil
                   agar "Hapus"/"Hapus Semua" muat penuh, tidak kepotong jadi "Hap". */
                .custom-keyboard-theme .hg-button-bksp,
                .custom-keyboard-theme .hg-button-enter,
                .custom-keyboard-theme .hg-button-shift,
                .custom-keyboard-theme .hg-button-close,
                .custom-keyboard-theme .hg-button-clear,
                .custom-keyboard-theme .hg-button-mode,
                .custom-keyboard-theme .hg-button-space {
                    flex-grow: 1.7 !important;
                    font-size: 0.9rem !important;
                    padding-left: 8px !important;
                    padding-right: 8px !important;
                }
                @media (max-width: 767px) {
                    .custom-keyboard-theme.hg-theme-default {
                        padding: 2px !important;
                    }
                    .custom-keyboard-theme .hg-button {
                        height: 42px !important;
                        font-size: 0.95rem !important;
                        font-weight: 700 !important;
                        border-radius: 7px !important;
                        margin: 1.5px !important;
                        gap: 3px !important;
                        box-shadow: 0 3px 0 #cbd5e1 !important;
                    }
                    .custom-keyboard-theme .hg-button:active {
                        transform: translateY(3px) !important;
                    }
                    .custom-keyboard-theme .hg-button-bksp { box-shadow: 0 3px 0 #fca5a5 !important; }
                    .custom-keyboard-theme .hg-button-clear { box-shadow: 0 3px 0 #fcd34d !important; }
                    .custom-keyboard-theme .hg-button-enter { box-shadow: 0 3px 0 #a7f3d0 !important; }
                    .custom-keyboard-theme .hg-button-mode { box-shadow: 0 3px 0 #bae6fd !important; }
                    .custom-keyboard-theme .hg-row {
                        margin-bottom: 1.5px !important;
                    }
                    .custom-keyboard-theme .hg-row:last-child {
                        margin-bottom: 0 !important;
                    }
                    .custom-keyboard-theme .hg-button > span {
                        gap: 3px !important;
                    }
                    .custom-keyboard-theme .hg-button svg {
                        width: 18px !important;
                        height: 18px !important;
                    }
                    .custom-keyboard-theme .hg-button-bksp,
                    .custom-keyboard-theme .hg-button-enter,
                    .custom-keyboard-theme .hg-button-shift,
                    .custom-keyboard-theme .hg-button-close,
                    .custom-keyboard-theme .hg-button-clear,
                    .custom-keyboard-theme .hg-button-mode {
                        font-size: 1.1rem !important;
                    }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
