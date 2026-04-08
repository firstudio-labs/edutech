<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $siteContent = \App\Models\SiteContent::where('key', 'site_content')->first();
            $branding = $siteContent ? (json_decode($siteContent->value, true)['branding'] ?? []) : [];
            $siteTitle = ($branding['siteName'] ?? config('app.name', 'Laravel')) . ' ' . ($branding['siteTagline'] ?? '');
            
            $brandingFavicon = $branding['favicon'] ?? null;
            if ($brandingFavicon) {
                $favicon = str_starts_with($brandingFavicon, 'http') ? $brandingFavicon : asset('storage/' . $brandingFavicon);
            } else {
                $favicon = asset('favicon.ico');
            }
        @endphp

        <title inertia>{{ $siteTitle }}</title>
        <link rel="icon" type="image/x-icon" href="{{ $favicon }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>