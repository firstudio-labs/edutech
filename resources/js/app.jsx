import '../css/app.css';
import './Styles/Global.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './Contexts/CartContext';
import { ContentProvider } from './Contexts/ContentContext';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Meta Pixel: inject base code and track PageView on every navigation
function initMetaPixel(pixelId) {
    if (!pixelId || window._fbPixelInitialized) return;
    window._fbPixelInitialized = true;

    (function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = [];
        t = b.createElement(e); t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    // Track PageView on every Inertia navigation
    router.on('finish', () => {
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize Meta Pixel from shared props
        const pixelId = props.initialPage.props.meta_pixel_id;
        if (pixelId) initMetaPixel(pixelId);

        root.render(
            <ContentProvider initialData={props.initialPage.props.siteContent}>
                <CartProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: { background: '#0f0f1a', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '14px' },
                            success: { iconTheme: { primary: '#10b981', secondary: '#0f0f1a' } },
                            error: { iconTheme: { primary: '#ef4444', secondary: '#0f0f1a' } },
                        }}
                    />
                    <App {...props} />
                </CartProvider>
            </ContentProvider>
        );
    },
    progress: {
        color: '#dc2626',
    },
});

