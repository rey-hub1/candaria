const STORAGE_KEY = 'candaria_marketplace_cart';

export function getCart() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

export function saveCart(cart) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function clearCart() {
    window.localStorage.removeItem(STORAGE_KEY);
}

export function cartItemKey(menuItemId, optionIds, notes) {
    return [menuItemId, [...optionIds].sort((a, b) => a - b).join('-'), notes || ''].join('|');
}

export function cartTotal(cart) {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.subtotal, 0);
}
