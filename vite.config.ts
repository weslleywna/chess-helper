import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serve o site em https://<usuario>.github.io/chess-helper/
  base: '/chess-helper/',
  plugins: [react()],
})
