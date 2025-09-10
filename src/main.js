import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

// init Firebase（Auth + Firestore）
import './firebase/init'

import { initAuthWatcher } from './composables/authState'

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

// ② 感知是否登录（必须在 init 之后）
initAuthWatcher()

app.mount('#app')

