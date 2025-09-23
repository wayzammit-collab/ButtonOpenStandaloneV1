// Ready to paste: Vite base must match the repo name exactly
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ButtonOpenStandaloneV1/' // <<< repo folder on GitHub Pages
})
