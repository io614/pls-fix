import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://io614.github.io/pls-fix/
  base: '/pls-fix/',
  plugins: [react()],
})
