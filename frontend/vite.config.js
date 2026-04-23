import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  // Drop console/debugger statements in production builds (esbuild handles this)
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  },
  build: {
    // Use esbuild for minification (built into Vite, no extra dep needed)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react/jsx-runtime'],
          'react-router': ['react-router-dom'],
          'react-query': ['@tanstack/react-query'],
          'icons': ['lucide-react', 'react-icons'],
          'ui-libs': ['react-helmet-async', 'react-intersection-observer', 'react-scroll'],
          'image-libs': ['yet-another-react-lightbox'],
          'slider': ['swiper']
        },
        // Heroicons uses subpath imports (/24/outline) so Rollup auto-splits them
        // into tiny shared chunks named "ArrowLeftIcon-[hash].js" etc.
        // Force ONLY those pure-icon chunks into heroicons-[hash].js.
        // Do NOT rename component chunks that happen to import an icon.
        chunkFileNames: (chunkInfo) => {
          const ids = chunkInfo.moduleIds || [];
          const hasSrcComponent = ids.some(m => m.includes('/src/') && m.endsWith('.jsx'));
          const hasHeroicon = ids.some(m => m.includes('@heroicons'));
          // Pure heroicon chunk: has heroicon code but NO src/ React components
          if (hasHeroicon && !hasSrcComponent) {
            return 'assets/heroicons-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // Optimize for Google Images
    assetsInlineLimit: 0, // Don't inline images
    // Lower chunk size warning limit to identify bloat
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps only for debugging
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  // Ensure all public assets including videos are copied to dist
  publicDir: 'public',
  // Set base URL for production (adjust if your site is in a subdirectory)
  base: '/',
  server: {
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
