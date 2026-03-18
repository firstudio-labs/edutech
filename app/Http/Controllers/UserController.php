<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        $purchasedProducts = $user->products()->with('category')->get();
        // Load recent transactions
        $transactions = $user->transactions()
            ->with(['items.product', 'payment'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('User/UserDashboard', [
            'purchasedProducts' => $purchasedProducts,
            'transactions' => $transactions,
        ]);
    }

    public function learning(Request $request, \App\Models\Product $product)
    {
        $user = $request->user();
        
        // Ensure user owns this product
        if (!$user->products()->where('products.id', $product->id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke produk ini.');
        }

        $product->load('category');

        return Inertia::render('User/UserLearning', [
            'product' => $product
        ]);
    }
}
