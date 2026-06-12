// Developer Credit: Reyhan Septianto Ramadhan
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
      include: [/src\/.*\.[jt]sx?$/],
      exclude: [/node_modules/]
    })
  ],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'animation-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
