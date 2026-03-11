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
}

