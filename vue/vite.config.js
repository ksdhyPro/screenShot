import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base:'./',
  server:{
    port:8888
  },
  build:{
    outDir:'G:\\electron\\view',
    emptyOutDir:true,
    sourcemap:true
  }
})
