import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Note: base path removed for Vercel (defaults to '/')
  // For GitHub Pages builds, use: npm run build:ghpages
})
