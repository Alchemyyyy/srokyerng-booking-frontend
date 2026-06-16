<template>
  <div class="rc-page">
    <PublicNavbar />

    <!-- ── ACCESS DENIED STATE ── -->
    <div v-if="pageReady && accessDenied" class="rc-access-denied">
      <div class="rc-access-denied-inner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>Access Denied</h2>
        <p>{{ accessError }}</p>
        <button class="rc-btn-cancel" @click="cancel">Back to My Reviews</button>
      </div>
    </div>

    <!-- ── LOADING STATE ── -->
    <div v-else-if="!pageReady" class="rc-access-denied">
      <div class="rc-access-denied-inner">
        <span class="rc-spinner" style="width:32px;height:32px;border-width:3px" />
        <p style="margin-top:16px;color:var(--rc-muted)">Verifying reservation…</p>
      </div>
    </div>

    <!-- ── HERO ── -->
    <section v-else class="rc-hero">
      <img class="rc-hero-img" src="../../../assets/images/reviews/banner/banner1.png" alt="banner" />
      <div class="rc-hero-overlay" />
      <div class="rc-hero-content">
        <div class="rc-hero-inner">
          <nav class="rc-breadcrumb">
            <span class="rc-bc-link" @click="router.back()">{{ $t('reviewCreate.breadcrumb.stays') }}</span>
            <span class="rc-bc-sep">›</span>
            <span class="rc-bc-link" @click="cancel">{{ $t('reviewCreate.breadcrumb.reviews') }}</span>
            <span class="rc-bc-sep">›</span>
            <span class="rc-bc-active">{{ $t('reviewCreate.breadcrumb.write') }}</span>
          </nav>
          <h1 class="rc-hero-title">{{ $t('reviewCreate.hero.title') }}</h1>
          <p class="rc-hero-sub">{{ $t('reviewCreate.hero.subtitle') }}</p>
          <div class="rc-hero-bottom">
            <div class="rc-hero-rating-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span class="rc-hero-score">{{ $t('reviewCreate.hero.score') }}</span>
              <span class="rc-hero-exceptional">{{ $t('reviewCreate.hero.label') }}</span>
              <span class="rc-hero-divider">·</span>
              <span class="rc-hero-count">{{ $t('reviewCreate.hero.count') }}</span>
            </div>
            <button class="rc-hero-write-btn" @click="document.querySelector('.rc-form-col').scrollIntoView({ behavior: 'smooth' })">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              {{ $t('reviewCreate.hero.writeReview') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── BODY ── -->
    <div v-if="pageReady && !accessDenied" class="rc-container rc-body">

      <!-- ── FORM CARD ── -->
      <main class="rc-form-col">
        <div class="rc-card">

          <!-- Header -->
          <div class="rc-card-header">
            <div class="rc-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <h2 class="rc-card-title">{{ $t('reviewCreate.form.title') }}</h2>
              <p class="rc-card-sub">{{ $t('reviewCreate.form.subtitle') }}</p>
            </div>
          </div>

          <!-- ── STEP 1: Rating ── -->
          <div class="rc-section">
            <div class="rc-section-head">
              <div class="rc-step-num">1</div>
              <h3 class="rc-section-title">
                {{ $t('reviewCreate.form.ratingHeading') }}
                <span class="rc-required">{{ $t('reviewCreate.form.required') }}</span>
              </h3>
            </div>

            <div class="rc-rating-block">
              <!-- Circular score -->
              <div class="rc-score-dial">
                <svg class="rc-dial-svg" viewBox="0 0 100 100">
                  <circle class="rc-dial-track" cx="50" cy="50" r="40" />
                  <circle
                    class="rc-dial-fill"
                    cx="50" cy="50" r="40"
                    :stroke="dialColor"
                    :stroke-dasharray="`${dialDash} 251.2`"
                  />
                </svg>
                <div class="rc-dial-center">
                  <span class="rc-dial-score">{{ form.rating }}.0</span>
                  <span class="rc-dial-label">{{ $t('reviewCreate.preview.outOf') }}</span>
                </div>
              </div>

              <div class="rc-rating-right">
                <RatingStars v-model="form.rating" size="lg" />
                <p class="rc-rating-label" :class="ratingColorClass">{{ ratingLabel }}</p>
                <p class="rc-rating-hint">{{ $t('reviewCreate.form.ratingRecommendation') }}</p>
              </div>
            </div>
            <div v-if="errors.rating" class="rc-error">{{ errors.rating }}</div>
          </div>

          <div class="rc-divider" />

          <!-- ── STEP 2: Comment ── -->
          <div class="rc-section">
            <div class="rc-section-head">
              <div class="rc-step-num">2</div>
              <h3 class="rc-section-title">
                {{ $t('reviewCreate.form.yourReview') }}
                <span class="rc-required">{{ $t('reviewCreate.form.required') }}</span>
              </h3>
            </div>
            <p class="rc-section-desc">{{ $t('reviewCreate.form.reviewContentPlaceholder') }}</p>

            <div class="rc-textarea-wrap" :class="{ 'has-error': errors.comment }">
              <textarea
                v-model="form.comment"
                rows="6"
                maxlength="500"
                :placeholder="$t('reviewCreate.form.reviewContentPlaceholder')"
                class="rc-textarea"
                @blur="validate('comment')"
              ></textarea>
              <span class="rc-char-count" :class="{ warn: form.comment.length > 450 }">
                {{ form.comment.length }}/500
              </span>
            </div>
            <div v-if="errors.comment" class="rc-error">{{ errors.comment }}</div>

            <!-- Prompt chips with emojis -->
            <div class="rc-prompts">
              <button
                v-for="prompt in prompts"
                :key="prompt.text"
                type="button"
                class="rc-prompt-chip"
                @click="appendPrompt(prompt.text)"
              >
                <span>{{ prompt.emoji }}</span> {{ prompt.label }}
              </button>
            </div>
          </div>

          <div class="rc-divider" />

          <!-- ── ACTIONS ── -->
          <div class="rc-actions">
            <button type="button" class="rc-btn-cancel" @click="cancel">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="rc-btn-submit"
              :disabled="submitting"
              @click="submitReview"
            >
              <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span v-if="submitting" class="rc-spinner" />
              {{ submitting ? $t('reviewCreate.form.submitting') : $t('reviewCreate.form.submitReview') }}
            </button>
          </div>

          <!-- Success -->
          <transition name="rc-fade">
            <div v-if="submitSuccess" class="rc-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ $t('reviewCreate.form.submitReview') }}! {{ $t('common.loading') }}…
            </div>
          </transition>

        </div>
      </main>

      <!-- ── SIDEBAR ── -->
      <aside class="rc-sidebar">

        <!-- Live preview -->
        <div class="rc-side-card rc-preview-card">
          <h4 class="rc-side-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ $t('reviewCreate.preview.title') }}
          </h4>
          <div class="rc-preview-body">
            <div class="rc-preview-rating-row">
              <RatingStars :model-value="form.rating" readonly size="sm" />
              <span class="rc-preview-score">{{ form.rating }}.0</span>
              <span class="rc-preview-label" :class="ratingColorClass">{{ ratingLabel }}</span>
            </div>
            <div class="rc-preview-quote">
              <svg class="rc-quote-icon" width="28" height="28" viewBox="0 0 24 24" fill="var(--color-border)"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
              <p class="rc-preview-text">{{ form.comment || $t('reviewCreate.preview.defaultText') }}</p>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="rc-side-card">
          <h4 class="rc-side-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            {{ $t('reviewCreate.progress.title') }}
          </h4>
          <div class="rc-progress-bar-wrap">
            <div class="rc-progress-track">
              <div class="rc-progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="rc-progress-pct">{{ progress }}%</span>
          </div>
          <div class="rc-checklist">
            <div class="rc-check-item" :class="{ done: form.rating > 0 }">
              <div class="rc-check-icon">
                <svg v-if="form.rating > 0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>{{ $t('reviewCreate.progress.steps.overallRating') }}</span>
            </div>
            <div class="rc-check-item" :class="{ done: form.comment.trim().length >= 20 }">
              <div class="rc-check-icon">
                <svg v-if="form.comment.trim().length >= 20" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>{{ $t('reviewCreate.progress.steps.yourReview') }}</span>
            </div>
          </div>
        </div>

        <!-- Property card -->
        <div class="rc-side-card rc-property-card">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"
            alt="Property"
            class="rc-property-img"
          />
          <div class="rc-property-info">
            <span class="rc-property-tag">{{ $t('reviewCreate.hotelCard.name') }}</span>
            <p class="rc-property-name">Test Hotel</p>
            <div class="rc-property-rating">
              <RatingStars :model-value="4.9" readonly size="sm" />
              <span>4.9</span>
              <span class="rc-review-count">(128 {{ $t('propertyDetail.reviews') }})</span>
            </div>
            <div class="rc-property-loc">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ $t('reviewCreate.hotelCard.location') }}
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="rc-side-card">
          <h4 class="rc-side-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ $t('reviewCreate.tips.title') }}
          </h4>
          <ul class="rc-tips">
            <li>{{ $t('reviewCreate.tips.roomQuality') }}</li>
            <li>{{ $t('reviewCreate.tips.staff') }}</li>
            <li>{{ $t('reviewCreate.tips.value') }}</li>
            <li>{{ $t('reviewCreate.tips.specific') }}</li>
          </ul>
        </div>

      </aside>
    </div>

    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RatingStars from '../components/RatingStars.vue'
