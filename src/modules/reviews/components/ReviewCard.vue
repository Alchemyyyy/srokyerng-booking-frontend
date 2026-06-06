<template>
  <div class="review-card">
    <!-- Left: User Info -->
    <div class="user-panel">
      <div class="avatar" :style="{ background: getAvatarGradient(review.user.name) }">
        <span>{{ getAvatarText(review.user) }}</span>
      </div>
      <div class="user-info">
        <div class="user-name">{{ review.user.name }}</div>
        <div class="verified-badge">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="6" fill="#2563eb"/>
            <path d="M3.5 6l1.5 1.5 3-3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('reviewCard.verifiedGuest') }}
        </div>
        <div class="user-country">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {{ review.user.country }}
        </div>
        <div class="user-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {{ review.user.type }}
        </div>
        <div class="user-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {{ review.nights || '2 nights' }} · {{ review.stayDate || 'May 2024' }}
        </div>
      </div>
    </div>

    <!-- Right: Review Content -->
    <div class="review-content">
      <div class="review-top">
        <div class="rating-row">
          <RatingStars :model-value="review.rating" readonly size="sm" />
          <span class="rating-num">{{ review.rating.toFixed(1) }}</span>
          <span class="review-date">{{ review.date }}</span>
        </div>
        <h3 class="review-title">{{ review.title }}</h3>
        <p class="review-text">{{ review.content }}</p>
      </div>

      <!-- Tags -->
      <div class="tags">
        <span v-for="tag in review.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <!-- Image -->
      <div v-if="review.image" class="image-wrap">
        <img :src="review.image" :alt="t('reviewCard.photoAlt')" class="review-img" />
        <div class="image-count" v-if="review.imageCount">+{{ review.imageCount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import RatingStars from './RatingStars.vue'

const { t } = useI18n({ useScope: 'global' })

defineProps({
  review: { type: Object, required: true }
})

const getAvatarText = (user) => {
  const avatar = user?.avatar?.trim()
  if (avatar) return avatar

  const name = user?.name?.trim() || ''
  if (!name) return '?'

  const words = name.split(' ').filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const getAvatarGradient = (name) => {
  if (!name) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ]
  return gradients[name.charCodeAt(0) % gradients.length]
}
</script>

<style scoped>
.review-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 28px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* User Panel */
.user-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.user-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  width: fit-content;
}

.user-country,
.user-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
}

.user-country svg,
.user-meta-item svg {
  opacity: 0.6;
  flex-shrink: 0;
}

/* Review Content */
.review-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-num {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
}

.review-date {
  font-size: 0.82rem;
  color: #94a3b8;
  margin-left: auto;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.review-text {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f1f5f9;
  color: #475569;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  transition: background 0.15s;
}

.tag:hover {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

/* Image */
.image-wrap {
  position: relative;
  width: 140px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.review-img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}

.image-count {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.75);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px 0 10px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .review-card {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }

  .user-panel {
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .user-info {
    flex: 1;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .review-card {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.06);
  }

  .user-name, .review-title { color: #f1f5f9; }
  .user-country, .user-meta-item, .review-text { color: #94a3b8; }
  .tag { background: #1e3a5f; color: #93c5fd; border-color: #1e40af; }
  .verified-badge { background: #1e3a5f; }
  .rating-num { color: #f1f5f9; }
}
</style>