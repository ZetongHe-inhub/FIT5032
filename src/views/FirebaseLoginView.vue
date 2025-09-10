<!-- src/views/FirebaseLoginView.vue -->
<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4 p-lg-5">
            <h1 class="h4 text-center mb-4">Sign in</h1>

            <form @submit.prevent="onSubmit" novalidate>
              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  :class="{
                    'is-invalid': emailTouched && !!emailError,
                    'is-valid':  emailTouched && !emailError
                  }"
                  v-model.trim="form.email"
                  placeholder="name@example.com"
                  required
                  @blur="emailTouched = true; validateEmail()"
                  @input="validateEmail()"
                />
                <div class="invalid-feedback">
                  {{ emailError || 'Please enter a valid email address.' }}
                </div>
              </div>

              <!-- Password (HTML validation only) -->
              <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  class="form-control"
                  v-model="form.password"
                  placeholder="8–30 characters"
                  required
                  minlength="8"
                  maxlength="30"
                />
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="pending || !!emailError || !passwordOk"
              >
                {{ pending ? 'Signing in…' : 'Sign in' }}
              </button>

              <!-- Firebase error -->
              <div v-if="firebaseError" class="alert alert-danger mt-3 mb-0">
                {{ firebaseError }}
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()
const route = useRoute()

// form state
const form = reactive({
  email: '',
  password: ''
})

// Email JS validation（必填 + 正则，与 Register 保持一致）
const emailTouched = ref(false)
const emailError = ref(null)
function validateEmail() {
  const value = form.email.trim()
  if (!value) {
    emailError.value = 'Email is required.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  emailError.value = null
}

// Password 仅用 HTML 校验（required + 8~30），按钮用 computed 再兜一层
const passwordOk = computed(() =>
  !!form.password && form.password.length >= 8 && form.password.length <= 30
)

const pending = ref(false)
const firebaseError = ref('')

async function onSubmit() {
  emailTouched.value = true
  validateEmail()
  if (emailError.value || !passwordOk.value) return

  pending.value = true
  firebaseError.value = ''
  try {
    const auth = getAuth()
    await signInWithEmailAndPassword(auth, form.email, form.password)
    // 如果是被守卫拦下来的，会带 redirect；否则进会员页
    router.push(route.query.redirect || '/')
  } catch (e) {
    firebaseError.value = e?.message || 'Sign in failed.'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.card { border-radius: 1rem; }
</style>