import reviewService from '../services/reviewService.js'
import http from '@/app/api/http'
import { useToastStore } from '@/shared/store/toastStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'
import PublicFooter from '@/shared/components/PublicFooter.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToastStore()

const reservationId = computed(() => route.params.reservationId || '')

// ── Access guard state ──
const pageReady = ref(false)
const accessDenied = ref(false)
const accessError = ref('')

// ── Verify reservation ownership & status before showing the form ──
// onMounted(async () => {
//   if (!reservationId.value) {
//     router.replace({ path: '/customer/reviews' })
//     return
//   }
//   try {
//     const res = await http.get(`/reservations/${reservationId.value}`)
//     const reservation = res?.data

//     if (!reservation) {
//       accessDenied.value = true
//       accessError.value = 'Reservation not found.'
//       return
//     }
//     if (reservation.reservation_status !== 'completed') {
//       accessDenied.value = true
//       accessError.value = 'You can only review completed stays.'
//       return
//     }
//   } catch (err) {
//     // 403 = not your reservation, 404 = doesn't exist
//     accessDenied.value = true
//     accessError.value =
//       err?.response?.status === 403
//         ? 'You do not have access to this reservation.'
//         : 'Reservation not found.'
//   } finally {
//     pageReady.value = true
//   }
// })

