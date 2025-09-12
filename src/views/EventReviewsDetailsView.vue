<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <div class="d-flex justify-content-between align-items-end mb-3">
          <div>
            <h1 class="h5 mb-1">{{ event?.title || 'Event' }}</h1>
            <div class="text-muted">{{ dateText }}</div>
          </div>
          <div class="text-end">
            <div class="display-6 mb-0">{{ avgText }}</div>
            <div class="text-muted">Average ({{ event?.ratingCount || 0 }} ratings)</div>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 mb-3">All reviews</h2>
            <div v-if="reviews.length === 0" class="text-muted">No reviews yet.</div>

            <div v-for="r in reviews" :key="r.id" class="border-bottom py-3">
              <div class="d-flex justify-content-between">
                <strong>{{ r.userEmail }}</strong>
                <span>{{ r.rating }} ★</span>
              </div>
              <div class="mt-1" style="white-space: pre-wrap;" v-text="r.review || '(no text)'"></div>
              <div class="text-muted small mt-1">{{ timeText(r.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <router-link class="btn btn-outline-secondary" to="/reviews">Back</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '@/firebase/init'
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore'

const route = useRoute()
const eventId = route.params.eventId

const event = ref(null)
const reviews = ref([])

const avgText = computed(() => {
  const v = Number(event.value?.ratingAvg ?? 0)
  return v.toFixed(2)
})

const dateText = computed(() => {
  if (!event.value?.eventDate) return ''
  const d = event.value.eventDate.toDate?.() || new Date(event.value.eventDate)
  return d.toDateString()
})

function timeText(ts) {
  const d = ts?.toDate?.() || new Date(ts)
  return isNaN(d) ? '' : d.toLocaleString()
}

onMounted(async () => {
  // read event info
  const eSnap = await getDoc(doc(db, 'events', eventId))
  if (eSnap.exists()) event.value = eSnap.data()

  // red reviews
  // order by createdAt desc
  const q = query(collection(db, 'events', eventId, 'ratings'), orderBy('createdAt', 'desc'))
  const rs = await getDocs(q)
  reviews.value = rs.docs.map(d => ({ id: d.id, ...d.data() }))
})
</script>
