import { createApp } from 'vue'
import ElementPlus from 'element-plus' // 引入组件库
import 'element-plus/dist/index.css' // 引入样式文件
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus) // 安装插件
app.use(router) // 使用路由
app.mount('#app')