onMounted(() => {
  if (!reservationId.value) {
    router.replace({ path: '/customer/reviews' })
    return
  }
  pageReady.value = true
})

// ── Form state ──
const form = ref({ rating: 5, comment: '' })
const errors = ref({})
const submitting = ref(false)
const submitSuccess = ref(false)

// ── Prompt chips with emoji ──
const prompts = computed(() => [
  { emoji: '✨', label: t('reviewCreate.form.tags.greatService'), text: t('reviewCreate.form.tags.greatService') },
  { emoji: '🛏️', label: t('reviewCreate.form.tags.cleanRooms'),   text: t('reviewCreate.form.tags.cleanRooms') },
  { emoji: '📍', label: t('reviewCreate.form.tags.greatLocation'), text: t('reviewCreate.form.tags.greatLocation') },
  { emoji: '💎', label: t('reviewCreate.form.tags.greatValue'),    text: t('reviewCreate.form.tags.greatValue') },
  { emoji: '😊', label: t('reviewCreate.form.tags.familyFriendly'),text: t('reviewCreate.form.tags.familyFriendly') },
])

const appendPrompt = (text) => {
  const sep = form.value.comment.trim() ? ' ' : ''
  form.value.comment = (form.value.comment + sep + text).slice(0, 500)
}

// ── Rating helpers ──
const ratingLabel = computed(() => {
  const key = ['', 'poor', 'fair', 'good', 'veryGood', 'excellent'][form.value.rating] || 'excellent'
  const fallback = { poor: 'Poor', fair: 'Fair', good: 'Good', veryGood: 'Very Good', excellent: 'Excellent' }
  const translated = t(`reviewCreate.ratingLabel.${key}`)
  // if key not found, vue-i18n returns the key string itself — use fallback instead
  return translated.includes('reviewCreate') ? fallback[key] : translated
})
const ratingColorClass = computed(() => {
  if (form.value.rating >= 5) return 'color-excellent'
  if (form.value.rating >= 4) return 'color-good'
  if (form.value.rating >= 3) return 'color-ok'
  return 'color-poor'
})

