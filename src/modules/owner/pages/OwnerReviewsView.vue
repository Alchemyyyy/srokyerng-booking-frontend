<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import reviewApi from '@/modules/reviews/api/review.api'
import OwnerReviewCard from '../components/OwnerReviewCard.vue'
import OwnerLoadingState from '../components/OwnerLoadingState.vue'
import {
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { StarIcon as StarSolid } from '@heroicons/vue/24/solid'
import { useI18n } from 'vue-i18n'

const toast              = useToastStore()
const { t } = useI18n({ useScope: "global" })

const loading      = ref(true)
const error        = ref('')
const reviews      = ref([])
const searchQuery  = ref('')
const activeFilter = ref('all')
const sortBy       = ref('newest')

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchReviews = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res = await reviewApi.getOwnerReviews()  // GET /reviews/owner
    const raw = Array.isArray(res) ? res : res?.data || []
    reviews.value = raw.map(normalizeReview)
  } catch (err) {
    error.value = err?.message || t("owner.reviews.loadFailed")
  } finally {
    loading.value = false
  }
}

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : ''

const normalizeReview = (item) => ({
  id:           item.id,
  rating:       Number(item.rating ?? 0),
  title:        item.title || '',
  content:      item.comment || item.content || '',
  date:         fmt(item.created_at),
  propertyName: item.property_name || item.property?.name || 'Property',
  roomName:     item.room_name     || item.room?.name     || 'Room',
  guestName:    item.customer_name || item.user?.name     || 'Guest',
  guestAvatar:  item.customer_avatar ?? item.customer_profile_picture ?? item.user?.avatar ?? item.user?.profile_picture ?? item.profile_picture ?? item.avatar ?? null,
  ownerReply:   item.owner_reply   || null,
  repliedAt:    fmt(item.replied_at),
  checkIn:      fmt(item.check_in_date),
  checkOut:     fmt(item.check_out_date),
})

// ── Stats ──────────────────────────────────────────────────────────────
const stats = computed(() => {
  const total   = reviews.value.length
  const replied = reviews.value.filter(r => r.ownerReply).length
  const avg     = total ? reviews.value.reduce((s, r) => s + r.rating, 0) / total : 0
  const dist    = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.value.filter(r => Math.round(r.rating) === star).length,
    pct:   total ? Math.round(reviews.value.filter(r => Math.round(r.rating) === star).length / total * 100) : 0,
  }))
  return { total, replied, unanswered: total - replied, avg, dist }
})

// ── Filter + Sort ──────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = [...reviews.value]
  if (activeFilter.value === 'unanswered') list = list.filter(r => !r.ownerReply)
  if (activeFilter.value === 'replied')    list = list.filter(r =>  r.ownerReply)
  if (activeFilter.value === '5star')      list = list.filter(r => r.rating >= 5)
  if (activeFilter.value === 'low')        list = list.filter(r => r.rating <= 3)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r =>
      r.guestName.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q)   ||
      r.propertyName.toLowerCase().includes(q)
    )
  }
  if (sortBy.value === 'newest')  list.sort((a, b) => new Date(b.date) - new Date(a.date))
  if (sortBy.value === 'oldest')  list.sort((a, b) => new Date(a.date) - new Date(b.date))
  if (sortBy.value === 'highest') list.sort((a, b) => b.rating - a.rating)
  if (sortBy.value === 'lowest')  list.sort((a, b) => a.rating - b.rating)
  return list
})

const distColor = (_star) => 'var(--color-primary)'

// ── Reply handlers ────────────────────────────────────────────────────
const handleReply = async ({ reviewId, reply }) => {
  try {
    // PATCH /reviews/:id/reply  body: { owner_reply: "..." }
    await reviewApi.replyToReview(reviewId, reply)
    const idx = reviews.value.findIndex(r => r.id === reviewId)
    if (idx !== -1) {
      reviews.value[idx] = {
        ...reviews.value[idx],
        ownerReply: reply,
        repliedAt: fmt(new Date().toISOString()),
      }
    }
    toast.success(t("owner.reviews.replyPosted"))
  } catch (err) {
    toast.error(err?.response?.data?.message || t("owner.reviews.replyPostFailed"))
    throw err  // re-throw so OwnerReviewCard keeps compose open
  }
}

