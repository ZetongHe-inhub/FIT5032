<!-- src/views/Register.vue -->
<template>
  <div class="container py-5">
    <div class="row justify-content-center g-4">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4 p-lg-5">
            <h1 class="h4 mb-4 text-center">Create your account</h1>

            <form @submit.prevent="submitForm">
              <div class="row">
                <!-- Full name: HTML5 validation -->
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                  <label for="name" class="form-label">Full name</label>
                  <input
                    id="name"
                    type="text"
                    class="form-control"
                    v-model="formData.name"
                    placeholder="e.g. Zetong He"
                    required
                    minlength="3"
                    maxlength="50"
                  />
                  <div class="form-text">3–50 characters.</div>
                </div>

                <!-- Sex: required + blur-driven JS validation -->
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                  <label for="sex" class="form-label">Sex</label>
                  <select
                    id="sex"
                    class="form-select"
                    v-model="formData.sex"
                    @blur="() => validateSex(true)"
                    @change="() => validateSex(false)"
                  >
                    <option value="" disabled>Select…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                  <div v-if="errors.sex" class="text-danger">{{ errors.sex }}</div>
                </div>

                <!-- Email -->
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    class="form-control"
                    v-model="formData.email"
                    placeholder="name@example.com"
                  />
                </div>

                <!-- Mobile -->
                <div class="col-12 col-md-6 col-lg-6 mb-3">
                  <label for="mobile" class="form-label">Mobile number</label>
                  <input
                    id="mobile"
                    type="tel"
                    class="form-control"
                    v-model="formData.mobile"
                    placeholder="e.g. 04xx xxx xxx"
                  />
                </div>

                <!-- Auth code: required + fixed 13 digits  -->
                <div class="col-12 col-md-6 col-lg-6 mb-4">
                  <label for="auth" class="form-label">Auth code</label>
                  <input
                    id="auth"
                    type="text"
                    class="form-control"
                    v-model="formData.authCode"
                    @blur="() => validateAuthCode(true)"
                    @input="() => validateAuthCode(false)"
                    inputmode="numeric"
                    placeholder="Please enter 13-digit code"
                  />
                  <div v-if="errors.authCode" class="text-danger">{{ errors.authCode }}</div>
                  <div v-else class="form-text">Exactly 13 digits required.</div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary flex-fill">Register</button>
                <button type="button" class="btn btn-secondary flex-fill" @click="clearForm">Clear</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Submitted cards -->
        <div class="mt-4" v-if="submittedCards.length">
          <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
            <div class="col" v-for="(card, index) in submittedCards" :key="index">
              <div class="card h-100">
                <div class="card-header">User Information</div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">Full name: {{ card.name }}</li>
                  <li class="list-group-item">Sex: {{ formatSex(card.sex) }}</li>
                  <li class="list-group-item">Email: {{ card.email || 'N/A' }}</li>
                  <li class="list-group-item">Mobile: {{ card.mobile || 'N/A' }}</li>
                  <li class="list-group-item">Auth code: {{ card.authCode || 'N/A' }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <!-- /Submitted cards -->

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Form state
const formData = ref({
  name: '',
  sex: '',
  email: '',
  mobile: '',
  authCode: '',
})

// Errors object
const errors = ref({
  sex: null,
  authCode: null,
})

// Submitted list
const submittedCards = ref([])

// Sex validation 
const validateSex = (blur) => {
  if (!formData.value.sex) {
    if (blur) errors.value.sex = 'This field is required.'
  } else {
    errors.value.sex = null
  }
}

// Auth code validation
const validateAuthCode = (blur) => {
  const value = formData.value.authCode.trim()
  
  if (!value) {
    if (blur) errors.value.authCode = 'Auth code is required.'
  } else if (!/^\d{13}$/.test(value)) {
    if (blur) errors.value.authCode = 'Auth code must be exactly 13 digits.'
  } else {
    errors.value.authCode = null
  }
}

const submitForm = (e) => {
  const el = e.target

  // Run HTML5 validations
  if (!el.checkValidity()) {
    el.reportValidity()
    return
  }

  // Run custom JS validations
  validateSex(true)
  validateAuthCode(true)
  
  // Check if custom validations passed
  if (errors.value.sex || errors.value.authCode) {
    return
  }

  // All validations passed, submit the form
  submittedCards.value.push({ ...formData.value })
  clearForm()
}

const clearForm = () => {
  formData.value.name = ''
  formData.value.sex = ''
  formData.value.email = ''
  formData.value.mobile = ''
  formData.value.authCode = ''
  errors.value.sex = null
  errors.value.authCode = null
}

const formatSex = (s) =>
  s === 'female' ? 'Female' : s === 'male' ? 'Male' : s ? 'Other' : 'N/A'
</script>

<style scoped>
.card { 
  border-radius: 1rem; 
}

.card-header { 
  background-color: #27bba2; 
  color: #fff; 
}

.list-group-item { 
  padding: 10px; 
}
</style>