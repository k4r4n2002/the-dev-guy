import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // Proxy API calls to backend in development (avoids CORS issues in dev)
        proxy: {
            '/api': {
                target: process.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false, // disable in production for smaller bundle
    },
});
