import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime'],
    },
    server: {
        host: '::',
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});
