import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Bill-Splitter/',   // <-- add this line
  plugins: [react()],
})
