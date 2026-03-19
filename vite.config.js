import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import fg from 'fast-glob';

const pageFiles = fg.sync('resources/js/Pages/**/*.jsx');

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
                ...pageFiles,
            ],
            refresh: true,
        }),
        react(),
    ],
});