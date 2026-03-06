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
        sourcemap: false,
    },
    test: {
        // Vitest config lives here alongside Vite config
        environment: 'jsdom',          // simulate a browser DOM
        globals: true,                 // vi, describe, it, expect available without importing
        setupFiles: './src/test-setup.js',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.{js,jsx}'],
            exclude: ['src/main.jsx', 'src/**/__tests__/**'],
        },
    },
});