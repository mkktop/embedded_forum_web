/**
 * Vite构建配置文件
 * 功能：配置Vue插件、路径别名、开发服务器、API代理
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Vite配置对象
 */
export default defineConfig({
  /**
   * 插件配置
   * vue: Vue 3单文件组件支持
   */
  plugins: [vue()],

  /**
   * 路径解析配置
   * @: src目录的别名，简化导入路径
   */
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  /**
   * 开发服务器配置
   */
  server: {
    /** 开发服务器端口 */
    port: 5173,
    /**
     * API代理配置
     * 将/api开头的请求代理到后端服务器，解决跨域问题
     */
    proxy: {
      '/api': {
        /** 后端API服务器地址 */
        target: 'http://39.105.129.96:3000',
        /** 修改请求来源，避免跨域 */
        changeOrigin: true
      }
    }
  }
})
