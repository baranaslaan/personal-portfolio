import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Source maps would leak readable source into the deployed bundle.
    // Vite's default is already false for production; keep it explicit so
    // an inadvertent flag or config change cannot enable them.
    sourcemap: false,
  },
})
