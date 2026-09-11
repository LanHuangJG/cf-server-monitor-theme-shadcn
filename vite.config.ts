import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// 本地 dev 时把 API / WS 代理到真实的 CF-Server-Monitor，便于联调。
// 可用 VITE_API_TARGET 覆盖，例如 VITE_API_TARGET=http://127.0.0.1:8787 npm run dev
const API_TARGET = process.env.VITE_API_TARGET ?? 'https://status.ggaag.com'

const proxy = {
  '/api': { target: API_TARGET, changeOrigin: true, ws: true },
  '/flags': { target: API_TARGET, changeOrigin: true },
  '/os-icons': { target: API_TARGET, changeOrigin: true },
}

// CF-Server-Monitor 主题：产物必须是根目录 index.html + assets/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { proxy },
  preview: { proxy },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
