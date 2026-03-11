<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category')->latest()->get();
        return Inertia::render('Admin/AdminProducts', [
            'dbProducts' => $products,
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        return Inertia::render('Admin/AdminProductForm', [
            'dbCategories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'originalPrice' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'longDescription' => 'nullable|string',
            'badge' => 'nullable|string|max:255',
            'imageFile' => 'nullable|image|max:2048',
            'imageUrl' => 'nullable|string',
            'benefits' => 'nullable|array',
            'materials' => 'nullable|array',
            'startAt' => 'nullable|date',
            'endAt' => 'nullable|date|after_or_equal:startAt',
            'location' => 'nullable|string|max:255',
        ]);

        $imagePath = $data['imageUrl'];
        if ($request->hasFile('imageFile')) {
            $imagePath = $request->file('imageFile')->store('products', 'public');
        }

        Product::create([
            'name' => $data['title'],
            'category_id' => $data['category'],
            'price' => $data['price'],
            'normal_price' => $data['originalPrice'],
            'image' => $imagePath,
            'badge' => $data['badge'],
            'short_description' => $data['description'],
            'description' => $data['longDescription'],
            'benefits' => json_encode($data['benefits'] ?? []),
            'materials' => json_encode($data['materials'] ?? []),
            'start_at' => $data['startAt'] ?? null,
            'end_at' => $data['endAt'] ?? null,
            'location' => $data['location'] ?? null,
        ]);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product)
    {
        $categories = Category::all();
        return Inertia::render('Admin/AdminProductForm', [
            'product' => $product,
            'dbCategories' => $categories
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'originalPrice' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'longDescription' => 'nullable|string',
            'badge' => 'nullable|string|max:255',
            'imageFile' => 'nullable|image|max:2048',
            'imageUrl' => 'nullable|string',
            'benefits' => 'nullable|array',
            'materials' => 'nullable|array',
            'startAt' => 'nullable|date',
            'endAt' => 'nullable|date|after_or_equal:startAt',
            'location' => 'nullable|string|max:255',
        ]);

        $imagePath = $product->image;
        if ($request->hasFile('imageFile')) {
            $imagePath = $request->file('imageFile')->store('products', 'public');
        } elseif (!empty($data['imageUrl'])) {
            $imagePath = $data['imageUrl'];
        }

        $product->update([
            'name' => $data['title'],
            'category_id' => $data['category'],
            'price' => $data['price'],
            'normal_price' => $data['originalPrice'],
            'image' => $imagePath,
            'badge' => $data['badge'],
            'short_description' => $data['description'],
            'description' => $data['longDescription'],
            'benefits' => json_encode($data['benefits'] ?? []),
            'materials' => json_encode($data['materials'] ?? []),
            'start_at' => $data['startAt'] ?? null,
            'end_at' => $data['endAt'] ?? null,
            'location' => $data['location'] ?? null,
        ]);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        // Add check if transaction items depend on this, alternatively just delete
        $product->delete();
        return back()->with('success', 'Produk berhasil dihapus.');
    }
}

