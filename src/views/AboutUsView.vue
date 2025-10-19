<template>
  <div class="container py-5">
    <!-- Header -->
    <h1 class="h4 mb-3">About Fit&Fix</h1>

    <div class="card shadow-sm mb-4 border-0">
    <div class="card-body">
        <p class="lead mb-0">
        <strong>Fit&Fix</strong> is a lightweight web app for Melbourne's community fitness events. 
        It helps users effortlessly browse upcoming activities, navigate with an interactive <strong>map</strong>, 
        and share <strong>ratings & reviews</strong> after attending. The event list features real locations and times 
        with fast search, sorting, and other useful functions.
        </p>
    </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h2 class="h5 mb-3">Send feedback</h2>
        <p class="text-muted">
          We appreciate your feedback to help us improve Fit&Fix.
          Please share any thoughts or suggestions you have below.
        </p>

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Your email (optional)</label>
            <input
              type="email"
              class="form-control"
              placeholder="name@example.com"
              v-model.trim="email"
            />
          </div>
          <div class="col-12">
            <label class="form-label">Message</label>
            <textarea
              class="form-control"
              rows="4"
              maxlength="1000"
              placeholder="Share your thoughts (max 1000 chars)"
              v-model.trim="message"
            ></textarea>
            <div class="form-text">{{ message.length }}/1000</div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 mt-3">
          <button class="btn btn-primary" :disabled="pending || !canSubmit" @click="submit">
            {{ pending ? 'Submitting…' : 'Submit feedback' }}
          </button>
          <small class="text-muted">We'll check your meassge later!</small>
        </div>

        <div v-if="msg" class="alert mt-3" :class="ok ? 'alert-success' : 'alert-danger'">
          {{ msg }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>


import { ref, computed, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'

const email = ref('')
const message = ref('')
const pending = ref(false)
const ok = ref(false)
const msg = ref('')

onMounted(() => {
  const u = getAuth().currentUser
  if (u?.email) email.value = u.email
})

const canSubmit = computed(() => message.value.trim().length > 0)

async function submit () {
  if (!canSubmit.value) return
  pending.value = true
  ok.value = true
  msg.value = 'Thanks for your feedback!'
  setTimeout(() => { pending.value = false }, 600)
}
</script>

<style scoped>
.card { border-radius: 1rem; }
</style>
