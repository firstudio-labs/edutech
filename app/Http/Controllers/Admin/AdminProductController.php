<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        // Ensure all products have slugs
        Product::whereNull('slug')->orWhere('slug', '')->get()->each(function($p) {
            $p->slug = \Illuminate\Support\Str::slug($p->name) . '-' . uniqid();
            $p->save();
        });

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
            'imageFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'imageUrl' => 'nullable|string',
            'benefits' => 'nullable|array',
            'materials' => 'nullable|array',
            'startAt' => 'nullable|date',
            'endAt' => 'nullable|date|after_or_equal:startAt',
            'location' => 'nullable|string|max:255',
            'landingBlocks' => 'nullable|string',
            'landingBlockImages.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $imagePath = $data['imageUrl'];
        if ($request->hasFile('imageFile')) {
            $imagePath = $this->saveImageAsWebp($request->file('imageFile'), 'products');
        }

        // Handle landing block images
        $landingBlocks = [];
        if ($request->filled('landingBlocks')) {
            $landingBlocks = json_decode($request->landingBlocks, true) ?: [];
        }
        // Upload new images from block files
        if ($request->hasFile('landingBlockImages')) {
            foreach ($request->file('landingBlockImages') as $key => $file) {
                $path = $this->saveImageAsWebp($file, 'landing');
                // key format: "blockIdx_imageIdx" or "blockIdx"
                [$blockIdx] = array_pad(explode('_', $key), 2, null);
                if (isset($landingBlocks[$blockIdx])) {
                    if ($landingBlocks[$blockIdx]['type'] === 'image') {
                        $landingBlocks[$blockIdx]['url'] = $path;
                    } elseif ($landingBlocks[$blockIdx]['type'] === 'slider') {
                        $imageIdx = explode('_', $key)[1] ?? 0;
                        $landingBlocks[$blockIdx]['images'][$imageIdx] = $path;
                    }
                }
            }
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
            'landing_blocks' => $landingBlocks,
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
            'imageFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'imageUrl' => 'nullable|string',
            'benefits' => 'nullable|array',
            'materials' => 'nullable|array',
            'startAt' => 'nullable|date',
            'endAt' => 'nullable|date|after_or_equal:startAt',
            'location' => 'nullable|string|max:255',
            'landingBlocks' => 'nullable|string',
            'landingBlockImages.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $imagePath = $product->image;
        if ($request->hasFile('imageFile')) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $imagePath = $this->saveImageAsWebp($request->file('imageFile'), 'products');
        } elseif (!empty($data['imageUrl'])) {
            $imagePath = $data['imageUrl'];
        }

        // Handle landing block images
        $landingBlocks = $product->landing_blocks ?: [];
        if ($request->filled('landingBlocks')) {
            $landingBlocks = json_decode($request->landingBlocks, true) ?: [];
        }
        if ($request->hasFile('landingBlockImages')) {
            foreach ($request->file('landingBlockImages') as $key => $file) {
                $path = $this->saveImageAsWebp($file, 'landing');
                [$blockIdx] = array_pad(explode('_', $key), 2, null);
                if (isset($landingBlocks[$blockIdx])) {
                    if ($landingBlocks[$blockIdx]['type'] === 'image') {
                        $landingBlocks[$blockIdx]['url'] = $path;
                    } elseif ($landingBlocks[$blockIdx]['type'] === 'slider') {
                        $imageIdx = explode('_', $key)[1] ?? 0;
                        $landingBlocks[$blockIdx]['images'][$imageIdx] = $path;
                    }
                }
            }
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
            'landing_blocks' => $landingBlocks,
        ]);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        // Delete thumbnail
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        // Delete landing block images
        $blocks = is_array($product->landing_blocks) ? $product->landing_blocks : json_decode($product->landing_blocks, true) ?? [];
        foreach ($blocks as $b) {
            if ($b['type'] === 'image' && !empty($b['url']) && !str_starts_with($b['url'], 'http')) {
                if (Storage::disk('public')->exists($b['url'])) Storage::disk('public')->delete($b['url']);
            }
            if ($b['type'] === 'slider' && !empty($b['images'])) {
                foreach ($b['images'] as $img) {
                    if (!str_starts_with($img, 'http') && Storage::disk('public')->exists($img)) {
                        Storage::disk('public')->delete($img);
                    }
                }
            }
        }

        $product->delete();
        return back()->with('success', 'Produk berhasil dihapus.');
    }

    public function updateLandingBlocks(Request $request, Product $product)
    {
        $request->validate([
            'landingBlocks' => 'nullable|string',
            'landingBlockImages.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'landingFaq' => 'nullable|string',
            'countdownHours' => 'nullable|integer|min:0',
            'landingQuotaText' => 'nullable|string|max:255',
        ]);

        $landingBlocks = $product->landing_blocks ?: [];
        if ($request->filled('landingBlocks')) {
            $landingBlocks = json_decode($request->landingBlocks, true) ?: [];
        }

        if ($request->hasFile('landingBlockImages')) {
            foreach ($request->file('landingBlockImages') as $key => $file) {
                $path = $this->saveImageAsWebp($file, 'landing');
                // key format: "blockIdx_imageIdx" or "blockIdx"
                $parts = explode('_', $key);
                $blockIdx = $parts[0] ?? null;
                if ($blockIdx !== null && isset($landingBlocks[$blockIdx])) {
                    if ($landingBlocks[$blockIdx]['type'] === 'image') {
                        $landingBlocks[$blockIdx]['url'] = $path;
                    } elseif ($landingBlocks[$blockIdx]['type'] === 'slider') {
                        $imageIdx = $parts[1] ?? 0;
                        $landingBlocks[$blockIdx]['images'][$imageIdx] = $path;
                    }
                }
            }
        }

        $landingFaq = $product->landing_faq ?: [];
        if ($request->has('landingFaq')) {
            $landingFaq = json_decode($request->landingFaq, true) ?: [];
        }

        $oldBlocks = is_array($product->landing_blocks) ? $product->landing_blocks : json_decode($product->landing_blocks, true) ?? [];
        $oldImages = [];
        foreach ($oldBlocks as $b) {
            if (($b['type'] ?? '') === 'image' && !empty($b['url']) && !str_starts_with($b['url'], 'http')) {
                $oldImages[] = $b['url'];
            }
            if (($b['type'] ?? '') === 'slider' && !empty($b['images'])) {
                foreach ($b['images'] as $img) {
                    if (!str_starts_with($img, 'http')) $oldImages[] = $img;
                }
            }
        }

        $product->update([
            'landing_blocks' => $landingBlocks,
            'landing_faq' => $landingFaq,
            'countdown_hours' => $request->has('countdownHours') ? $request->countdownHours : $product->countdown_hours,
            'landing_quota_text' => $request->has('landingQuotaText') ? $request->landingQuotaText : $product->landing_quota_text,
        ]);

        $newImages = [];
        foreach ($landingBlocks as $b) {
            if (($b['type'] ?? '') === 'image' && !empty($b['url']) && !str_starts_with($b['url'], 'http')) {
                $newImages[] = $b['url'];
            }
            if (($b['type'] ?? '') === 'slider' && !empty($b['images'])) {
                foreach ($b['images'] as $img) {
                    if (!str_starts_with($img, 'http')) $newImages[] = $img;
                }
            }
        }

        $orphanedImages = array_diff($oldImages, $newImages);
        foreach ($orphanedImages as $img) {
            if (Storage::disk('public')->exists($img)) {
                Storage::disk('public')->delete($img);
            }
        }

        return back()->with('success', 'Landing page blocks updated successfully.');
    }

    private function saveImageAsWebp($file, $directory)
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file->getRealPath());
        $encoded = $image->encode(new WebpEncoder(80));
        $filename = uniqid() . '.webp';
        $path = "{$directory}/{$filename}";
        Storage::disk('public')->put($path, (string) $encoded);
        return $path;
    }
}

