// Local-first config. Uses "/" in dev. Only applies a GitHub Pages base
// if BUILD_FOR_PAGES is set (e.g., BUILD_FOR_PAGES=1 npm run build).
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const pagesBase = env.BUILD_FOR_PAGES ? '/ButtonOpenStandaloneV1/' : '/'
  return {
    plugins: [react()],
    base: pagesBase
  }
})
