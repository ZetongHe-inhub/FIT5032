import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import FirebaseLoginView from '../views/FirebaseLoginView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import WelcomeView from '../views/WelocmeView.vue'
import UpcomingEventsView from '../views/UpcomingEventsView.vue'
import RateEventView from '../views/RateEventView.vue'
import EventReviewsView from '../views/EventReviewsView.vue'
import EventReviewsDetailsView from '../views/EventReviewsDetailsView.vue'
import MapView from '../views/MapView.vue'
import AdminWelcomeView from '../views/AdminWelcomeView.vue'
import AdminEmailView from '../views/AdminEmailView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import AdminUserView from '../views/AdminUserView.vue'

function isAdmin(user) {
  return user?.email?.toLowerCase() === 'admin@gmail.com'
}

function waitForAuthReady() {
  const auth = getAuth()
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  return new Promise(resolve => {
    const stop = onAuthStateChanged(auth, () => {
      stop()
      resolve(auth.currentUser)
    })
  })
}

const routes = [
  { path: '/', 
    name: 'WelcomeView', 
    component: WelcomeView 
  },
  { path: '/FireRegister', 
    name: 'FirebaseRegisterView', 
    component: FirebaseRegisterView 
  },
  { path: '/FireLogin', 
    name: 'FirebaseSigninView', 
    component: FirebaseLoginView 
  },
  { path: '/UpcomingEvents', 
    name: 'UpcomingEventsView', 
    component: UpcomingEventsView, 
    meta: { requiresAuth: true } 
  },
  { path: '/Map', 
    name: 'MapView', 
    component: MapView, 
    meta: { requiresAuth: true } 
  },
  { path: '/Rate', 
    name: 'RateEventView', 
    component: RateEventView, 
    meta: { requiresAuth: true } 
  },
  { path: '/reviews', 
    name: 'EventReviewsView', 
    component: EventReviewsView, 
    meta: { requiresAuth: true } 
  },
  {
    path: '/events/:eventId/reviews',
    name: 'EventReviewsDetailsView',
    component: EventReviewsDetailsView,
    meta: { requiresAuth: true }
  }, 
  { path: '/aboutus', 
    name: 'AboutUsView', 
    component: AboutUsView,
    meta: { requiresAuth: true }
  },
  // admin only
  { path: '/admin', 
    name: 'AdminHome', 
    component: AdminWelcomeView, 
    meta: { requiresAdmin: true } 
  },
  {
    path: '/admin/events',
    name: 'AdminEmail',
    component: AdminEmailView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/account',
    name: 'AdminAccount',
    component: AdminUserView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//router guard
router.beforeEach(async (to, from, next) => {
  const user = (getAuth().currentUser) || (await waitForAuthReady())

  if (to.meta?.requiresAuth && !user) {
    return next({ path: '/FireLogin', query: { redirect: to.fullPath } })
  } //if not logged in, redirect to login

  if (to.meta?.requiresAdmin) {
    if (user && isAdmin(user)) return next()
    return next('/') // if not admin, redirect to home
  }

  return next()
})

export default router
