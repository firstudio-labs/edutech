<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Dynamically set Socialite Google config from database
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('site_contents')) {
                $settings = \App\Models\SiteContent::where('key', 'site_settings')->first();
                if ($settings) {
                    $json = json_decode($settings->value, true);
                    if (!empty($json['google_client_id'])) {
                        config(['services.google.client_id' => $json['google_client_id']]);
                    }
                    if (!empty($json['google_client_secret'])) {
                        config(['services.google.client_secret' => $json['google_client_secret']]);
                    }
                    if (!empty($json['google_redirect_url'])) {
                        config(['services.google.redirect' => $json['google_redirect_url']]);
                    }

                    if (!empty($json['midtrans_server_key'])) {
                        config(['services.midtrans.server_key' => $json['midtrans_server_key']]);
                    }
                    if (!empty($json['midtrans_client_key'])) {
                        config(['services.midtrans.client_key' => $json['midtrans_client_key']]);
                    }
                    if (isset($json['midtrans_is_production'])) {
                        config(['services.midtrans.is_production' => (bool)$json['midtrans_is_production']]);
                    }

                    // Pre-config Midtrans Library
                    \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
                    \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
                    \Midtrans\Config::$isSanitized = config('services.midtrans.is_sanitized');
                    \Midtrans\Config::$is3ds = config('services.midtrans.is_3ds');
                }
            }
        } catch (\Exception $e) {
            // Silently fail if DB not found/ready
        }
    }
}
