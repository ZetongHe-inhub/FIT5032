<template>
  <div class="container py-4">
    <!-- Page header -->
    <div class="row align-items-center mb-3">
      <div class="col">
        <h1 class="h3 mb-0">Upcoming Events</h1>
        <p class="text-muted mb-0">
          Programs by <strong>Fit&Fix you in Melbourne</strong>
        </p>
      </div>
    </div>

    <!-- Status banners -->
    <div v-if="loading" class="alert alert-info" role="status">Loading events…</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Content -->
    <div v-else class="row g-4">
      <div
        v-for="evt in events"
        :key="evt.id"
        class="col-12 col-md-6 col-lg-4 d-flex"
      >
        <div class="card shadow-sm flex-fill h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-start justify-content-between mb-2">
              <h2 class="h5 card-title mb-0">{{ evt.title }}</h2>
              <span class="badge text-bg-light">{{ evt.project }}</span>
            </div>

            <p class="card-text mb-2">{{ evt.summary }}</p>

            <ul class="list-unstyled small mb-3">
              <li class="mb-1">
                <i class="bi bi-calendar-event me-1"></i>
                <strong>{{ formatRange(evt.start, evt.end) }}</strong>
              </li>
              <li class="mb-1">
                <i class="bi bi-geo-alt me-1"></i>
                {{ evt.venue }} — {{ evt.address }}
              </li>
              <li class="mb-1" v-if="evt.capacity">
                <i class="bi bi-people me-1"></i>
                Capacity: {{ evt.capacity }}
              </li>
            </ul>

            <div class="mb-3">
              <span
                v-for="tag in evt.tags"
                :key="tag"
                class="badge rounded-pill text-bg-secondary me-1 mb-1"
              >
                {{ tag }}
              </span>
            </div>

            <div class="mt-auto">
              <a
                class="btn btn-outline-secondary btn-sm"
                :href="`mailto:${evt.contact_email}`"
              >
                Email: {{ evt.contact_email }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="events.length === 0" class="col-12">
        <div class="alert alert-warning mb-0">No upcoming events yet.</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UpcomingEvents",
  data() {
    return {
      events: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchEvents() {
      try {
        const url = new URL("../data/events.json", import.meta.url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load events.json (${res.status})`);
        const data = await res.json();
        this.events = (Array.isArray(data) ? data : []).sort(
          (a, b) => new Date(a.start) - new Date(b.start)
        );
      } catch (e) {
        this.error = e.message || "Unable to fetch events.";
      } finally {
        this.loading = false;
      }
    },
    formatRange(startIso, endIso) {
      try {
        const opts = {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        };
        const s = new Date(startIso);
        const e = new Date(endIso);
        const fmt = new Intl.DateTimeFormat(undefined, opts);
        const sStr = fmt.format(s);
        const eTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(e);
        return `${sStr} – ${eTime}`;
      } catch {
        return `${startIso} – ${endIso}`;
      }
    }
  },
  mounted() {
    this.fetchEvents();
  }
};
</script>

<style scoped>
.card-title { line-height: 1.25; }
.badge.text-bg-light { border: 1px solid rgba(0,0,0,.1); }
</style>
