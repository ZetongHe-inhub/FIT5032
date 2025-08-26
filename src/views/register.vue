<!-- src/views/Register.vue -->
<template>
  <div class="container py-5">
    <div class="row justify-content-center g-4">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4 p-lg-5">
            <h1 class="h4 mb-4 text-center">Create your account</h1>

            <form>
              <div class="row">
                <!-- Name -->
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                  <label for="name" class="form-label">Full name</label>
                  <input id="name" type="text" class="form-control" v-model.trim="form.name" placeholder="e.g. Zetong He" />
                </div>

                <!-- Sex -->
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                  <label for="sex" class="form-label">Sex</label>
                  <select id="sex" class="form-select" v-model="form.sex">
                    <option value="" disabled>Select…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>

                <!-- Email -->
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input id="email" type="email" class="form-control" v-model.trim="form.email" placeholder="name@example.com" />
                </div>

                <!-- Mobile -->
                <div class="col-12 col-md-6 col-lg-6 mb-3">
                  <label for="mobile" class="form-label">Mobile number</label>
                  <input id="mobile" type="tel" class="form-control" v-model.trim="form.mobile" placeholder="e.g. 04xx xxx xxx" />
                </div>

                <!-- Auth code -->
                <div class="col-12 col-md-6 col-lg-6 mb-4">
                  <label for="auth" class="form-label">Auth code</label>
                  <input id="auth" type="text" class="form-control" v-model.trim="form.authCode" placeholder="Enter referral/auth code" />
                </div>
              </div>

              <button type="button" class="btn btn-primary w-100">Register</button>
              <p class="text-center small mt-3 mb-0">
                Already have an account?
                <a href="#" class="text-decoration-none">Sign in</a>
              </p>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// Simple form state (no validation yet)
const form = reactive({
  name: '',
  sex: '',
  email: '',
  mobile: '',
  authCode: '',
})
</script>

<style scoped>
.card { border-radius: 1rem; }
</style>
