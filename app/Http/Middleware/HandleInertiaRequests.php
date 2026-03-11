<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $contentData = \App\Models\SiteContent::where('key', 'site_content')->first();
        $dbContent = $contentData ? json_decode($contentData->value, true) : null;

        $purchasedProductIds = [];
        if ($request->user()) {
            $purchasedProductIds = $request->user()->products()->pluck('products.id')->toArray();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'purchased_products' => $purchasedProductIds,
            ],
            'siteContent' => $dbContent,
        ];
    }
}