// ── Circular dial ──
const dialColor = computed(() => {
  if (form.value.rating >= 5) return '#15803d'
  if (form.value.rating >= 4) return '#1268b4'
  if (form.value.rating >= 3) return '#dab773'
  return '#b42318'
})
const dialDash = computed(() => (form.value.rating / 5) * 251.2)

// ── Progress ──
const progress = computed(() => {
  let score = 0
  if (form.value.rating > 0) score += 50
  if (form.value.comment.trim().length >= 20) score += 50
  return score
})

// ── Validation ──
const validate = (field) => {
  if (field === 'rating') {
    if (!form.value.rating) errors.value.rating = t('reviewCreate.errors.ratingRequired')
    else delete errors.value.rating
  }
  if (field === 'comment') {
    if (!form.value.comment.trim()) errors.value.comment = t('reviewCreate.errors.contentRequired')
    else if (form.value.comment.trim().length < 20) errors.value.comment = t('reviewCreate.errors.contentMinLength')
    else delete errors.value.comment
  }
}

const validateAll = () => {
  validate('rating')
  validate('comment')
  return Object.keys(errors.value).length === 0
}

// ── Submit ──
const submitReview = async () => {
  if (!validateAll()) return
  if (!reservationId.value) return

  submitting.value = true
  try {
    await reviewService.createReview(reservationId.value, {
      rating: form.value.rating,
      comment: form.value.comment.trim(),
    })
    submitSuccess.value = true
    setTimeout(() => router.push({ path: '/customer/reviews' }), 1600)
  } catch (err) {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.message
    if (status === 403) {
      errors.value.comment = 'You do not have access to this reservation.'
    } else if (status === 400) {
      errors.value.comment = msg || t('reviewCreate.errors.contentRequired')
    } else if (status === 409 || (msg && msg.toLowerCase().includes('already'))) {
      errors.value.comment = 'You have already reviewed this reservation.'
      toast.info(t('reviewCreate.errors.alreadyReviewed'))
      setTimeout(() => router.push({ path: '/customer/reviews' }), 1800)
    } else {
      errors.value.comment = msg || t('reviewCreate.errors.contentRequired')
    }
  } finally {
    submitting.value = false
  }
}

const cancel = () => router.push({ path: '/customer/reviews' })
</script>

<style scoped>
.rc-page {
  --rc-bg:           var(--color-page);
  --rc-card:         var(--color-surface);
  --rc-border:       var(--color-border);
  --rc-text:         var(--color-text);
  --rc-muted:        var(--color-muted);
  --rc-primary:      var(--color-primary);
  --rc-primary-dark: var(--color-primary-strong);
  --rc-success:      var(--color-success);
  --rc-error:        var(--color-danger);
  background: var(--rc-bg);
  min-height: 100vh;
  font-family: var(--font-main);
}

/* ── Hero ── */
.rc-hero {
  position: relative;
  height: 420px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.rc-hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 50%;
}

.rc-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(4,14,35,0.82) 0%,
    rgba(4,14,35,0.55) 50%,
    rgba(4,14,35,0.15) 100%
  );
}

.rc-hero-content {
  position: relative;
  width: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
}

.rc-hero-inner {
  max-width: 560px;
  padding: 0 32px;
  margin-left : 120px;
  margin-top: 40px;
}

.rc-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
  width: 100%;
}

.rc-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.55);
  margin-bottom: 10px;
}

.rc-bc-link { color: rgba(255,255,255,0.75); cursor: pointer; transition: color 0.15s; }
.rc-bc-link:hover { color: #fff; }
.rc-bc-sep { opacity: 0.4; }
.rc-bc-active { color: #fff; font-weight: 600; }

.rc-hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  line-height: 1.12;
}

.rc-hero-sub {
  color: rgba(255,255,255,0.78);
  font-size: 1rem;
  margin: 0 0 24px;
  line-height: 1.55;
  max-width: 400px;
}

/* Hero bottom row */
.rc-hero-bottom {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.rc-hero-rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(8px);
  border-radius: 99px;
  padding: 8px 16px;
  color: #fff;
  font-size: 0.88rem;
}

.rc-hero-score {
  font-weight: 800;
  font-size: 1rem;
}

.rc-hero-exceptional {
  font-weight: 600;
}

.rc-hero-divider {
  opacity: 0.45;
}

.rc-hero-count {
  opacity: 0.7;
  font-size: 0.82rem;
}

.rc-hero-write-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 99px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  font-family: var(--font-secondary), var(--font-main);
}

