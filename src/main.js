import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

import { initAuthWatcher } from './composables/authState'


const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')

//下面是引入的firebase设置代码
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEone1AYL6d2UARVw5QSmn--SdpEWFYbE",
  authDomain: "fit5032-a1-zetong.firebaseapp.com",
  projectId: "fit5032-a1-zetong",
  storageBucket: "fit5032-a1-zetong.firebasestorage.app",
  messagingSenderId: "911815638865",
  appId: "1:911815638865:web:85199cb5a81647dee09d70"
};

// 这里删除了多余的重复初始化代码
// Initialize Firebase
initializeApp(firebaseConfig);

// 感知是否登录状态
initAuthWatcher()

