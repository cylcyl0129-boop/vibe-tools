import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // 加上這行對應你的 GitHub Repository 名稱與子路徑
    base: '/vibe-tools/SpiritualSeeds/',
    
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env
      // Do not modify, file watching is disabled to preve
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR === 'true' ? null : {
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});