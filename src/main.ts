import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
import  '@/assets/main.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import { useThemeStore } from '@/stores/theme.ts'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

const themeStore = useThemeStore()

// Регистрация иконок
document.documentElement.classList.toggle('dark', themeStore.isDark)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
