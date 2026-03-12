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

