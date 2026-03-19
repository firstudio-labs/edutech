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
        $orderId = $payload['order_id'];
        $statusCode = $payload['status_code'];
        $grossAmount = $payload['gross_amount'];
        $serverKey = config('services.midtrans.server_key');
        
        // Verify Signature
        $signature = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);
        if ($signature !== $payload['signature_key']) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transaction = Transaction::where('transaction_code', $orderId)->first();
        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transactionStatus = $payload['transaction_status'];
        $type = $payload['payment_type'];
        $fraud = $payload['fraud_status'] ?? '';

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
