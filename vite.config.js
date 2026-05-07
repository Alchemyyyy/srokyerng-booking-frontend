import { fileURLToPath, URL } from 'node:url'

<<<<<<< HEAD
=======
import { defineConfig } from 'vite'
>>>>>>> dd0111d0a3585bf24b06bac92fb9730d5f59c6da
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
