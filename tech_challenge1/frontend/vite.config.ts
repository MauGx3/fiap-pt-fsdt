import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
    },
    preview: {
        host: '0.0.0.0',
        port: 8080,
        strictPort: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/tests/setup.ts',
        css: true,
        mockReset: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html']
        }
    },
})
