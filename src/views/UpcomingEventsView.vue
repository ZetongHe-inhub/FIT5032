<template>
  <div class="container py-4">
    <h1 class="h4 mb-3">Upcoming Events</h1>

    <!-- ====== Global search & page size ====== -->
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <div class="input-group" style="max-width: 360px">
        <span class="input-group-text">Search</span>
        <input
          v-model.trim="globalQuery"
          type="text"
          class="form-control"
          placeholder="Type to search all columns..."
        />
        <button class="btn btn-outline-secondary" @click="globalQuery = ''">Clear</button>
      </div>

      <div class="ms-auto d-flex align-items-center gap-2">
        <label class="text-muted small">Rows per page</label>
        <select class="form-select form-select-sm" style="width: 90px" v-model.number="pageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
      </div>
    </div>

    <!-- ====== Table 1: Upcoming Events ====== -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h2 class="h6 m-0">All upcoming events</h2>
          <small class="text-muted">
            Showing {{ pagedRows.length }} of {{ filteredAndSorted.length }}
          </small>
        </div>

        <div class="table-responsive mt-3">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th @click="toggleSort('name')" role="button">
                  Name
                  <SortIcon :active="sortKey==='name'" :dir="sortDir" />
                </th>
                <th @click="toggleSort('start')" role="button" style="min-width: 180px">
                  Start (local)
                  <SortIcon :active="sortKey==='start'" :dir="sortDir" />
                </th>
                <th @click="toggleSort('durationMin')" role="button" class="text-end" style="width:120px">
                  Duration (min)
                  <SortIcon :active="sortKey==='durationMin'" :dir="sortDir" />
                </th>
                <th @click="toggleSort('address')" role="button">
                  Address
                  <SortIcon :active="sortKey==='address'" :dir="sortDir" />
                </th>
                <th @click="toggleSort('contactEmail')" role="button">
                  Contact Email
                  <SortIcon :active="sortKey==='contactEmail'" :dir="sortDir" />
                </th>
              </tr>
              <!-- per-column filters -->
              <tr class="align-middle">
                <th>
                  <input v-model.trim="colFilter.name" class="form-control form-control-sm" placeholder="Filter name" />
                </th>
                <th>
                  <input v-model.trim="colFilter.start" class="form-control form-control-sm" placeholder="YYYY-MM-DD…" />
                </th>
                <th>
                  <div class="d-flex gap-1">
                    <input
                      v-model.number="colFilter.minDur"
                      type="number"
                      min="0"
                      class="form-control form-control-sm"
                      placeholder="Min"
                    />
                    <input
                      v-model.number="colFilter.maxDur"
                      type="number"
                      min="0"
                      class="form-control form-control-sm"
                      placeholder="Max"
                    />
                  </div>
                </th>
                <th>
                  <input v-model.trim="colFilter.address" class="form-control form-control-sm" placeholder="Filter address" />
                </th>
                <th>
                  <input v-model.trim="colFilter.email" class="form-control form-control-sm" placeholder="Filter email" />
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="ev in pagedRows" :key="ev.id">
                <td class="fw-semibold">{{ ev.name }}</td>
                <td>
                  <div>{{ formatLocal(ev.start) }}</div>
                  <small class="text-muted">{{ ev.start }}</small>
                </td>
                <td class="text-end">{{ ev.durationMin }}</td>
                <td>{{ ev.address }}</td>
                <td>
                  <a :href="`mailto:${ev.contactEmail}`">{{ ev.contactEmail }}</a>
                </td>
              </tr>

              <tr v-if="pagedRows.length === 0">
                <td colspan="5" class="text-center text-muted py-4">No matching events.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- pagination -->
        <nav class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            Page {{ page }} of {{ totalPages || 1 }}
          </small>
          <ul class="pagination pagination-sm mb-0">
            <li :class="['page-item', { disabled: page<=1 }]" @click="goPage(1)">
              <a class="page-link" role="button">« First</a>
            </li>
            <li :class="['page-item', { disabled: page<=1 }]" @click="goPage(page-1)">
              <a class="page-link" role="button">‹ Prev</a>
            </li>
            <li class="page-item disabled">
              <span class="page-link">{{ page }}</span>
            </li>
            <li :class="['page-item', { disabled: page>=totalPages }]" @click="goPage(page+1)">
              <a class="page-link" role="button">Next ›</a>
            </li>
            <li :class="['page-item', { disabled: page>=totalPages }]" @click="goPage(totalPages)">
              <a class="page-link" role="button">Last »</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- ====== Table 2: Location summary ====== -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h2 class="h6 m-0">Events by location</h2>
          <div class="input-group" style="max-width: 320px">
            <span class="input-group-text">Filter</span>
            <input
              v-model.trim="locQuery"
              class="form-control"
              placeholder="Type location name..."
            />
            <button class="btn btn-outline-secondary" @click="locQuery = ''">Clear</button>
          </div>
        </div>

        <div class="table-responsive mt-3">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th @click="toggleLocSort('location')" role="button">
                  Location
                  <SortIcon :active="locSortKey==='location'" :dir="locSortDir" />
                </th>
                <th class="text-end" @click="toggleLocSort('count')" role="button" style="width: 120px">
                  Count
                  <SortIcon :active="locSortKey==='count'" :dir="locSortDir" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredLocRows" :key="row.location">
                <td>{{ row.location }}</td>
                <td class="text-end">{{ row.count }}</td>
              </tr>
              <tr v-if="filteredLocRows.length === 0">
                <td colspan="2" class="text-center text-muted py-3">No results.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import eventsData from '@/data/events.json'

