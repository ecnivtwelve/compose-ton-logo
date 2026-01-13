import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss(), svgr()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          second: resolve('src/renderer/second.html')
        }
      }
    }
  }
})
