<!-- src/views/RateEventView.vue -->
<template>
  <div class="container py-5">
    <h1 class="h4 mb-2">Rate our events</h1>
    <h2 class="h6 text-muted mb-4">Choose a event to rate</h2>

    <!-- event selction -->
    <div class="mb-4">
      <select class="form-select" v-model="selectedId">
        <option disabled value="">Select an event</option>
        <option v-for="e in events" :key="e.id" :value="e.id">
          {{ e.title }} — {{ toDateText(e.eventDate) }}
        </option>
      </select>
      <div v-if="events.length===0" class="form-text">No past events to rate.</div>
    </div>

    <!-- rating（1~5） -->
    <div class="mb-3">
      <label class="form-label">Your rating</label>
      <div class="btn-group w-100" role="group" aria-label="rating 1 to 5">
        <button
          v-for="n in 5" :key="n" type="button"
          class="btn"
          :class="n <= rating ? 'btn-warning' : 'btn-outline-secondary'"
          @click="rating = n"
        >
          {{ n }} ★
        </button>
      </div>
      <div class="form-text">1 (lowest) – 5 (highest)</div>
    </div>

    <!-- text review -->
    <div class="mb-4">
      <label for="review" class="form-label">Your review</label>
      <textarea id="review" class="form-control" rows="4"
                v-model.trim="review" maxlength="1000"
                placeholder="Share your thoughts (max 1000 chars)"></textarea>
    </div>

    <!-- submit -->
    <button class="btn btn-primary w-100"
            :disabled="pending || !canSubmit"
            @click="submit">
      {{ pending ? 'Submitting…' : 'Submit' }}
    </button>

    <!-- outcome  -->
    <div v-if="msg" class="alert mt-3" :class="ok ? 'alert-success' : 'alert-danger'">
      {{ msg }}
    </div>

    <!-- dev tool: for data syn and data integrity -->
    <!--
    <div class="mt-4" v-if="selectedId">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="recalc" :disabled="recalcPending">
          {{ recalcPending ? 'Recalculating…' : 'Recalc aggregate (dev only)' }}
        </button>
        <span class="text-muted small">Fix existing data if average shows 0.</span>
      </div>
      <div v-if="recalcMsg" class="alert alert-info mt-2 mb-0">{{ recalcMsg }}</div>
    </div>
    -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase/init'
import {
  collection, getDocs, doc, getDoc, runTransaction,
  serverTimestamp, updateDoc
} from 'firebase/firestore'

/* ---------- helpers ---------- */
function toDateText(ts) {
  const d = ts?.toDate?.() || new Date(ts)
  return isNaN(d) ? '' : d.toDateString()
}
function tsToMillis(ts) {
  try { return ts?.toMillis?.() ?? 0 } catch { return 0 }
}
// coverts <, >, &, ", ', ` to HTML entities
function sanitizePlainText(str = '') {
  return String(str).replace(/[&<>"'`]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    "'": '&#x27;', '`': '&#x60;'
  }[ch]))
}
// basic heuristic to detect potential HTML/JS injection
function looksLikeHtmlAttack(str = '') {
  const s = String(str).toLowerCase()
  return s.includes('<script') || s.includes('javascript:') || /<[^>]+>/.test(s)
}

/* ---------- state ---------- */
const events = ref([])          // [{id, title, eventDate, ...}]
const selectedId = ref('')
const rating = ref(0)
const review = ref('')
const pending = ref(false)
const ok = ref(false)
const msg = ref('')

const recalcPending = ref(false)
const recalcMsg = ref('')

/* ---------- init ---------- */
onMounted(async () => {
  const snap = await getDocs(collection(db, 'events'))
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  events.value = all
    .filter(e => e.isPast === true)
    .sort((a, b) => tsToMillis(b.eventDate) - tsToMillis(a.eventDate))

  if (events.value.length === 1) selectedId.value = events.value[0].id
})

const canSubmit = computed(() =>
  selectedId.value && rating.value >= 1 && rating.value <= 5
)

/* ---------- submit  ---------- */
async function submit() {
  msg.value = ''
  ok.value = false
  if (!canSubmit.value) {
    msg.value = 'Please choose an event and a rating (1–5).'
    return
  }

  pending.value = true
  try {
    const auth = getAuth()
    const uid = auth.currentUser.uid
    const email = auth.currentUser.email || 'user'
    const eventId = selectedId.value
    const safeReview = sanitizePlainText(review.value)

    // warn if review looks like HTML/JS attack
    if (looksLikeHtmlAttack(review.value)) {
      ok.value = true
      msg.value = 'Note: HTML/JS in your review will be saved as plain text.'
    }

    await runTransaction(db, async (tx) => {
      const eventRef = doc(db, 'events', eventId)
      const myRef    = doc(db, 'events', eventId, 'ratings', uid)

      const [eSnap, rSnap] = await Promise.all([tx.get(eventRef), tx.get(myRef)])
      if (!eSnap.exists()) throw new Error('Event not found.')

      const evt  = eSnap.data() || {}
      const prev = rSnap.exists() ? Number(rSnap.data().rating) : null
      const now  = Number(rating.value)

      let sum   = Number(evt.ratingSum || 0)
      let count = Number(evt.ratingCount || 0)

      if (prev == null) { sum += now; count += 1 } else { sum += (now - prev) }
      const avg = count ? Number((sum / count).toFixed(2)) : 0

      tx.set(myRef, {
        userId: uid,
        userEmail: email,
        rating: now,
        review: safeReview,
        createdAt: rSnap.exists() ? rSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true })

      tx.update(eventRef, { ratingSum: sum, ratingCount: count, ratingAvg: avg })
    })

    if (!looksLikeHtmlAttack(review.value)) {
      ok.value = true
      msg.value = 'Your rating has been saved.'
    }
  } catch (e) {
    ok.value = false
    msg.value = e?.message || 'Failed to save rating.'
  } finally {
    pending.value = false
  }
}

/* ---------- dev-only: recalc aggregate ---------- */
async function recalc() {
  if (!selectedId.value) return
  recalcMsg.value = ''
  recalcPending.value = true
  try {
    const eventId = selectedId.value
    const rs = await getDocs(collection(db, 'events', eventId, 'ratings'))
    let sum = 0, count = 0
    rs.forEach(d => {
      const r = Number(d.data().rating)
      if (!isNaN(r)) { sum += r; count += 1 }
    })
    const avg = count ? Number((sum / count).toFixed(2)) : 0
    await updateDoc(doc(db, 'events', eventId), {
      ratingSum: sum, ratingCount: count, ratingAvg: avg
    })
    recalcMsg.value = `Recalculated: count=${count}, sum=${sum}, avg=${avg.toFixed(2)}`
  } catch (e) {
    recalcMsg.value = e?.message || 'Failed to recalc.'
  } finally {
    recalcPending.value = false
  }
}
</script>
