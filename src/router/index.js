// import all view pages here
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
import FirebaseLoginView from "../views/FirebaseLoginView.vue"
import FirebaseRegisterView from "../views/FirebaseRegisterView.vue"
import WelcomeView from '../views/WelocmeView.vue'
import UpcomingEventsView from '../views/UpcomingEventsView.vue'
import RateEventView from '../views/RateEventView.vue'

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
        component: UpcomingEventsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/Rate',
        name: 'RateEventView',
        component: RateEventView,
        meta: { requiresAuth: true }
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
  const needAuth = to.meta?.requiresAuth
  const authed = !!getAuth().currentUser
  if (needAuth && !authed) {
    return { path: '/FireLogin', query: { redirect: to.fullPath } }
  }
})

export default router