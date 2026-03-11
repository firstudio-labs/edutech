<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function index()
    {
        $paymentMethods = PaymentMethod::where('status', 1)->get();
        return Inertia::render('Guest/Checkout', [
            'dbPaymentMethods' => $paymentMethods,
        ]);
    }

    public function process(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'cart' => 'required|array',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.price' => 'required|numeric',
            'proof' => 'required|image|max:5120',
        ]);

        $user = $request->user();

        // Update user phone if empty
        if (empty($user->phone)) {
            $user->update(['phone' => $request->phone]);
        }

        $totalAmount = 0;
        foreach ($request->cart as $item) {
            $totalAmount += $item['price'];
        }

        $tax = round($totalAmount * 0.11);
        $grandTotal = $totalAmount + $tax;

        $transaction = Transaction::create([
            'transaction_code' => 'TRX-' . strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'total_amount' => $grandTotal,
            'status' => 'pending',
        ]);

        foreach ($request->cart as $item) {
            TransactionItem::create([
                'transaction_id' => $transaction->id,
                'product_id' => $item['id'],
                'price' => $item['price'],
            ]);
        }

        if ($request->hasFile('proof')) {
            $path = $request->file('proof')->store('payments', 'public');

            Payment::create([
                'transaction_id' => $transaction->id,
                'payment_method_id' => $request->payment_method_id,
                'amount' => $grandTotal,
                'proof_image' => $path,
                'status' => 'pending',
            ]);
        }

        // Return a successful response so frontend can redirect/show success step
        return back()->with('success', 'Pesanan berhasil dibuat!');
    }
}

