import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Head, Link, useForm, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ConfirmModal from "@/Components/ConfirmModal";
import { useDialog } from "@/hooks/useDialog";
import { formatRupiah } from "@/utils/format";
import CustomKeyboard from "@/Components/CustomKeyboard";

// Touch detection: only force readOnly (on-screen keyboard) on touch devices,
// so desktop users can type with the physical keyboard. Computed once.
const isTouchDevice =
    typeof window !== "undefined" &&
    (("ontouchstart" in window) ||
        window.matchMedia("(pointer: coarse)").matches);

const ProductCard = React.memo(function ProductCard({ product, cartQty = 0, onAdd }) {
    const remainingStock = product.stock - cartQty;
    const isOut = remainingStock <= 0;
    return (
        <div className={`border rounded-xl p-3 md:p-4 flex flex-col justify-between hover:shadow-md transition duration-200 ${isOut ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300' : 'bg-slate-50 border-slate-200 hover:border-primary-300'}`}>
            <div>
                <div className="flex justify-between items-start gap-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase ${product.type === "kantin" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>
                        {product.type === "kantin" ? "Kantin" : "Siswa"}
                    </span>
                    <span className="text-[8px] md:text-[9px] text-slate-400 font-mono">{product.code}</span>
                </div>

                {product.image_url ? (
                    <div className="mt-2 mb-1 w-full h-24 md:h-28 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="mt-2 mb-1 w-full h-24 md:h-28 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-200 shadow-sm">
                        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                )}

                <h4 className="font-bold text-slate-900 text-xs md:text-sm mt-2 leading-snug">{product.name}</h4>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">{product.category?.name}</p>
                {product.seller && (
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-semibold mt-1">Siswa: {product.seller.name}</p>
                )}
            </div>

            <div className="mt-3 md:mt-4">
                <div className="flex justify-between items-baseline mb-2">
                    <span className={`text-[10px] md:text-xs font-semibold ${isOut ? 'text-amber-600' : 'text-slate-400'}`}>{isOut ? 'Stok Habis' : `Stok: ${remainingStock}`}</span>
                    <span className="font-extrabold text-slate-900 text-xs md:text-sm">{formatRupiah(product.selling_price)}</span>
                </div>
                <button
                    onClick={() => onAdd(product.id)}
                    className={`w-full py-1.5 md:py-2 text-white font-semibold text-[10px] md:text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1 ${isOut ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-600 hover:bg-primary-700'}`}
                >
                    {isOut ? (
                        <>
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Paksa Tambah
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                            </svg>
                            Tambah
                        </>
                    )}
                </button>
            </div>
        </div>
    );
});

// Blok hutang ke customer: muncul saat ada kembalian. Kasir pencet tombol
// "Hutang ke Customer" (kantin ga ada receh) → default titip seluruh kembalian,
// lalu tulis nama + kelas. Bisa diedit untuk titip sebagian.
// Receh yang dititip default: kalau kembalian kelipatan 1000 → titip 1000,
// kalau ada sisa 500 → titip 500 saja. Cth: 2500→500, 2000→1000, 3000→1000.
function suggestTitip(change) {
    if (change <= 0) return 0;
    const rem = change % 1000;
    return Math.min(change, rem === 0 ? 1000 : rem);
}

function TitipKembalian({ change, titip, setTitip, name, setName, customerClass, setCustomerClass }) {
    if (change <= 0) return null;
    const safeTitip = Math.min(change, Math.max(0, Number(titip) || 0));
    const active = safeTitip > 0;

    const aktifkan = () => {
        setTitip(suggestTitip(change)); // default: receh (500/1000)
    };

    const batalkan = () => {
        setTitip(0);
        setName("");
        setCustomerClass("");
    };

    if (!active) {
        return (
            <button
                type="button"
                onClick={aktifkan}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Hutang ke Customer (titip kembalian)
            </button>
        );
    }

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-2">
            <div className="flex items-center justify-between">
                <label className="font-semibold text-amber-800">Hutang ke Customer</label>
                <button type="button" onClick={batalkan} className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline">
                    Batal
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input
                    type="text"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama customer *"
                    className="rounded-md border border-amber-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-amber-500"
                />
                <input
                    type="text"
                    maxLength={50}
                    value={customerClass}
                    onChange={(e) => setCustomerClass(e.target.value)}
                    placeholder="Kelas"
                    className="rounded-md border border-amber-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-amber-500"
                />
            </div>

            <div>
                <label className="block text-xs text-amber-700 mb-1">Nominal dihutang (Rp)</label>
                <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={change}
                    value={titip || ""}
                    onChange={(e) => setTitip(Math.min(change, Math.max(0, Number(e.target.value) || 0)))}
                    placeholder="Nominal dihutang (Rp)"
                    className="w-full rounded-md border border-amber-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex gap-1.5 mt-1.5">
                    {[500, 1000].filter((v) => v <= change).map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => setTitip(v)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                                safeTitip === v ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                        >
                            {formatRupiah(v)}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setTitip(change)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                            safeTitip === change ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                    >
                        Semua
                    </button>
                </div>
            </div>

            <div className="flex justify-between text-xs text-amber-700">
                <span>Diberikan sekarang</span>
                <span className="font-bold">{formatRupiah(change - safeTitip)}</span>
            </div>
            {!name.trim() && (
                <p className="text-xs text-rose-600 font-medium">Nama customer wajib diisi.</p>
            )}
        </div>
    );
}

