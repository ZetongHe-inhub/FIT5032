<template>
  <div class="container py-5">
    <h1 class="h4 mb-2">Rate our events</h1>
    <h2 class="h6 text-muted mb-4">Choose an event to rate</h2>

    <!-- 事件选择 -->
    <div class="mb-4">
      <select class="form-select" v-model="selectedId">
        <option disabled value="">Select an event</option>
        <option v-for="e in events" :key="e.id" :value="e.id">
          {{ e.title }}
          <!-- 也可显示日期： - {{ toDateText(e.eventDate) }} -->
        </option>
      </select>
      <div v-if="events.length===0" class="form-text">No past events to rate.</div>
    </div>

    <!-- 打分（1~5） -->
    <div class="mb-3">
      <label class="form-label">Your rating</label>
      <div class="btn-group w-100" role="group" aria-label="rating 1 to 5">
        <button
          v-for="n in 5" :key="n"
          type="button"
          class="btn"
          :class="n <= rating ? 'btn-warning' : 'btn-outline-secondary'"
          @click="rating = n"
        >
          {{ n }} ★
        </button>
      </div>
      <div class="form-text">1 (lowest) – 5 (highest)</div>
    </div>

    <!-- 评论 -->
    <div class="mb-4">
      <label for="review" class="form-label">Your review</label>
      <textarea id="review" class="form-control" rows="4"
                v-model.trim="review" maxlength="1000"
                placeholder="Share your thoughts (max 1000 chars)"></textarea>
    </div>

    <!-- 提交（不跳转，只写入 Firestore） -->
    <button class="btn btn-primary w-100"
            :disabled="pending || !canSubmit"
            @click="submit">
      {{ pending ? 'Submitting…' : 'Submit' }}
    </button>

    <!-- 结果提示 -->
    <div v-if="msg" class="alert mt-3"
         :class="ok ? 'alert-success' : 'alert-danger'">
      {{ msg }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase/init'
import {
  collection, getDocs, doc, setDoc, serverTimestamp
} from 'firebase/firestore'

// 事件列表（只取 isPast=true）
const events = ref([])          // [{id, title, eventDate, ...}]
const selectedId = ref('')
const rating = ref(0)
const review = ref('')
const pending = ref(false)
const ok = ref(false)
const msg = ref('')

onMounted(async () => {
  // 简化起见：先把所有 events 取回再在前端过滤 isPast==true
  // （也可用 where('isPast','==',true)，为避免索引问题这里先简单处理）
  const snap = await getDocs(collection(db, 'events'))
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  events.value = all.filter(e => e.isPast === true)
  // 如果只有一个就默认选中
  if (events.value.length === 1) selectedId.value = events.value[0].id
})

const canSubmit = computed(() =>
  selectedId.value && rating.value >= 1 && rating.value <= 5
)

function toDateText(ts) {
  const d = ts?.toDate?.() || new Date(ts)
  return isNaN(d) ? '' : d.toDateString()
}

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

    // 只做“写入评分+评论”，不做聚合与跳转
    await setDoc(
      doc(db, 'events', selectedId.value, 'ratings', uid),
      {
        userId: uid,
        userEmail: email,
        rating: Number(rating.value),
        review: review.value || '',
        // 如果文档已存在就只更新 updatedAt；否则补 createdAt
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    ok.value = true
    msg.value = 'Your rating has been saved.'
  } catch (e) {
    ok.value = false
    msg.value = e?.message || 'Failed to save rating.'
  } finally {
    pending.value = false
  }
}
</script>
