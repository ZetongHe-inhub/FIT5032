// import all view pages here
import { createRouter, createWebHistory } from 'vue-router'
import FirebaseLoginView from "../views/FirebaseLoginView.vue"
import FirebaseRegisterView from "../views/FirebaseRegisterView.vue"
import WelcomeView from '../views/WelocmeView.vue'
import UpcomingEventsView from '../views/UpcomingEventsView.vue'

// define the routes
const routes = [
    {
        path: '/',
        name: 'WelcomeView',
        component: WelcomeView
    },
    {
        path: '/FireRegister',
        name: 'FirebaseRegisterView',
        component: FirebaseRegisterView
    },
    {
        path: '/FireLogin',
        name: 'FirebaseSigninView',
        component: FirebaseLoginView
    },
    {
        path: '/UpcomingEvents',
        name: 'UpcomingEventsView',
        component: UpcomingEventsView
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router