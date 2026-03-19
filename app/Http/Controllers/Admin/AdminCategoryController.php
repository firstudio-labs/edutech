<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index()
    {
        // Get all categories with product count
        $categories = Category::withCount('products')->latest()->get();
        return Inertia::render('Admin/AdminCategories', [
            'dbCategories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|string|max:255|unique:categories,slug',
            'label' => 'required|string|max:255',
            'imageFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('imageFile')) {
            $imagePath = $request->file('imageFile')->store('categories', 'public');
        }

        Category::create([
            'name' => $data['label'],
            'slug' => Str::slug($data['id']),
            'description' => 'Kategori ' . $data['label'],
            'image' => $imagePath,
            'is_active' => true,
        ]);

        return back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'label' => 'required|string|max:255',
            'imageFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $imagePath = $category->image;
        if ($request->hasFile('imageFile')) {
            $imagePath = $request->file('imageFile')->store('categories', 'public');
        }

        $category->update([
            'name' => $data['label'],
            'image' => $imagePath,
        ]);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return back()->withErrors(['message' => 'Kategori tidak bisa dihapus karena memiliki produk terkait.']);
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}