const handleDeleteReply = async (reviewId) => {
  try {
    // PATCH /reviews/:id/reply  body: { owner_reply: null }
    await reviewApi.replyToReview(reviewId, null)
    const idx = reviews.value.findIndex(r => r.id === reviewId)
    if (idx !== -1) reviews.value[idx] = { ...reviews.value[idx], ownerReply: null, repliedAt: null }
    toast.success(t("owner.reviews.replyRemoved"))
  } catch (err) {
    toast.error(err?.response?.data?.message || t("owner.reviews.replyRemoveFailed"))
  }
}

onMounted(fetchReviews)
</script>

<template> <div class="owner-reviews ">

    <!-- Header -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-(--color-text)">{{ $t("owner.reviews.title") }}</h1>
        <p class="mt-1 text-sm text-(--color-muted)">{{ $t("owner.reviews.subtitle") }}</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-(--color-text) hover:bg-(--color-input)/50 transition shadow-sm"
        :disabled="loading"
        @click="fetchReviews"
      >
        <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        {{ $t("owner.reviews.refresh") }}
      </button>
    </header>

    <!-- Stat cards -->
    <section v-if="!loading && !error" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="stat-card">
        <div class="stat-icon bg-blue-500/10 text-blue-600">
          <ChatBubbleLeftRightIcon class="w-5 h-5" />
        </div>
        <div>
          <p class="stat-label">{{ $t("owner.reviews.stats.totalReviews") }}</p>
          <p class="stat-val">{{ stats.total }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-amber-500/10 text-amber-500">
          <StarSolid class="w-5 h-5" />
        </div>
        <div>
          <p class="stat-label">{{ $t("owner.reviews.stats.avgRating") }}</p>
          <p class="stat-val">{{ stats.avg.toFixed(1) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-emerald-500/10 text-emerald-600">
          <CheckBadgeIcon class="w-5 h-5" />
        </div>
        <div>
          <p class="stat-label">{{ $t("owner.reviews.stats.replied") }}</p>
          <p class="stat-val">{{ stats.replied }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange-500/10 text-orange-500">
          <ClockIcon class="w-5 h-5" />
        </div>
        <div>
          <p class="stat-label">{{ $t("owner.reviews.stats.needsReply") }}</p>
          <p class="stat-val text-amber-500">{{ stats.unanswered }}</p>
        </div>
      </div>
    </section>

    <!-- Rating distribution -->
    <section
      v-if="!loading && !error && stats.total > 0"
      class="rounded-xl border border-(--color-border) bg-(--color-surface) px-6 py-4 shadow-sm"
    >
      <p class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted) mb-3">{{ $t("owner.reviews.breakdown") }}</p>
      <div class="flex flex-col gap-2">
        <div v-for="d in stats.dist" :key="d.star" class="flex items-center gap-3">
          <span class="w-4 text-xs font-bold text-(--color-muted) text-right flex-shrink-0">{{ d.star }}</span>
          <StarSolid class="w-3 h-3 text-amber-400 flex-shrink-0" />
          <div class="flex-1 h-2 rounded-full bg-(--color-border) overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: d.pct + '%', background: distColor(d.star) }"
            />
          </div>
          <span class="w-4 text-xs font-semibold text-(--color-muted) text-right">{{ d.count }}</span>
        </div>
      </div>
    </section>

    <!-- Toolbar -->
    <section class="owner-toolbar">
      <!-- Filter tabs -->
      <div class="owner-filter-tabs">
        <button
          v-for="tab in [
            { key: 'all',        label: $t('owner.reviews.filters.all'),         count: stats.total },
            { key: 'unanswered', label: $t('owner.reviews.filters.needsReply'),  count: stats.unanswered },
            { key: 'replied',    label: $t('owner.reviews.filters.replied'),      count: stats.replied },
            { key: '5star',      label: $t('owner.reviews.filters.fiveStar') },
            { key: 'low',        label: $t('owner.reviews.filters.low') },
          ]"
          :key="tab.key"
          @click="activeFilter = tab.key"
          class="owner-filter-btn"
          :class="activeFilter === tab.key ? 'owner-filter-btn--active' : ''"
        >
          {{ tab.label }}
          <span
            v-if="tab.count !== undefined"
            class="owner-filter-count"
            :class="activeFilter === tab.key ? 'owner-filter-count--active' : ''"
          >{{ tab.count }}</span>
        </button>
      </div>

      <!-- Search + sort -->
      <div class="owner-search-sort">
        <div class="owner-search-wrap">
          <MagnifyingGlassIcon class="owner-search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('owner.reviews.search')"
            class="owner-search-input"
          />
        </div>
        <select v-model="sortBy" class="owner-sort-select">
          <option value="newest">{{ $t("owner.reviews.sort.newest") }}</option>
          <option value="oldest">{{ $t("owner.reviews.sort.oldest") }}</option>
          <option value="highest">{{ $t("owner.reviews.sort.highest") }}</option>
          <option value="lowest">{{ $t("owner.reviews.sort.lowest") }}</option>
        </select>
      </div>
    </section>

    <!-- Loading -->
    <OwnerLoadingState v-if="loading" :label="t('owner.reviews.loading')" />

    <!-- Error -->
    <section v-else-if="error" class="flex flex-col items-center gap-3 py-16 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
      <ExclamationTriangleIcon class="w-8 h-8 text-rose-500" />
      <p class="text-sm font-semibold text-rose-600">{{ error }}</p>
      <button @click="fetchReviews" class="px-4 py-2 bg-(--color-primary) text-white text-xs font-bold rounded-lg">
        {{ t("owner.reviews.tryAgain") }}
      </button>
    </section>

    <!-- Empty -->
    <section
      v-else-if="filtered.length === 0"
      class="flex flex-col items-center gap-3 py-20 rounded-2xl border-2 border-dashed border-(--color-border) text-(--color-muted) text-center"
    >
      <ChatBubbleLeftRightIcon class="w-10 h-10 opacity-30" />
      <p class="text-sm font-semibold">
        {{ searchQuery || activeFilter !== 'all' ? $t('owner.reviews.emptyFilter') : $t('owner.reviews.empty') }}
      </p>
    </section>

    <!-- Cards -->
    <section v-else class="space-y-4">
      <OwnerReviewCard
        v-for="review in filtered"
        :key="review.id"
        :review="review"
        @reply="handleReply"
        @delete-reply="handleDeleteReply"
      />
    </section>

  </div>
</template>

<style scoped>
.owner-reviews {
  padding: 0 24px 80px;
  background: var(--color-page);
}
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.stat-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-muted); }
.stat-val   { font-size: 1.6rem; font-weight: 800; color: var(--color-text); line-height: 1.1; }
/* ── Toolbar ── */
.owner-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (min-width: 640px) {
  .owner-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.owner-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.owner-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.owner-filter-btn:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
}
.owner-filter-btn--active {
  background: var(--color-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(59,130,246,0.25);
}

.owner-filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  padding: 1px 6px;
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 700;
  background: var(--color-border);
  color: var(--color-muted);
}
.owner-filter-count--active {
  background: rgba(255,255,255,0.22);
  color: #fff;
}

.owner-search-sort {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.owner-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.owner-search-icon {
  position: absolute;
  left: 10px;
  width: 15px;
  height: 15px;
  color: var(--color-muted);
  pointer-events: none;
  flex-shrink: 0;
}
.owner-search-input {
  padding: 8px 14px 8px 34px;
  font-size: 0.82rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  width: 220px;
  transition: border-color 0.18s;
}
.owner-search-input:focus {
  border-color: var(--color-primary);
}
.owner-search-input::placeholder {
  color: var(--color-muted);
}

.owner-sort-select {
  padding: 8px 12px;
  font-size: 0.8rem;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  transition: border-color 0.18s;
  white-space: nowrap;
}
.owner-sort-select:focus {
  border-color: var(--color-primary);
}
</style>