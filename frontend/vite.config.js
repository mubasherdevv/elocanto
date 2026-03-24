import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    allowedHosts: ["6381-103-125-177-147.ngrok-free.app"],
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('tiptap') || id.includes('@tiptap')) return 'vendor-tiptap';
            if (id.includes('react-quill')) return 'vendor-quill';
            if (id.includes('@heroicons')) return 'vendor-heroicons';
            return 'vendor';
          }
        }
      }
    }
  }
})