/* ---------- util ---------- */
const formatLocal = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch { return iso }
}
const includes = (v, q) =>
  String(v ?? '').toLowerCase().includes(String(q ?? '').toLowerCase())

/* ---------- state ---------- */
const rows = ref(eventsData) 
const globalQuery = ref('')
const page = ref(1)
const pageSize = ref(10)

const sortKey = ref('start')
const sortDir = ref('asc') // 'asc' | 'desc'

const colFilter = reactive({
  name: '',
  start: '',
  minDur: null,
  maxDur: null,
  address: '',
  email: ''
})

/* ---------- filtering + sorting ---------- */
const filtered = computed(() => {
  return rows.value.filter((r) => {
    // global query
    const globalPass = !globalQuery.value || [
      r.name, r.start, r.durationMin, r.address, r.contactEmail
    ].some(v => includes(v, globalQuery.value))
    if (!globalPass) return false

    // column filters
    if (colFilter.name && !includes(r.name, colFilter.name)) return false
    if (colFilter.start && !includes(r.start, colFilter.start)) return false

    if (colFilter.minDur != null && r.durationMin < Number(colFilter.minDur)) return false
    if (colFilter.maxDur != null && r.durationMin > Number(colFilter.maxDur)) return false

    if (colFilter.address && !includes(r.address, colFilter.address)) return false
    if (colFilter.email && !includes(r.contactEmail, colFilter.email)) return false

    return true
  })
})

const filteredAndSorted = computed(() => {
  const arr = [...filtered.value]
  arr.sort((a, b) => {
    const dir = sortDir.value === 'asc' ? 1 : -1
    let av = a[sortKey.value], bv = b[sortKey.value]
    if (sortKey.value === 'start') {
      av = new Date(av).getTime()
      bv = new Date(bv).getTime()
    }
    if (av < bv) return -1 * dir
    if (av > bv) return  1 * dir
    return 0
  })
  return arr
})

/* ---------- pagination ---------- */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAndSorted.value.length / pageSize.value))
)

const pagedRows = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  if (page.value < 1) page.value = 1

  const start = (page.value - 1) * pageSize.value
  return filteredAndSorted.value.slice(start, start + pageSize.value)
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}
function goPage(p) {
  if (!p || p < 1 || p > totalPages.value) return
  page.value = p
}

/* ---------- table 2: location summary ---------- */
const locRows = computed(() => {
  const map = new Map()
  rows.value.forEach(r => {
    const loc = String(r.address ?? '').split(',')[0].trim() || 'Unknown'
    map.set(loc, (map.get(loc) || 0) + 1)
  })
  return Array.from(map.entries()).map(([location, count]) => ({ location, count }))
})

const locQuery = ref('')
const locSortKey = ref('count') // 'location' | 'count'
const locSortDir = ref('desc')

const filteredLocRows = computed(() => {
  const arr = locRows.value.filter(x => !locQuery.value || includes(x.location, locQuery.value))
  arr.sort((a, b) => {
    const dir = locSortDir.value === 'asc' ? 1 : -1
    let av = a[locSortKey.value], bv = b[locSortKey.value]
    if (av < bv) return -1 * dir
    if (av > bv) return  1 * dir
    return 0
  })
  return arr
})

function toggleLocSort(key) {
  if (locSortKey.value === key) {
    locSortDir.value = locSortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    locSortKey.value = key
    locSortDir.value = 'asc'
  }
}

/* ---------- tiny sort icon component ---------- */
const SortIcon = {
  props: { active: Boolean, dir: String },
  template: `
    <span v-if="active" class="ms-1 small text-muted">
      <i v-if="dir==='asc'" class="bi bi-caret-up-fill"></i>
      <i v-else class="bi bi-caret-down-fill"></i>
    </span>
  `
}
</script>

<style scoped>
.table thead th { user-select: none; }
</style>
