<template>
  <div class="container py-5">
    <h1 class="h4 mb-2">History Events Rating</h1>
    <h2 class="h6 text-muted mb-4">Choose a event to see the review</h2>

    <div class="mb-4">
      <select class="form-select" v-model="selectedId" @change="go">
        <option disabled value="">Select an event</option>
        <option v-for="e in events" :key="e.id" :value="e.id">
          {{ e.title }} — {{ toDateText(e.eventDate) }}
        </option>
      </select>
      <div v-if="events.length===0" class="form-text">No past events available.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase/init'
import { collection, getDocs } from 'firebase/firestore'

const router = useRouter()
const events = ref([])      // [{id, title, eventDate, isPast, ...}]
const selectedId = ref('')

onMounted(async () => {
  const snap = await getDocs(collection(db, 'events'))
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  events.value = all
    .filter(e => e.isPast === true)
    .sort((a, b) => (b?.eventDate?.toMillis?.() ?? 0) - (a?.eventDate?.toMillis?.() ?? 0))

  // if only one event, page jump automatically
  // actully this should not happen because I've added more than one past event into firestore -。-
  if (events.value.length === 1) {
    selectedId.value = events.value[0].id
    go()
  }
})

function toDateText(ts) {
  const d = ts?.toDate?.() || new Date(ts)
  return isNaN(d) ? '' : d.toDateString()
}

function go() {
  if (selectedId.value) {
    router.push(`/events/${selectedId.value}/reviews`)
  }
}
</script>
