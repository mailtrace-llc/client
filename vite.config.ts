// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import svgLoader from 'vite-svg-loader'

export default defineConfig(({ mode }) => {
  // Load env vars for this mode (dev / prod)
  // Third arg '' means: include vars without the VITE_ prefix too
  const env = loadEnv(mode, process.cwd(), '')

  const FLASK = env.FLASK_URL || 'http://localhost:8001'

  return {
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    publicDir: 'public',
    server: {
      port: 5173,
      hmr: { overlay: true },
      cors: true,
      proxy: {
        '/api': {
          target: FLASK,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: FLASK,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: FLASK,
          changeOrigin: true,
          secure: false,
        },
        '/runs': {
          target: FLASK,
          changeOrigin: true,
          secure: false,
        },
        '/billing': {
          target: FLASK,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})