import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/wallet': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/v1': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
