import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  //Cria plugin de react. Adiciona suporte a JSX e Fast Refresh
  plugins: [react()],
  resolve: {
    alias: {
      //@ substitui o caminho relativo para src
      '@': path.resolve(__dirname, 'src'),
    },
  },
});