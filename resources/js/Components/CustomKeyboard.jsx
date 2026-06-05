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

    const getKeyboardLayout = () => {
        if (layout === "numeric") {
            return {
                default: [
                    "1 2 3", 
                    "4 5 6", 
                    "7 8 9", 
                    "{clear} 0 {bksp} {enter}"
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
        <div className="fixed bottom-0 left-0 w-full bg-slate-100 border-t border-slate-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] p-2 pb-6 md:pb-4 animate-slide-up">
            <div className="flex justify-between items-center px-2 mb-2">
                <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    Keyboard Kasir
                </div>
                <button onClick={onClose} className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition shadow-sm active:scale-95">SELESAI</button>
            </div>
            <div className="max-w-4xl mx-auto">
                <Keyboard
                    keyboardRef={r => (keyboard.current = r)}
                    layoutName={currentLayoutName}
                    layout={getKeyboardLayout()}
                    display={{
                        "{bksp}": "⌫ Hapus",
                        "{enter}": "🔍 Cari",
                        "{shift}": "⇧ Caps",
                        "{space}": "Spasi",
                        "{close}": "Tutup",
                        "{clear}": "Hapus",
                        "{mode}": isFullMode ? "⌨️ Prefix" : "⌨️ Lengkap"
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
