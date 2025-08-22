import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // increase limit to avoid warnings
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // all dependencies from node_modules go into a vendor chunk
            return 'vendor';
          }
          // optional: split large internal modules
          if (id.includes('src/components/HeavyComponent')) {
            return 'heavy';
          }
        },
      },
    },
  },
})
