import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      'process.env': env
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-mui': ['@mui/material'],
            'vendor-charts': ['recharts'],
            'vendor-doc': ['jspdf', 'jspdf-autotable', 'xlsx', 'file-saver'],
            'vendor-editor': ['jodit-react'],
            'vendor-ui': ['lucide-react', 'react-icons', 'react-hot-toast', 'react-toastify', 'sweetalert2', 'notistack'],
          }
        }
      }
    }
  }
})