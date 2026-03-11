import '../css/app.css';
import './Styles/Global.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './Contexts/CartContext';
import { ContentProvider } from './Contexts/ContentContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

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

