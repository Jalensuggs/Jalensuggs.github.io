import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// dev → base '/'
// build → base './'（相对路径，直接 file:// 打开也能用）
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? './' : '/',
}))
