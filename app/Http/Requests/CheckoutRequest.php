<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route is already gated by the role:admin,cashier middleware.
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'paid_amount' => 'required|numeric|min:0',
            'change_debt' => 'nullable|numeric|min:0',
            'customer_name' => 'nullable|string|max:100',
            'customer_class' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang belanja masih kosong.',
            'items.*.id.exists' => 'Produk tidak ditemukan.',
            'items.*.quantity.min' => 'Jumlah produk minimal 1.',
            'paid_amount.required' => 'Jumlah uang bayar wajib diisi.',
        ];
    }
}
