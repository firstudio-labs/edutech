<?php

namespace App\Http\Controllers;

use App\Mail\PurchaseReceiptMail;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

                    // ==========================================
                    // SEND PURCHASE RECEIPT EMAIL
                    // ==========================================
                    try {
                        $transaction->load('items.product.category');
                        Mail::to($user->email)->send(new PurchaseReceiptMail($transaction));
                    } catch (\Exception $e) {
                        Log::error('Purchase Receipt Email Error: ' . $e->getMessage());
                    }
                    // ==========================================

                    // ==========================================
                    // META CONVERSIONS API (Server-Side Tracking)
                    // ==========================================
                    $settings = \App\Models\SiteContent::where('key', 'site_settings')->first();
                    $settingsData = $settings ? json_decode($settings->value, true) : [];
                    $pixelId = $settingsData['meta_pixel_id'] ?? null;
                    $accessToken = $settingsData['meta_access_token'] ?? null;

                    if ($pixelId && $accessToken) {
                        try {
                            $contents = [];
                            foreach ($transaction->items as $item) {
                                $contents[] = [
                                    'id' => (string) $item->product_id,
                                    'quantity' => 1,
                                    'item_price' => (float) $item->price
                                ];
                            }

                            \Illuminate\Support\Facades\Http::post("https://graph.facebook.com/v19.0/{$pixelId}/events", [
                                'data' => [
                                    [
                                        'event_name' => 'Purchase',
                                        'event_time' => time(),
                                        'action_source' => 'website',
                                        'user_data' => [
                                            'em' => hash('sha256', strtolower(trim($user->email))),
                                            'ph' => $user->phone ? hash('sha256', preg_replace('/[^0-9]/', '', $user->phone)) : null,
                                        ],
                                        'custom_data' => [
                                            'currency' => 'IDR',
                                            'value' => (float) $transaction->total_amount,
                                            'content_type' => 'product',
                                            'content_ids' => array_column($contents, 'id'),
                                            'contents' => $contents,
                                            'order_id' => $transaction->transaction_code,
                                        ],
                                    ]
                                ],
                                'access_token' => $accessToken
                            ]);
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('Meta CAPI Error: ' . $e->getMessage());
                        }
                    }
                    // ==========================================
                }
            });
        }

        return response()->json(['message' => 'OK']);
    }
}
