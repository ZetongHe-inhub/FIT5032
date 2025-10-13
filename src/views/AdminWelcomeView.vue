<template>
  <div class="container py-5">
    <h1 class="h4 mb-3">Admin Console</h1>

    <div class="row g-3">
      <div class="col-12 col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Inform Users</h5>
            <p class="card-text">sent emails to users for events update etc.</p>
            <RouterLink to="/admin/events" class="btn btn-primary btn-sm">Go</RouterLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { getAuth } from 'firebase/auth'
import { computed } from 'vue'

const auth = getAuth()
const userEmail = computed(() => auth.currentUser?.email || '')
</script>
