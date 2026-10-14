import { env } from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: env.NETLIFY === 'true' ? '/' : '/PNGRFL_Web_Applications/',
  plugins: [react()],
})
