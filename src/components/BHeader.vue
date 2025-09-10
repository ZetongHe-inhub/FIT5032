<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">Fit&Fix</router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="navMain" class="collapse navbar-collapse">
        <!-- 左侧菜单 -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 未登录：只给 Welcome （现阶段） -->
          <li class="nav-item" v-if="!isAuthed"><router-link class="nav-link" to="/">Welcome</router-link></li>

          <!-- 已登录：给 Upcoming Events -->
          <li class="nav-item" v-if="isAuthed"><router-link class="nav-link" to="/UpcomingEvents">Upcoming Events</router-link></li>
        </ul>

        <!-- 右侧：欢迎语 + Logout / 或 登录注册按钮组 -->
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
  router.push('/')  // 回到主页面
}
</script>
