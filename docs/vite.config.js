import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __DEV__: 'true',
    __BROWSER__: 'true',
  },
  optimizeDeps: {
    exclude: ['@vueuse/shared', '@vueuse/core'],
  },
})