.rc-hero-write-btn:hover {
  background: var(--color-primary-strong);
  transform: translateY(-1px);
}

/* ── Body layout ── */
.rc-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  padding-top: 28px;
  padding-bottom: 60px;
  align-items: start;
}

/* ── Card ── */
.rc-card {
  background: var(--rc-card);
  border: 1px solid var(--rc-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.rc-card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--rc-border);
}

.rc-card-icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rc-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--rc-text);
  margin: 0 0 4px;
}

.rc-card-sub {
  font-size: 0.85rem;
  color: var(--rc-muted);
  margin: 0;
}

/* ── Section ── */
.rc-section { margin-bottom: 4px; }

.rc-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.rc-step-num {
  width: 26px;
  height: 26px;
  background: var(--rc-primary);
  color: #fff;
  border-radius: 50%;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rc-section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--rc-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rc-section-desc {
  font-size: 0.84rem;
  color: var(--rc-muted);
  margin: -8px 0 14px;
  line-height: 1.5;
}

.rc-required {
  font-size: 0.68rem;
  font-weight: 700;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.rc-divider {
  height: 1px;
  background: var(--rc-border);
  margin: 20px 0;
}

/* ── Rating block ── */
.rc-rating-block {
  display: flex;
  align-items: center;
  gap: 28px;
  background: var(--color-surface-soft);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  border: 1px solid var(--rc-border);
}

/* Circular dial */
.rc-score-dial {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.rc-dial-svg {
  width: 100px;
  height: 100px;
  transform: rotate(-90deg);
}

.rc-dial-track {
  fill: none;
  stroke: var(--rc-border);
  stroke-width: 8;
}

.rc-dial-fill {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.4s ease, stroke 0.3s ease;
}

.rc-dial-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rc-dial-score {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--rc-text);
  line-height: 1;
  letter-spacing: -0.03em;
}

.rc-dial-label {
  font-size: 0.65rem;
  color: var(--rc-muted);
  margin-top: 2px;
}

.rc-rating-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rc-rating-label {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  transition: color 0.2s;
}

.rc-rating-hint {
  font-size: 0.78rem;
  color: var(--rc-muted);
  margin: 0;
}

.color-excellent { color: var(--color-success); }
.color-good      { color: var(--color-primary); }
.color-ok        { color: var(--color-warning); }
.color-poor      { color: var(--color-danger); }

/* ── Textarea ── */
.rc-textarea-wrap {
  border: 1.5px solid var(--rc-border);
  border-radius: var(--radius-md);
  background: var(--color-input);
  transition: border-color 0.15s;
  overflow: hidden;
}

.rc-textarea-wrap:focus-within { border-color: var(--rc-primary); }
.rc-textarea-wrap.has-error    { border-color: var(--color-danger); }

.rc-textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: 14px 16px;
  font-size: 0.9rem;
  color: var(--rc-text);
  line-height: 1.6;
  resize: none;
  font-family: var(--font-secondary);
  background: transparent;
  box-sizing: border-box;
}

.rc-textarea::placeholder { color: var(--rc-muted); opacity: 0.6; }

.rc-char-count {
  display: block;
  text-align: right;
  font-size: 0.74rem;
  color: var(--rc-muted);
  padding: 0 14px 10px;
}

.rc-char-count.warn { color: var(--color-warning); }

/* Prompt chips */
.rc-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.rc-prompt-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--rc-text);
  background: var(--rc-card);
  border: 1.5px solid var(--rc-border);
  border-radius: 99px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  font-family: var(--font-secondary), var(--font-main);
}

.rc-prompt-chip:hover {
  background: var(--color-primary-soft);
  border-color: var(--rc-primary);
  color: var(--rc-primary);
}

/* ── Error ── */
.rc-error {
  font-size: 0.82rem;
  color: var(--color-danger);
  margin-top: 6px;
}

