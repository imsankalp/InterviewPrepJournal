import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In CI (GitHub Actions), VITE_BASE_PATH is set to /repo-name/ by configure-pages.
// Locally, it falls back to '/' so `npm run dev` keeps working as normal.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
