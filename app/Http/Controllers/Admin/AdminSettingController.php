<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSettingController extends Controller
{
    // Settings for Credentials
    public function index()
    {
        $settingsData = SiteContent::where('key', 'site_settings')->first();
        return Inertia::render('Admin/AdminSettings', [
            'dbSettings' => $settingsData ? json_decode($settingsData->value, true) : null,
        ]);
    }

    public function saveSettings(Request $request)
    {
        $request->validate([
            'google_client_id' => 'nullable|string',
            'google_client_secret' => 'nullable|string',
            'google_redirect_url' => 'nullable|url',
            'midtrans_server_key' => 'nullable|string',
            'midtrans_client_key' => 'nullable|string',
            'midtrans_is_production' => 'nullable|boolean',
            'meta_pixel_id' => 'nullable|string',
            'meta_access_token' => 'nullable|string',
            'mail_mailer' => 'nullable|string',
            'mail_host' => 'nullable|string',
            'mail_port' => 'nullable|string',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'nullable|email',
            'mail_from_name' => 'nullable|string',
        ]);

        SiteContent::updateOrCreate(
            ['key' => 'site_settings'],
            ['value' => json_encode($request->all())]
        );

        return back()->with('success', 'Pengaturan kredensial berhasil disimpan!');
    }

    // Ads page
    public function ads()
    {
        $adsData = SiteContent::where('key', 'ads_promo')->first();
        $products = \App\Models\Product::select('id', 'name', 'price', 'normal_price', 'benefits')->get();
        return Inertia::render('Admin/AdminAds', [
            'dbAds' => $adsData ? $adsData->value : null,
            'products' => $products
        ]);
    }

    public function saveAds(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'videoUrl' => 'nullable|string',
            'ctaTitle' => 'nullable|string',
            'ctaSubtitle' => 'nullable|string',
            'benefits' => 'nullable|array',
            'selectedProductIds' => 'nullable|array'
        ]);

        SiteContent::updateOrCreate(
            ['key' => 'ads_promo'],
            ['value' => json_encode($request->all())]
        );

        return back()->with('success', 'Landing Page Ads berhasil dipublikasikan!');
    }

    // Content page
    public function content()
    {
        $contentData = SiteContent::where('key', 'site_content')->first();
        $categories = \App\Models\Category::withCount('products')->get();
        $featuredProducts = \App\Models\Product::with('category')->where('featured', true)->take(6)->get();
        $allProducts = \App\Models\Product::with('category')->get();
        
        return Inertia::render('Admin/AdminContent', [
            'dbContent' => $contentData ? $contentData->value : null,
            'dbCategories' => $categories,
            'dbFeaturedProducts' => $featuredProducts,
            'dbAllProducts' => $allProducts
        ]);
    }

    public function saveContent(Request $request)
    {
        $request->validate([
            'home' => 'required|array',
            'about' => 'required|array',
            'contact' => 'required|array',
            'social' => 'required|array',
            'branding' => 'required|array',
            'checkout' => 'required|array',
            'logoFile' => 'nullable|file|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'faviconFile' => 'nullable|file|mimes:png,jpg,jpeg,ico,svg|max:1024',
        ]);

        $branding = $request->input('branding');

        if ($request->hasFile('logoFile')) {
            $branding['logo'] = $request->file('logoFile')->store('branding', 'public');
        }
        
        if ($request->hasFile('faviconFile')) {
            $branding['favicon'] = $request->file('faviconFile')->store('branding', 'public');
        }

        $allContent = [
            'home' => $request->input('home'),
            'about' => $request->input('about'),
            'contact' => $request->input('contact'),
            'social' => $request->input('social'),
            'branding' => $branding,
            'checkout' => $request->input('checkout'),
        ];

        SiteContent::updateOrCreate(
            ['key' => 'site_content'],
            ['value' => json_encode($allContent)]
        );

        return back()->with('success', 'Konten berhasil disimpan dan dipublikasikan!');
    }

    // Chatbot page
    public function chatbot()
    {
        return Inertia::render('Admin/AdminChatbot');
    }
}
