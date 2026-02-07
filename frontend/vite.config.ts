import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime.js'),
      'react': path.resolve('./node_modules/react'),
    },
  },
})
