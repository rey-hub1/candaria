const fmt = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function formatRupiah(value) {
    return 'Rp' + fmt.format(value ?? 0);
}
