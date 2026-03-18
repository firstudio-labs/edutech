<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

class PublicController extends Controller
{
    public function home()
    {
        $featuredProducts = Product::with('category')
            ->where('featured', true)
            ->latest()
            ->take(6)
            ->get();

        $categories = Category::withCount('products')->get();
        
        $stats = [
            'users' => \App\Models\User::where('role', 'user')->count(),
            'products' => Product::count(),
            'sales' => \App\Models\Transaction::where('status', 'success')->count(),
        ];

        return Inertia::render('Guest/Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'products' => $featuredProducts,
            'categories' => $categories,
            'dbStats' => $stats,
        ]);
    }

    public function products(Request $request)
    {
        $products = Product::with('category')->latest()->get();
        $categories = Category::all();

        return Inertia::render('Guest/Products', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function productDetail(Product $product)
    {
        $product->load('category');
        
        // Similar products
        $similarProducts = Product::with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(3)
            ->get();

        return Inertia::render('Guest/ProductDetail', [
            'product' => $product,
            'similarProducts' => $similarProducts
        ]);
    }
    public function productSales(Product $product)
    {
        $product->load('category');
        return Inertia::render('Guest/ProductSales', [
            'product' => $product
        ]);
    }

    public function promo()
    {
        $adsData = \App\Models\SiteContent::where('key', 'ads_promo')->first();
        return Inertia::render('Guest/Ads', [
            'dbAds' => $adsData ? $adsData->value : null,
            'dbProducts' => \App\Models\Product::all()
        ]);
    }
}
