import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'github' ? '/me' : '/',
  server: {
    host: true,
    port: 3000,
  },
}))