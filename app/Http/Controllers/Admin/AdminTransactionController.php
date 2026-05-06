<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminTransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user', 'items.product', 'payment.paymentMethod'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/AdminTransactions', [
            'dbTransactions' => $transactions
        ]);
    }

    public function approve(Request $request, Transaction $transaction)
    {
        DB::transaction(function () use ($transaction) {
            $transaction->update([
                'status' => 'success',
                'paid_at' => now(),
            ]);

            if ($transaction->payment) {
                $transaction->payment->update(['status' => 'verified']);
            }

            // Sync user products
            foreach ($transaction->items as $item) {
                $transaction->user->products()->syncWithoutDetaching([
                    $item->product_id => ['purchased_at' => now()]
                ]);
                $item->product->increment('sold_count');
            }

            // Update user stats
            $user = $transaction->user;
            $user->increment('purchase_count', $transaction->items->count());
            $user->increment('total_spent', $transaction->total_amount);

            // ==========================================
            // SEND PURCHASE RECEIPT EMAIL
            // ==========================================
            try {
                $transaction->load(['items.product.category', 'payment.paymentMethod']);
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\PurchaseReceiptMail($transaction));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Purchase Receipt Email Error: ' . $e->getMessage());
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
        });

        return back()->with('success', 'Transaksi berhasil diverifikasi.');
    }

    public function reject(Request $request, Transaction $transaction)
    {
        DB::transaction(function () use ($transaction) {
            $transaction->update(['status' => 'failed']);
            if ($transaction->payment) {
                $transaction->payment->update(['status' => 'rejected']);
            }
        });

        return back()->with('success', 'Transaksi ditolak.');
    }

    public function exportCsv()
    {
        $transactions = Transaction::with(['user', 'items.product', 'payment.paymentMethod'])
            ->latest()
            ->get();

        $filename = "transactions-" . date('Y-m-d') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID Transaksi', 'Tanggal', 'Pelanggan', 'Email', 'Produk', 'Total', 'Status', 'Metode Pembayaran'];

        $callback = function() use($transactions, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($transactions as $t) {
                $row['ID'] = $t->transaction_code;
                $row['Tanggal'] = $t->created_at->format('Y-m-d H:i');
                $row['Pelanggan'] = $t->user->name ?? 'N/A';
                $row['Email'] = $t->user->email ?? 'N/A';
                $row['Produk'] = $t->items->map(fn($i) => $i->product->name)->join(', ');
                $row['Total'] = $t->total_amount;
                $row['Status'] = $t->status;
                $row['Metode'] = $t->payment->paymentMethod->bank_name ?? 'Gateway/Lainnya';

                fputcsv($file, array_values($row));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

