<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4 p-lg-5">
            <h1 class="h4 text-center mb-4">Create your account</h1>

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
              <div class="mb-3">
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
                <div class="form-text">Use 8–30 characters.</div>
              </div>

              <!-- Invite Code : required filed with 6 length char -->
              <div class="mb-4">
                <label for="invite" class="form-label">Invite code</label>
                <input
                  id="invite"
                  type="text"
                  class="form-control"
                  :class="{
                    'is-invalid': inviteTouched && !!inviteError,
                    'is-valid':  inviteTouched && !inviteError
                  }"
                  v-model.trim="form.inviteCode"
                  placeholder="6 characters (e.g. ABC123)"
                  required
                  pattern="^[A-Za-z0-9]{6}$"
                  @blur="inviteTouched = true; validateInvite()"
                  @input="validateInvite()"
                />
                <div class="invalid-feedback">
                  {{ inviteError || 'Please enter a valid 6-character code.' }}
                </div>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="pending || !!emailError || !!inviteError || !passwordOk"
              >
                {{ pending ? 'Creating account…' : 'Sign up and Login' }}
              </button>

              <!-- Firebase / error handling -->
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
import { useRouter } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { db } from '@/firebase/init'
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  inviteCode: ''
})

// Email —— JS validation (required + regex, same as Register)
const emailTouched = ref(false)
const emailError = ref(null)
function validateEmail() {
  const value = form.email.trim()
  if (!value) { emailError.value = 'Email is required.'; return }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) { emailError.value = 'Please enter a valid email address.'; return }
  emailError.value = null
}

// Password —— only HTML validation (required + 8~30)
const passwordOk = computed(() =>
  !!form.password && form.password.length >= 8 && form.password.length <= 30
)

// Invite code —— JS validation（required + exactly 6 alphanumeric characters + firestore existence check）
const inviteTouched = ref(false)
const inviteError = ref(null)
function validateInvite() {
  const v = (form.inviteCode || '').toUpperCase().trim()
  if (!v) { inviteError.value = 'Invite code is required.'; return }
  if (!/^[A-Z0-9]{6}$/.test(v)) { inviteError.value = 'Code must be 6 alphanumeric characters.'; return }
  inviteError.value = null
}

const pending = ref(false)
const firebaseError = ref('')

async function onSubmit() {
  emailTouched.value = true
  inviteTouched.value = true
  validateEmail()
  validateInvite()
  if (emailError.value || inviteError.value || !passwordOk.value) return

  pending.value = true
  firebaseError.value = ''
  const auth = getAuth()

  try {
    // check invite code existence and unused
    const CODE = form.inviteCode.toUpperCase().trim()
    const codeRef = doc(db, 'inviteCodes', CODE)
    const preSnap = await getDoc(codeRef)
    if (!preSnap.exists()) throw new Error('Invalid invite code.')
    if (preSnap.data().used) throw new Error('Invite code already used.')

    // create user account
    const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
    const uid = cred.user.uid

    // Firestore transaction: check + mark invite code as used
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(codeRef)
      if (!snap.exists()) throw new Error('Invalid invite code.')
      if (snap.data().used) throw new Error('Invite code already used.')
      tx.update(codeRef, { used: true, usedBy: uid, usedAt: serverTimestamp() })

    })

    // success, redirect to home page
    router.push('/')
  } catch (e) {
    // if I've created the user but something else failed (e.g. invite code problem),
    // delete the user to avoid "ghost users"
    if ((e?.message || '').includes('Invite code')) {
      try { if (auth.currentUser) await deleteUser(auth.currentUser) } catch {}
    }
    firebaseError.value = e?.message || 'Registration failed.'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.card { border-radius: 1rem; }
</style>
