import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, 
    // Required for HMR to work through the Codespace proxy
    hmr: {
      clientPort: 443,
    },
  },
})