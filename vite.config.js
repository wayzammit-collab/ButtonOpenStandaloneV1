// Vite config for GitHub Pages and local dev.
// Local dev uses base '/', Pages uses '/ButtonOpenStandaloneV1/'.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isPages = process.env.BUILD_FOR_PAGES === '1'
export default defineConfig({
  plugins: [react()],
  base: isPages ? '/ButtonOpenStandaloneV1/' : '/'
})
