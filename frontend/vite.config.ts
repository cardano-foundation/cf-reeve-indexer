/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    define: {
      'import.meta.env.VITE_VERSION': JSON.stringify(env.VITE_VERSION),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL),
      'import.meta.env.VITE_KEYCLOAK_URL': JSON.stringify(env.VITE_KEYCLOAK_URL),
      'import.meta.env.VITE_KEYCLOAK_REALM': JSON.stringify(env.VITE_KEYCLOAK_REALM),
      'import.meta.env.VITE_KEYCLOAK_CLIENT_ID': JSON.stringify(env.VITE_KEYCLOAK_CLIENT_ID),
      'import.meta.env.VITE_KEYCLOAK_REDIRECT_URL': JSON.stringify(env.VITE_KEYCLOAK_REDIRECT_URL)
    },
    plugins: [react(), tsconfigPaths()],
    server: {
      allowedHosts: ['localhost', '.reeve.cf-deployments.org'],
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx']
    }
  }
})
