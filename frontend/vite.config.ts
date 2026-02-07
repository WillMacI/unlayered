import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react': require.resolve('react'),
    },
  },
})
