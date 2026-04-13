<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPaymentController extends Controller
{
    public function index()
    {
        // Ensure all payment methods have slugs
        PaymentMethod::whereNull('slug')->orWhere('slug', '')->get()->each(function($pm) {
            $pm->slug = \Illuminate\Support\Str::slug($pm->bank_name) . '-' . uniqid();
            $pm->save();
        });

        $banks = PaymentMethod::orderBy('id')->get();

        return Inertia::render('Admin/AdminPayment', [
            'dbBanks' => $banks
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string',
            'account_holder' => 'required|string',
            'account_number' => 'required|string',
        ]);

        PaymentMethod::create([
            'bank_name' => $request->bank_name,
            'account_name' => $request->account_holder,
            'account_number' => $request->account_number,
            'status' => true,
        ]);

        return back()->with('success', 'Rekening baru berhasil ditambahkan.');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $request->validate([
            'bank_name' => 'required|string',
            'account_holder' => 'required|string',
            'account_number' => 'required|string',
        ]);

        $paymentMethod->update([
            'bank_name' => $request->bank_name,
            'account_name' => $request->account_holder,
            'account_number' => $request->account_number,
        ]);

        return back()->with('success', 'Informasi rekening berhasil diperbarui.');
    }

    public function toggle(PaymentMethod $paymentMethod)
    {
        $paymentMethod->update([
            'status' => !$paymentMethod->status
        ]);

        return back()->with('success', 'Status rekening berhasil diubah.');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();

        return back()->with('success', 'Rekening berhasil dihapus.');
    }
}

