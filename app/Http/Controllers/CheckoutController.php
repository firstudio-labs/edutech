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
            // Proof is only required for manual bank transfers (status 1 means active, let's check PM)
            'proof' => 'required_if:is_manual,true|image|max:5120',
        ]);

        $pm = PaymentMethod::find($request->payment_method_id);
        $isManual = ($pm->account_number !== '-'); // My quick check for manual vs midtrans

        $user = $request->user();

        // Update user phone if empty
        if (empty($user->phone)) {
            $user->update(['phone' => $request->phone]);
        }

        $totalAmount = 0;
        $itemDetails = [];
        foreach ($request->cart as $item) {
            $totalAmount += $item['price'];
            $itemDetails[] = [
                'id' => $item['id'],
                'price' => $item['price'],
                'quantity' => 1,
                'name' => $item['name'] ?? 'Product Item'
            ];
        }

        $tax = round($totalAmount * 0.11);
        $grandTotal = $totalAmount + $tax;

        // Add tax as an item detail for Midtrans
        $itemDetails[] = [
            'id' => 'TAX',
            'price' => $tax,
            'quantity' => 1,
            'name' => 'PPN 11%'
        ];

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

        if ($isManual) {
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
            return back()->with('success', 'Pesanan berhasil dibuat, silakan tunggu konfirmasi admin!');
        } else {
            // Midtrans Automated Payment
            try {
                $params = [
                    'transaction_details' => [
                        'order_id' => $transaction->transaction_code,
                        'gross_amount' => (int)$grandTotal,
                    ],
                    'customer_details' => [
                        'first_name' => $user->name,
                        'email' => $user->email,
                        'phone' => $request->phone,
                    ],
                    'item_details' => $itemDetails,
                ];

                $snapToken = \Midtrans\Snap::getSnapToken($params);
                $transaction->update(['snap_token' => $snapToken]);

                return back()->with([
                    'success' => 'Silakan selesaikan pembayaran!',
                    'snap_token' => $snapToken,
                    'trx_code' => $transaction->transaction_code
                ]);

            } catch (\Exception $e) {
                return back()->with('error', 'Gagal terhubung ke gateway pembayaran: ' . $e->getMessage());
            }
        }
    }
}

