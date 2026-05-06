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
        // Self-healing: Ensure Midtrans record exists if configured
        $settingsData = \App\Models\SiteContent::where('key', 'site_settings')->first();
        $siteSettings = $settingsData ? json_decode($settingsData->value, true) : [];
        $midtransClientKey = $siteSettings['midtrans_client_key'] ?? config('services.midtrans.client_key');

        if (!empty($midtransClientKey)) {
            \App\Models\PaymentMethod::updateOrCreate(
                ['account_number' => '-'],
                [
                    'bank_name' => 'Midtrans (Otomatis: QRIS, VA, Kartu)',
                    'account_name' => 'JAGGAD ACADEMY',
                    'status' => true,
                ]
            );
        }

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
            'proof' => 'nullable|mimes:jpg,jpeg,png,pdf|max:5120',
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

        $grandTotal = $totalAmount;

        $transaction = null;
        if ($request->filled('active_trx')) {
            $transaction = Transaction::where('transaction_code', $request->active_trx)
                                      ->where('user_id', $user->id)
                                      ->where('status', 'pending')
                                      ->first();
        }

        if ($transaction) {
            $transaction->update(['total_amount' => $grandTotal]);
            $transaction->items()->delete();
            if ($transaction->payment) {
                $transaction->payment()->delete();
            }
        } else {
            $transaction = Transaction::create([
                'transaction_code' => 'TRX-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'total_amount' => $grandTotal,
                'status' => 'pending',
            ]);
        }

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
            return back()->with([
                'success' => 'Pesanan berhasil dibuat, silakan tunggu konfirmasi admin!',
                'trx_code' => $transaction->transaction_code
            ]);
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
                    'callbacks' => [
                        'finish'   => url('/dashboard'),
                        'unfinish' => url('/dashboard'),
                        'error'    => url('/checkout'),
                    ],
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

    public function verify(Request $request, Transaction $transaction)
    {
        // For security, only the owner can verify or admin
        if ($request->user()->id !== $transaction->user_id && $request->user()->role !== 'admin') {
            abort(403);
        }

        try {
            $status = \Midtrans\Transaction::status($transaction->transaction_code);
            
            // Handle both object and array response
            $trStatus = is_object($status) ? $status->transaction_status : $status['transaction_status'];
            $type = is_object($status) ? $status->payment_type : $status['payment_type'];

            if ($trStatus == 'settlement' || $trStatus == 'capture') {
                $this->finalizeTransaction($transaction, 'success', $type, json_encode($status));
                return back()->with('success', 'Pembayaran berhasil dikonfirmasi secara otomatis!');
            }

            return back()->with('info', 'Status pembayaran saat ini: ' . $trStatus);

        } catch (\Exception $e) {
            return back()->with('error', 'Gagal verifikasi: ' . $e->getMessage());
        }
    }

    private function finalizeTransaction($transaction, $status, $type = null, $payload = null)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($transaction, $status, $type, $payload) {
            $oldStatus = $transaction->status;
            
            $updateData = ['status' => $status];
            if ($status === 'success') {
                $updateData['paid_at'] = now();
            }
            if ($type) $updateData['payment_type'] = $type;
            if ($payload) $updateData['payment_payload'] = $payload;

            $transaction->update($updateData);

            if ($status === 'success' && $oldStatus !== 'success') {
                foreach ($transaction->items as $item) {
                    $transaction->user->products()->syncWithoutDetaching([
                        $item->product_id => ['purchased_at' => now()]
                    ]);
                    if ($item->product) {
                        $item->product->increment('sold_count');
                    }
                }

                $user = $transaction->user;
                $user->increment('purchase_count', $transaction->items->count());
                $user->increment('total_spent', $transaction->total_amount);
            }
        });
    }
}

