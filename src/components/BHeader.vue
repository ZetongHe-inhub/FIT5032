<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">Fit&Fix</router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="navMain" class="collapse navbar-collapse">
        <!-- left side part : main nav bar -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- Visitor state：only Welcome page（for now） -->
          <li class="nav-item" v-if="!isAuthed"><router-link class="nav-link" to="/">Welcome</router-link></li>

          <!-- Login state： full access to web functions -->
          <li class="nav-item" v-if="isAuthed"><router-link class="nav-link" to="/UpcomingEvents">Upcoming Events</router-link></li>
        
          <li class="nav-item" v-if="isAuthed"><router-link class="nav-link" to="/rate">Make a Rating</router-link></li>

          <li class="nav-item" v-if="isAuthed"><router-link class="nav-link" to="/reviews">Events Review</router-link></li>
        </ul>

        <!-- right side part：welcome text + Logout / or Login/register button -->
        <div class="d-flex align-items-center gap-2">
          <template v-if="isAuthed">
            <span class="text-muted small">Welcome, {{ displayName }}</span>
            <button class="btn btn-outline-secondary btn-sm" @click="doLogout">Logout</button>
          </template>
          <template v-else>
            <router-link class="btn btn-outline-primary btn-sm" to="/FireLogin">Login</router-link>
            <router-link class="btn btn-primary btn-sm" to="/FireRegister">Register</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState, logout } from '@/composables/authState'

const router = useRouter()
const auth = useAuthState()

const isAuthed = computed(() => !!auth.user)
const displayName = computed(() => auth.user?.displayName || auth.user?.email || 'Member')

async function doLogout() {
  await logout()
  router.push('/')  // back to welcome page
}
</script>
