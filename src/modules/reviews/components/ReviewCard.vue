<template>
  <div class="review-card">

    <!-- LEFT: Reviewer info -->
    <div class="reviewer-col">
      <div class="avatar" :style="{ background: avatarColor }">
        {{ initials }}
      </div>
      <div class="reviewer-info">
        <h4 class="reviewer-name">{{ review.user?.name || "Anonymous" }}</h4>
        <span class="verified-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Verified Guest
        </span>
        <p class="meta-row">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          {{ review.country || "United States" }}
        </p>
        <p class="meta-row">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          {{ review.travelerType || "Solo Traveler" }}
        </p>
        <p class="meta-row">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ review.stayInfo || "1 night · April 2024" }}
        </p>
      </div>
    </div>

    <!-- CENTER: Review content -->
    <div class="review-content">
      <div class="stars-row">
        <span
          v-for="s in 5"
          :key="s"
          class="star"
          :class="{ filled: s <= review.rating }"
        >★</span>
        <span class="rating-num">{{ review.rating?.toFixed(1) }}</span>
        <span class="review-date">{{ formatDate(review.created_at) }}</span>
      </div>
      <h3 class="review-title">{{ review.title || "Great experience!" }}</h3>
      <p class="review-comment">{{ review.comment }}</p>
      <div class="tag-list" v-if="review.tags?.length">
        <span class="tag" v-for="tag in review.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <!-- RIGHT: Photo -->
    <div class="review-photo" v-if="review.photo">
      <img :src="review.photo" :alt="review.title" />
      <span class="photo-count" v-if="review.photoCount">+{{ review.photoCount }}</span>
    </div>

  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  review: { type: Object, required: true },
});

const avatarColors = [
  "linear-gradient(135deg, #1a56db, #3b82f6)",
  "linear-gradient(135deg, #0e9f6e, #34d399)",
  "linear-gradient(135deg, #7e3af2, #a78bfa)",
  "linear-gradient(135deg, #e3a008, #fbbf24)",
];

const initials = computed(() => {
  const name = props.review.user?.name || "U";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
});

const avatarColor = computed(() => {
  const idx = (props.review.id || 0) % avatarColors.length;
  return avatarColors[idx];
});

const formatDate = (dateStr) => {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  if (diff < 7)  return `${diff} days ago`;
  if (diff < 14) return "1 week ago";
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  if (diff < 60) return "1 month ago";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};
</script>

<style scoped>
.review-card {
  display: flex;
  gap: 24px;
  padding: 28px 0;
  border-bottom: 1px solid #f1f5f9;
  align-items: flex-start;
}
.review-card:last-child { border-bottom: none; }

/* Reviewer column */
.reviewer-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}
.avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 17px;
  color: white; flex-shrink: 0;
  letter-spacing: 0.5px;
}
.reviewer-info {
  text-align: center;
  display: flex; flex-direction: column;
  align-items: center; gap: 5px;
}
.reviewer-name {
  font-size: 14px; font-weight: 700;
  color: #111827; margin: 0;
}
.verified-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: #eff6ff; color: #1a56db;
  font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 20px;
}
.meta-row {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #6b7280; margin: 0;
}

/* Review content */
.review-content { flex: 1; min-width: 0; }
.stars-row {
  display: flex; align-items: center; gap: 2px;
  margin-bottom: 8px;
}
.star { font-size: 16px; color: #d1d5db; }
.star.filled { color: #f59e0b; }
.rating-num { font-size: 14px; font-weight: 700; color: #111827; margin-left: 6px; }
.review-date { font-size: 13px; color: #9ca3af; margin-left: 10px; }
.review-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0 0 8px; }
.review-comment {
  font-size: 14px; color: #4b5563;
  line-height: 1.7; margin: 0 0 14px;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 7px; }
.tag {
  background: #f3f4f6; color: #374151;
  font-size: 12px; padding: 4px 12px;
  border-radius: 20px; font-weight: 500;
}

/* Photo */
.review-photo { position: relative; flex-shrink: 0; }
.review-photo img {
  width: 100px; height: 80px;
  object-fit: cover; border-radius: 10px;
  display: block;
}
.photo-count {
  position: absolute; bottom: 6px; right: 6px;
  background: rgba(0,0,0,0.65);
  color: white; font-size: 11px; font-weight: 700;
  padding: 2px 6px; border-radius: 6px;
}
</style>