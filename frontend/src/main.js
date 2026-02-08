import { createApp } from 'vue'
import { createPinia } from 'pinia' // <--- 1. 引入 Pinia
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia()) // <--- 2. 啟用 Pinia
app.use(router)

app.mount('#app')
