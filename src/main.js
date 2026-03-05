/**
 * 应用入口文件
 * 功能：创建Vue应用实例，注册插件和全局组件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

/**
 * 创建Vue应用实例
 */
const app = createApp(App)

/**
 * 全局注册Element Plus图标组件
 * 使用方式：<el-icon><User /></el-icon>
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/**
 * 注册Pinia状态管理
 */
app.use(createPinia())

/**
 * 注册Vue Router路由
 */
app.use(router)

/**
 * 注册Element Plus UI组件库
 */
app.use(ElementPlus)

/**
 * 挂载应用到DOM
 */
app.mount('#app')
