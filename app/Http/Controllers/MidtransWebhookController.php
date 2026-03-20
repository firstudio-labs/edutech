<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();
        $orderId = $request->input('order_id', '');
        $statusCode = $request->input('status_code', '');
        $grossAmount = $request->input('gross_amount', '');
        $signatureKey = $request->input('signature_key', '');
        
        $serverKey = config('services.midtrans.server_key');
        
        // Return 200 for missing payloads (e.g. empty pings)
        if (!$orderId || !$signatureKey) {
            return response()->json(['message' => 'Invalid or empty payload'], 200);
        }

        // Verify Signature
        $signature = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);
        if ($signature !== $signatureKey) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transaction = Transaction::where('transaction_code', $orderId)->first();
        if (!$transaction) {
            // Midtrans test webhook might use a dummy order_id
            return response()->json(['message' => 'Transaction not found, but ping received'], 200);
        }

        $transactionStatus = $request->input('transaction_status', '');
        $type = $request->input('payment_type', '');
        $fraud = $request->input('fraud_status', '');

        $status = null;
        if ($transactionStatus == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $status = 'pending';
                } else {
                    $status = 'success';
                }
            }
        } else if ($transactionStatus == 'settlement') {
            $status = 'success';
        } else if ($transactionStatus == 'pending') {
            $status = 'pending';
        } else if ($transactionStatus == 'deny') {
            $status = 'failed';
        } else if ($transactionStatus == 'expire') {
            $status = 'expired';
        } else if ($transactionStatus == 'cancel') {
            $status = 'failed';
        }

        if ($status) {
             \Illuminate\Support\Facades\DB::transaction(function () use ($transaction, $status, $type, $payload) {
                $oldStatus = $transaction->status;
                $transaction->update([
                    'status' => $status,
                    'paid_at' => ($status === 'success') ? now() : $transaction->paid_at,
                    'payment_type' => $type,
                    'payment_payload' => json_encode($payload),
                ]);

                if ($transaction->payment) {
                    $pStatus = ($status === 'success') ? 'verified' : (($status === 'failed' || $status === 'expired') ? 'rejected' : 'pending');
                    $transaction->payment->update(['status' => $pStatus]);
                }

                // Only perform success logic if transitioning to success for the first time
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

        return response()->json(['message' => 'OK']);
    }
}
