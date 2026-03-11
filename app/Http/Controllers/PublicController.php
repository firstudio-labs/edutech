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

        return Inertia::render('Guest/Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'products' => $featuredProducts,
            'categories' => $categories,
        ]);
    }

    public function products(Request $request)
    {
        $products = Product::with('category')->get();
        $categories = Category::all();

        return Inertia::render('Guest/Products', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function productDetail($slug)
    {
        // First try by slug, else fallback to id in case links use id
        $product = Product::with('category')->where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        
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
    public function productSales($slug)
    {
        $product = Product::with('category')->where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
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
