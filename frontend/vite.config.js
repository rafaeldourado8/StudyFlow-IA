// frontend/vite.config.js - VERSÃO OTIMIZADA COM DOCKER
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Habilita Fast Refresh
      fastRefresh: true,
      // Otimiza imports do React
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  server: {
    host: true, // Necessário para Docker
    strictPort: true,
    port: 5173, // Mantém sua porta original
    watch: {
      usePolling: true, // Ajuda no Windows/WSL/Docker
    },
    hmr: {
      overlay: true
    }
  },
  build: {
    // Otimizações de build
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true
      }
    },
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'ui-vendor': ['lucide-react']
        }
      }
    },
    // Aumenta o limite de aviso de chunk
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    // Pre-bundling de dependências
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react']
  }
});