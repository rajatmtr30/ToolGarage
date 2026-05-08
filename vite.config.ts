import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'crypto': path.resolve(__dirname, './src/lib/crypto-polyfill.ts'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@monaco-editor')) return 'monaco'
          if (id.includes('mermaid')) return 'mermaid'
          if (id.includes('crypto-js') || id.includes('node-forge') || id.includes('bcryptjs')) return 'crypto'
          if (id.includes('@faker-js/faker')) return 'faker'
        },
      },
    },
  },
})
