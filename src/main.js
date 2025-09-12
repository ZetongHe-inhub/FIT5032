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

// init the auth state listener
initAuthWatcher()

app.mount('#app')