/* ── Actions ── */
.rc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.rc-btn-cancel {
  padding: 11px 22px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--rc-muted);
  background: transparent;
  border: 1.5px solid var(--rc-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: var(--font-secondary), var(--font-main);
}

.rc-btn-cancel:hover { background: var(--color-surface-soft); color: var(--rc-text); }

.rc-btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 26px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  background: var(--rc-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 4px 14px var(--color-focus-ring);
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  font-family: var(--font-secondary), var(--font-main);
}

.rc-btn-submit:hover:not(:disabled) {
  background: var(--rc-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px var(--color-focus-ring);
}

.rc-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.rc-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rc-spin 0.6s linear infinite;
}

@keyframes rc-spin { to { transform: rotate(360deg); } }

.rc-success {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-success-soft);
  color: var(--color-success);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-sm);
  padding: 13px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-top: 16px;
}

.rc-fade-enter-active, .rc-fade-leave-active { transition: opacity 0.3s; }
.rc-fade-enter-from,   .rc-fade-leave-to    { opacity: 0; }

/* ── Sidebar ── */
.rc-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 80px;
}

.rc-side-card {
  background: var(--rc-card);
  border: 1px solid var(--rc-border);
  border-radius: var(--radius-md);
  padding: 18px;
  box-shadow: var(--shadow-card);
}

.rc-side-title {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--rc-primary);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Preview card */
.rc-preview-card { border-color: var(--rc-border); }

.rc-preview-body { display: flex; flex-direction: column; gap: 10px; }

.rc-preview-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rc-preview-score {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--rc-text);
}

.rc-preview-label { font-size: 0.78rem; font-weight: 700; }

.rc-preview-quote {
  position: relative;
  padding-top: 4px;
}

.rc-quote-icon {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0.4;
}

.rc-preview-text {
  font-size: 0.84rem;
  color: var(--rc-muted);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
  min-height: 56px;
  padding-right: 32px;
}

/* Progress */
.rc-progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.rc-progress-track {
  flex: 1;
  height: 6px;
  background: var(--rc-border);
  border-radius: 99px;
  overflow: hidden;
}

.rc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  border-radius: 99px;
  transition: width 0.4s ease;
}

.rc-progress-pct {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--rc-primary);
  min-width: 32px;
  text-align: right;
}

.rc-checklist { display: flex; flex-direction: column; gap: 8px; }

.rc-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--rc-muted);
  transition: color 0.2s;
  font-family: var(--font-secondary);
}

.rc-check-item.done { color: var(--rc-text); }

.rc-check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--rc-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
}

.rc-check-item.done .rc-check-icon {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

/* Property card */
.rc-property-card { padding: 0; overflow: hidden; }

.rc-property-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.rc-property-info { padding: 14px; }

.rc-property-tag {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--rc-primary);
}

.rc-property-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--rc-text);
  margin: 4px 0 6px;
}

.rc-property-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--rc-text);
  margin-bottom: 5px;
}

.rc-review-count {
  font-size: 0.76rem;
  color: var(--rc-muted);
  font-weight: 400;
}

.rc-property-loc {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  color: var(--rc-muted);
}

/* Tips */
.rc-tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rc-tips li {
  font-size: 0.81rem;
  color: var(--rc-muted);
  line-height: 1.45;
  padding-left: 14px;
  position: relative;
  font-family: var(--font-secondary);
}

.rc-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--rc-primary);
  font-weight: 700;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .rc-body {
    grid-template-columns: 1fr;
    padding-top: 20px;
  }

  .rc-sidebar { position: static; order: -1; }

  .rc-rating-block {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .rc-rating-right { align-items: center; }
  .rc-actions { flex-direction: column; }
  .rc-btn-cancel, .rc-btn-submit { width: 100%; justify-content: center; }
  .rc-hero { height: 300px; }
  .rc-hero-inner { padding: 0 20px; }
}

/* ── Access denied / loading gate ── */
.rc-access-denied {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rc-bg);
}

.rc-access-denied-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 48px 32px;
  background: var(--rc-card);
  border: 1px solid var(--rc-border);
  border-radius: var(--radius-md);
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.rc-access-denied-inner h2 {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--rc-text);
  margin: 0;
}

.rc-access-denied-inner p {
  font-size: 0.9rem;
  color: var(--rc-muted);
  margin: 0;
  line-height: 1.5;
}

</style>