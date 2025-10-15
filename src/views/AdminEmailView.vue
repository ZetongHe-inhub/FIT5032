<template>
  <div class="container py-4">
    <h1 class="h5 mb-3">Send Emails (Admin)</h1>

    <!-- recipients -->
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">Recipients</h6>
        <p class="text-muted small mb-2">
          Paste one email per line (or separated by comma/space).
        </p>

        <div class="mb-2">
          <textarea class="form-control" rows="5" v-model.trim="rawRecipients"
                    placeholder="user1@example.com&#10;user2@example.com"></textarea>
        </div>

        <div v-if="invalidRecipients.length" class="alert alert-warning mt-2 mb-0 p-2 small">
          Invalid emails will be ignored: {{ invalidRecipients.slice(0,5).join(', ') }}
          <span v-if="invalidRecipients.length>5">…</span>
        </div>
      </div>
    </div>

    <!-- subject / message -->
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">Content</h6>

        <div class="mb-3">
          <label class="form-label">Subject</label>
          <input type="text" class="form-control" v-model.trim="subject"
                  placeholder="e.g. Schedule update for next week" />
        </div>

        <div class="mb-3">
          <label class="form-label">Message</label>
          <textarea class="form-control" rows="6" v-model.trim="message"
                    placeholder="Write your message here..."></textarea>
        </div>

        <div>
          <label class="form-label">Attachments (optional)</label>
          <input
            type="file"
            class="form-control"
            name="files"
            multiple
            ref="fileInput"
            @change="onFileChange"
          />
          <div class="form-text">
            You can attach multiple files. Total size should be under 500KB.
          </div>
          <div v-if="attachmentWarning" class="alert alert-warning mt-2 p-2 small">
            {{ attachmentWarning }}
          </div>
          <div v-if="selectedFiles.length" class="mt-2">
            <small class="text-muted">Selected files:</small>
            <ul class="small mb-0">
              <li v-for="file in selectedFiles" :key="file.name">
                {{ file.name }} ({{ (file.size / 1024).toFixed(2) }}KB)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- actions -->
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-primary"
              :disabled="!canSend || sending"
              @click="sendAll">
        <span v-if="!sending">Send {{ validRecipients.length }} email(s)</span>
        <span v-else>Sending… {{ progress.sent }}/{{ progress.total }}</span>
      </button>
    </div>

    <!-- results -->
    <div v-if="resultsDone" class="mt-3">
      <div class="alert" :class="failed.length ? 'alert-warning' : 'alert-success'">
        <div v-if="!failed.length">
          ✅ All {{ progress.total }} emails sent successfully.
        </div>
        <div v-else>
          Sent {{ progress.sent - failed.length }} / {{ progress.total }}. Failed: {{ failed.length }}.
        </div>
      </div>

      <div v-if="failed.length" class="card">
        <div class="card-body">
          <h6 class="card-title">Failed recipients</h6>
          <ul class="small mb-0">
            <li v-for="f in failed" :key="f.email">
              {{ f.email }} — {{ f.reason || 'unknown error' }}
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

const rawRecipients = ref('')
const subject = ref('')
const message = ref('')
const fileInput = ref(null)
const selectedFiles = ref([])
const sending = ref(false)
const progress = ref({ sent: 0, total: 0 })
const failed = ref([])
const attachmentWarning = ref('')

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const parsedFromText = computed(() => {
  const text = rawRecipients.value || ''
  if (!text) return []
  return text
    .split(/[\s,;]+/g)
    .map(s => s.trim())
    .filter(Boolean)
})

const validRecipients = computed(() => {
  const set = new Set()
  parsedFromText.value.forEach(e => {
    if (emailRe.test(e)) set.add(e.toLowerCase())
  })
  return [...set]
})

const invalidRecipients = computed(() => {
  return parsedFromText.value.filter(e => e && !emailRe.test(e))
})

const canSend = computed(() =>
  subject.value && 
  message.value && 
  validRecipients.value.length > 0 && 
  !sending.value &&
  !attachmentWarning.value
)

const resultsDone = computed(() => 
  progress.value.total > 0 && !sending.value
)

function onFileChange() {
  attachmentWarning.value = ''
  selectedFiles.value = []
  
  const files = fileInput.value?.files
  if (!files || files.length === 0) return
  
  let totalSize = 0
  for (const file of files) {
    totalSize += file.size
    selectedFiles.value.push({
      name: file.name,
      size: file.size
    })
  }
  
  const maxSize = 500 * 1024
  
  if (totalSize > maxSize) {
    attachmentWarning.value = `Total file size (${(totalSize / 1024).toFixed(2)}KB) exceeds limit (${maxSize/1024}KB). Please select smaller files.`
  }
}

const wait = (ms) => new Promise(r => setTimeout(r, ms))

async function sendEmailWithAttachments(toEmail) {
  const hasFiles = fileInput.value?.files?.length > 0
  
  if (!hasFiles) {
    return await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: toEmail,
      subject: subject.value,
      message: message.value
    })
  }
  
  const form = document.createElement('form')
  
  const addHidden = (name, value) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  
  addHidden('to_email', toEmail)
  addHidden('subject', subject.value)
  addHidden('message', message.value)
  
  const files = fileInput.value.files
  const dataTransfer = new DataTransfer()
  
  for (let i = 0; i < files.length; i++) {
    dataTransfer.items.add(files[i])
  }
  
  const fileInputClone = document.createElement('input')
  fileInputClone.type = 'file'
  fileInputClone.name = 'files'
  fileInputClone.multiple = true
  fileInputClone.files = dataTransfer.files
  form.appendChild(fileInputClone)
  
  return await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form)
}

async function sendAll() {
  if (!canSend.value) return
  
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    alert('❌ EmailJS configuration is missing. Please check your .env file.')
    return
  }
  
  sending.value = true
  failed.value = []
  progress.value = { sent: 0, total: validRecipients.value.length }
  
  for (const to of validRecipients.value) {
    try {
      await sendEmailWithAttachments(to)
    } catch (err) {
      let errorMsg = 'Unknown error'
      if (err?.text) {
        errorMsg = err.text
      } else if (err?.message) {
        errorMsg = err.message
      } else if (err?.status) {
        errorMsg = `HTTP ${err.status}`
      }
      
      failed.value.push({ 
        email: to, 
        reason: errorMsg
      })
    } finally {
      progress.value.sent++
      
      if (progress.value.sent < progress.value.total) {
        await wait(500)
      }
    }
  }
  
  sending.value = false
}
</script>

<style scoped>
.card {
  border-radius: .8rem;
}
</style>