export default function Create({
    products = [],
    search = "",
    prefixes = [],
}) {
    const { props: { settings } } = usePage();
    const keyboardDefaultMode = settings?.keyboard_default_mode || 'prefix';
    const { dialog, confirm: openConfirm, alert: openAlert, dialogConfirm, dialogClose } = useDialog();
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem("candaria_cart");
            if (savedCart) return JSON.parse(savedCart);
        } catch (e) {
            console.error("Failed to parse cart from local storage");
        }
        return {};
    });
    const [showCartDrawer, setShowCartDrawer] = useState(false);
    const [paidAmount, setPaidAmount] = useState(0);
    // Titip kembalian: kasir tak bisa kasih kembalian penuh → jadi hutang ke customer.
    const [titipKembalian, setTitipKembalian] = useState(0);
    const [customerName, setCustomerName] = useState("");
    const [customerClass, setCustomerClass] = useState("");

    // Custom Keyboard State
    const [activeInput, setActiveInput] = useState(null); // 'search', 'paidAmount', or null
    const [localSearch, setLocalSearch] = useState(search || "");

    const addSoundRef = useRef(null);

    useEffect(() => {
        addSoundRef.current = new Audio("/sounds/add.mp3");

        const handleGlobalKeyDown = (e) => {
            // Ignore if focus is in an input or textarea
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            // Keyboard shortcut 'c' for Checkout
            if (e.key.toLowerCase() === 'c') {
                e.preventDefault();
                // We use document.getElementById since handleCheckoutSubmit uses stale state if captured in useEffect without dependencies
                const checkoutBtn = document.getElementById('desktop-checkout-btn') ?? document.getElementById('mobile-checkout-btn');
                if (checkoutBtn) checkoutBtn.click();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    useEffect(() => {
        localStorage.setItem("candaria_cart", JSON.stringify(cart));
    }, [cart]);

    // Keep a ref so handleAddToCart stays stable
    const cartRef = useRef(cart);
    useEffect(() => { cartRef.current = cart; }, [cart]);

    const cartItems = useMemo(
        () => Object.entries(cart).map(([id, item]) => ({ id, ...item })),
        [cart]
    );

    const totalAmount = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0),
        [cartItems]
    );


    // Add to Cart — stable ref so ProductCard memo works
    const handleAddToCart = useCallback((productId) => {
        const currentCart = cartRef.current;
        const product = currentCart[productId] || products.find(p => p.id === productId || p.id === parseInt(productId));
        if (!product) return;

        const currentQty = currentCart[productId]?.quantity ?? 0;
        if (currentQty + 1 > product.stock) {
            // Single press = force add. Server bumps real stock by 1.
            router.post(route('products.force-increment', product.id), {}, {
                preserveScroll: true,
                preserveState: true,
            });
            setCart(prev => ({ ...prev, [productId]: { ...(prev[productId] || product), quantity: currentQty + 1 } }));
            return;
        }

        setCart(prev => ({ ...prev, [productId]: { ...(prev[productId] || product), quantity: currentQty + 1 } }));
    }, [products]);

    // Live search — debounced server fetch as the user types
    const searchDebounce = useRef(null);
    const skipFirstSearch = useRef(true);
    useEffect(() => {
        // Don't refetch on mount; products already match `search`
        if (skipFirstSearch.current) {
            skipFirstSearch.current = false;
            return;
        }
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            router.get(
                route('transactions.create'),
                localSearch ? { search: localSearch } : {},
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);
        return () => searchDebounce.current && clearTimeout(searchDebounce.current);
    }, [localSearch]);

    const handleSearchReset = () => {
        setLocalSearch("");
    };

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();

        router.get(route('transactions.create'), { search: localSearch }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const exactMatch = page.props.products.find(
                    (p) => p.code?.toLowerCase() === localSearch.trim().toLowerCase()
                );

                if (exactMatch) {
                    // Need to use handleAddToCart logic directly here because handleAddToCart uses stale closure if called directly
                    setCart(prev => {
                        const product = prev[exactMatch.id] || exactMatch;
                        const currentQty = prev[exactMatch.id] ? prev[exactMatch.id].quantity : 0;
                        if (currentQty + 1 > product.stock) {
                            // Single scan/Enter = force add. Server bumps real stock by 1.
                            router.post(route('products.force-increment', exactMatch.id), {}, {
                                preserveScroll: true,
                                preserveState: true,
                            });
                        }
                        return {
                            ...prev,
                            [exactMatch.id]: {
                                ...product,
                                quantity: currentQty + 1
                            }
                        };
                    });

                    // Clear search
                    setLocalSearch('');
                    router.get(route('transactions.create'), {}, { preserveState: true, preserveScroll: true });
                }
            }
        });
    };

    // Update Quantity
    const handleUpdateQuantity = (productId, newQty) => {
        if (newQty <= 0) {
            handleRemoveFromCart(productId);
            return;
        }

        const product = cart[productId];
        if (!product) return;

        if (newQty > product.stock) {
            openAlert({ title: 'Stok Tidak Cukup', message: `Stok hanya tersedia ${product.stock} pcs.`, danger: false });
            return;
        }

        setCart(prev => ({ ...prev, [productId]: { ...prev[productId], quantity: newQty } }));
    };

    // Remove from Cart (Client Side)
    const handleRemoveFromCart = (productId) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
    };

    // Clear Cart (Client Side)
    const handleClearCart = (e) => {
        e.preventDefault();
        openConfirm({ message: 'Kosongkan keranjang?', danger: false }, () => setCart({}));
    };

    // Checkout Submit
    const handleCheckoutSubmit = (e) => {
        if (e) e.preventDefault();

        // Hutang ke customer wajib ada nama.
        if ((Number(titipKembalian) || 0) > 0 && !customerName.trim()) {
            openAlert({ message: "Nama customer wajib diisi untuk hutang kembalian." });
            return;
        }

        if (addSoundRef.current) {
            addSoundRef.current.currentTime = 0;
            addSoundRef.current
                .play()
                .catch((err) => console.log("Audio play failed:", err));
        }

        const items = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));

        // Clear local storage IMMEDIATELY before redirect
        localStorage.removeItem("candaria_cart");

        router.post(route("checkout"), {
            paid_amount: paidAmount,
            change_debt: titipKembalian || 0,
            customer_name: customerName || null,
            customer_class: customerClass || null,
            items: items
        }, {
            onSuccess: () => {
                setCart({});
                setPaidAmount(0);
                setTitipKembalian(0);
                setCustomerName("");
                setCustomerClass("");
            }
        });
    };

    // Shortcuts for cash denominations
    const addToPaidAmount = (amount) => {
        setPaidAmount((prev) => Number(prev || 0) + amount);
    };

    const adjustPaidAmount = (value) => {
        setPaidAmount((prev) => Math.max(0, Number(prev || 0) + value));
    };

    return (
        <AuthenticatedLayout title="Kasir (Checkout)">
            <Head title="Kasir (Checkout)" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-full">
                {/* Left Column: Search & Products Grid */}
                <div className="lg:col-span-2 flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto">
                    {/* Search Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex gap-2"
                        >
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    name="search"
                                    value={localSearch}
                                    readOnly={isTouchDevice} // Prevent native keyboard on touch devices only
                                    onClick={() => setActiveInput('search')}
                                    onChange={(e) =>
                                        setLocalSearch(e.target.value)
                                    }
                                    placeholder="Cari produk (Ketuk untuk Keyboard)..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                                />
                                <div className="absolute left-3 top-3 text-slate-400">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                            <button
                                id="search-btn"
                                type="submit"
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition"
                            >
                                Cari
                            </button>
                            {localSearch && (
                                <button
                                    type="button"
                                    onClick={handleSearchReset}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Products Grid */}
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm md:text-base font-bold text-slate-900">
                                Pilih Produk
                            </h3>
                            <span className="text-[10px] md:text-xs text-slate-400 font-semibold">
                                {products.length} Produk Tersedia
                            </span>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-sm">
                                {localSearch
                                    ? `Produk dengan nama/kode "${localSearch}" tidak ditemukan.`
                                    : "Belum ada produk."}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p} cartQty={cart[p.id]?.quantity || 0} onAdd={handleAddToCart} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Desktop Sidebar Cart */}
                <div className="hidden lg:flex lg:flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:self-start lg:max-h-full">
                    {/* Cart Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-slate-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                ></path>
                            </svg>
                            <h3 className="text-base font-bold text-slate-900">
                                Keranjang Belanja
                            </h3>
                        </div>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                            >
                                Kosongkan
                            </button>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 min-h-0 max-h-[40vh] overflow-y-auto p-4 space-y-2">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-sm">
                                <svg
                                    className="w-12 h-12 text-slate-300 mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                    ></path>
                                </svg>
                                <span>
                                    Keranjang kosong.
                                    <br />
                                    Pilih produk di sebelah kiri.
                                </span>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-start gap-3 pb-2 border-b border-slate-100"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-slate-900 text-sm">
                                                {item.name}
                                            </h4>
                                            <span
                                                className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                    item.type === "kantin"
                                                        ? "bg-indigo-50 text-indigo-700"
                                                        : "bg-orange-50 text-orange-700"
                                                }`}
                                            >
                                                {item.type === "kantin"
                                                    ? "Kantin"
                                                    : "Siswa"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {formatRupiah(item.selling_price)} /
                                            pcs
                                        </p>

                                        {/* Qty Update Form */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                max={item.stock}
                                                onChange={(e) =>
                                                    handleUpdateQuantity(
                                                        item.id,
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 1,
                                                    )
                                                }
                                                className="w-16 h-6 text-center text-xs font-semibold border border-slate-200 rounded py-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="font-bold text-sm text-slate-950">
                                            {formatRupiah(
                                                item.selling_price *
                                                    item.quantity,
                                            )}
                                        </span>
                                        <div className="mt-1">
                                            <button
                                                onClick={() =>
                                                    handleRemoveFromCart(
                                                        item.id,
                                                    )
                                                }
                                                className="text-[10px] text-rose-500 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Checkout Section */}
                    {cartItems.length > 0 && (
                        <div className="bg-slate-50 border-t border-slate-100 p-6">
                            {/* Subtotal Row */}
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold text-slate-500">
                                    Total Belanja
                                </span>
                                <span className="text-xl font-extrabold text-slate-900">
                                    {formatRupiah(totalAmount)}
                                </span>
                            </div>

                            {/* Checkout Form */}
                            <form
                                onSubmit={handleCheckoutSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="desktop_paid_amount"
                                        className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                                    >
                                        Uang Bayar (Nominal)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
                                            Rp
                                        </span>
                                        <input
                                            type="text"
                                            name="paid_amount"
                                            id="desktop_paid_amount"
                                            required
                                            inputMode="numeric"
                                            readOnly={isTouchDevice} // Prevent native keyboard on touch devices only
                                            onClick={() => setActiveInput('paidAmount')}
                                            value={paidAmount || ""}
                                            onChange={(e) =>
                                                setPaidAmount(
                                                    parseInt(
                                                        e.target.value.replace(/\D/g, ""),
                                                    ) || 0,
                                                )
                                            }
                                            placeholder="Nominal bayar..."
                                            className="w-full pl-9 pr-24 py-2 text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPaidAmount(totalAmount)
                                            }
                                            className="absolute right-2 top-1.5 px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs rounded border border-primary-200"
                                        >
                                            Uang Pas
                                        </button>
                                    </div>

                                    {/* Denominations shortcuts */}
                                    <div className="grid grid-cols-6 gap-1.5 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setPaidAmount(0)}
                                            className="py-1.5 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold rounded-lg transition"
                                        >
                                            CC
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(1000)
                                            }
                                            className="py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg transition"
                                        >
                                            1k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(3000)
                                            }
                                            className="py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg transition"
                                        >
                                            3k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(5000)
                                            }
                                            className="py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg transition"
                                        >
                                            5k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(20000)
                                            }
                                            className="py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg transition"
                                        >
                                            20k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(50000)
                                            }
                                            className="py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg transition"
                                        >
                                            50k
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                adjustPaidAmount(500)
                                            }
                                            className="col-span-6 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold rounded-lg transition flex items-center justify-center gap-1"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5 text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                                />
                                            </svg>
                                            +500
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                adjustPaidAmount(-500)
                                            }
                                            className="col-span-6 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold rounded-lg transition flex items-center justify-center gap-1"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5 text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                />
                                            </svg>
                                            -500
                                        </button>
                                    </div>
                                </div>

                                {/* Change Calculation Row */}
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                    <span className="font-semibold text-slate-500">
                                        Uang Kembalian
                                    </span>
                                    <span className="font-extrabold text-primary-600">
                                        {paidAmount >= totalAmount
                                            ? formatRupiah(
                                                  paidAmount - totalAmount,
                                              )
                                            : "Rp0"}
                                    </span>
                                </div>

                                <TitipKembalian
                                    change={paidAmount >= totalAmount ? paidAmount - totalAmount : 0}
                                    titip={titipKembalian}
                                    setTitip={setTitipKembalian}
                                    name={customerName}
                                    setName={setCustomerName}
                                    customerClass={customerClass}
                                    setCustomerClass={setCustomerClass}
                                />

                                {/* Submit Button */}
                                <button
                                    id="desktop-checkout-btn"
                                    type="submit"
                                    disabled={
                                        paidAmount < totalAmount || !paidAmount
                                    }
                                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2"
                                >
                                    Checkout
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating bottom bar on mobile */}
            {cartItems.length > 0 && (
                <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-primary-600 text-white px-5 py-3.5 flex justify-between items-center shadow-2xl z-20 transition border-t border-primary-500">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-100">
                            Keranjang
                        </p>
                        <p className="text-sm font-extrabold">
                            {cartItems.length} Item &bull;{" "}
                            {formatRupiah(totalAmount)}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCartDrawer(true)}
                        className="px-4 py-2 bg-white text-primary-800 font-bold text-xs rounded-xl shadow-sm transition hover:bg-slate-100 flex items-center gap-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            ></path>
                        </svg>
                        Buka Keranjang
                    </button>
                </div>
            )}

            {/* Mobile Slide-Up Cart Drawer Sheet */}
            {showCartDrawer && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                        @keyframes slideUp {
                            from { transform: translateY(100%); }
                            to { transform: translateY(0); }
                        }
                        .animate-slide-up {
                            animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                    `,
                        }}
                    />

                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowCartDrawer(false)}
                    ></div>

                    <div className="fixed inset-x-0 bottom-0 h-[100dvh] bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up">
                        {/* Pill handle bar for native bottom sheet feel */}
                        <div className="w-12 h-1 bg-slate-300/80 rounded-full mx-auto mt-3 shrink-0"></div>

                        <div className="px-5 pb-4 pt-2 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-slate-700"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                    ></path>
                                </svg>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Keranjang Belanja ({cartItems.length})
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCartDrawer(false)}
                                className="text-slate-500 hover:text-slate-700 text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-lg active:bg-slate-200"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="font-extrabold text-slate-800 text-xs truncate max-w-[150px]">
                                                {item.name}
                                            </h4>
                                            <span
                                                className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide shrink-0 ${
                                                    item.type === "kantin"
                                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                                        : "bg-orange-50 text-orange-700 border border-orange-100"
                                                }`}
                                            >
                                                {item.type === "kantin"
                                                    ? "Kantin"
                                                    : "Siswa"}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {formatRupiah(item.selling_price)} /
                                            pcs
                                        </p>

                                        {/* Controls */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="w-7 h-7 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm active:bg-slate-100"
                                            >
                                                -
                                            </button>
                                            <span className="w-7 text-center text-xs font-extrabold text-slate-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="w-7 h-7 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm active:bg-slate-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between self-stretch py-0.5">
                                        <span className="font-extrabold text-xs text-slate-900">
                                            {formatRupiah(
                                                item.selling_price *
                                                    item.quantity,
                                            )}
                                        </span>

                                        <button
                                            onClick={() => {
                                                handleRemoveFromCart(item.id);
                                                if (cartItems.length <= 1)
                                                    setShowCartDrawer(false);
                                            }}
                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition active:scale-95 flex items-center justify-center border border-rose-100/50"
                                            title="Hapus"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 border-t border-slate-100 p-4 shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-slate-500">
                                    Total Belanja
                                </span>
                                <span className="text-base font-extrabold text-slate-900">
                                    {formatRupiah(totalAmount)}
                                </span>
                            </div>

                            <form
                                onSubmit={handleCheckoutSubmit}
                                className="space-y-3.5"
                            >
                                <div>
                                    <label
                                        htmlFor="mobile_paid_amount"
                                        className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                                    >
                                        Uang Bayar (Nominal)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">
                                            Rp
                                        </span>
                                        <input
                                            type="text"
                                            name="paid_amount"
                                            id="mobile_paid_amount"
                                            required
                                            inputMode="numeric"
                                            readOnly={isTouchDevice} // Prevent native keyboard on touch devices only
                                            onClick={(e) => {
                                                if (isTouchDevice) e.target.blur();
                                                setActiveInput('paidAmount');
                                            }}
                                            value={paidAmount || ""}
                                            onChange={(e) =>
                                                setPaidAmount(
                                                    parseInt(
                                                        e.target.value.replace(/\D/g, ""),
                                                    ) || 0,
                                                )
                                            }
                                            placeholder="Ketuk untuk Keyboard..."
                                            className="w-full pl-8 pr-16 py-2.5 text-xs font-extrabold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPaidAmount(totalAmount)
                                            }
                                            className="absolute right-2 top-1.5 px-2.5 py-1 bg-primary-50 border border-primary-200 text-primary-700 font-extrabold text-[10px] rounded-lg"
                                        >
                                            Pas
                                        </button>
                                    </div>

                                    {/* Quick Denominations Shortcuts on Mobile */}
                                    <div className="grid grid-cols-6 gap-1.5 mt-2.5">
                                        {/* Row 1 */}
                                        <button
                                            type="button"
                                            onClick={() => setPaidAmount(0)}
                                            className="py-1.5 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold rounded-lg transition"
                                        >
                                            CC
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(1000)
                                            }
                                            className="py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm active:bg-slate-100 transition"
                                        >
                                            1k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(3000)
                                            }
                                            className="py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm active:bg-slate-100 transition"
                                        >
                                            3k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(5000)
                                            }
                                            className="py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm active:bg-slate-100 transition"
                                        >
                                            5k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(20000)
                                            }
                                            className="py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm active:bg-slate-100 transition"
                                        >
                                            20k
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToPaidAmount(50000)
                                            }
                                            className="py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm active:bg-slate-100 transition"
                                        >
                                            50k
                                        </button>

                                        {/* Row 2 */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                adjustPaidAmount(500)
                                            }
                                            className="col-span-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-extrabold rounded-lg shadow-sm active:bg-slate-100 transition flex items-center justify-center gap-1"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5 text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                                />
                                            </svg>
                                            +500
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                adjustPaidAmount(-500)
                                            }
                                            className="col-span-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-700 font-extrabold rounded-lg shadow-sm active:bg-slate-100 transition flex items-center justify-center gap-1"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5 text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                />
                                            </svg>
                                            -500
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm">
                                    <span className="font-bold text-slate-500">
                                        Kembalian
                                    </span>
                                    <span className="font-extrabold text-primary-600">
                                        {paidAmount >= totalAmount
                                            ? formatRupiah(
                                                  paidAmount - totalAmount,
                                              )
                                            : "Rp0"}
                                    </span>
                                </div>

                                <TitipKembalian
                                    change={paidAmount >= totalAmount ? paidAmount - totalAmount : 0}
                                    titip={titipKembalian}
                                    setTitip={setTitipKembalian}
                                    name={customerName}
                                    setName={setCustomerName}
                                    customerClass={customerClass}
                                    setCustomerClass={setCustomerClass}
                                />

                                <button
                                    id="mobile-checkout-btn"
                                    type="submit"
                                    disabled={
                                        paidAmount < totalAmount || !paidAmount
                                    }
                                    className="w-full py-3 bg-primary-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-lg transition active:scale-[0.99]"
                                >
                                    Checkout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Keyboard Overlay */}
            {activeInput && (
                <CustomKeyboard
                    layout={activeInput === 'paidAmount' ? 'numeric' : 'default'}
                    inputValue={activeInput === 'search' ? localSearch : (paidAmount || "")}
                    prefixes={prefixes}
                    defaultMode={keyboardDefaultMode}
                    onChange={(val) => {
                        if (activeInput === 'search') {
                            setLocalSearch(val);
                        } else if (activeInput === 'paidAmount') {
                            setPaidAmount(parseInt(val) || 0);
                        }
                    }}
                    onClose={() => setTimeout(() => setActiveInput(null), 250)}
                    onSubmit={() => {
                        if (activeInput === 'search') {
                            handleSearchSubmit();
                            setTimeout(() => setActiveInput(null), 250);
                        } else if (activeInput === 'paidAmount') {
                            handleCheckoutSubmit();
                            setTimeout(() => setActiveInput(null), 250);
                        }
                    }}
                />
            )}
            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
