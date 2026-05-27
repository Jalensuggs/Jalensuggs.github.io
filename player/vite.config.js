import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// dev → base '/'（图片/音乐路径正常）
// build → base '/BLog/player/'（GitHub Pages 部署路径）
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/BLog/player/' : '/',
}))
