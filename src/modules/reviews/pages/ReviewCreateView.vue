<template>
  <div class="review-create-page">
    <PublicNavbar />
    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <img
        class="hero-image"
        src="@/assets/images/reviews/banner/banner.jpeg"
        alt="Review Image"
      />
      <div class="hero-content">
        <nav class="breadcrumb">
          <span>Home</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Stays</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Grand Palace Hotel</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span class="breadcrumb-current">Write a Review</span>
        </nav>

        <h1>Write a Review</h1>
        <p class="hero-subtitle">
          Share your experience and help other travelers make great choices.
        </p>

        <div class="hero-rating-badge">
          <span class="star-icon">★</span>
          <span class="rating-value">4.9</span>
          <span class="rating-label">Exceptional</span>
          <span class="divider">·</span>
          <span class="review-count">1,284 reviews</span>
        </div>
      </div>
    </section>

    <!-- FORM SECTION -->
    <div class="form-wrapper">
      <div class="form-container">
        <!-- Main form panel -->
        <div class="form-panel">
          <h2>Share Your Experience</h2>
          <p class="form-subtitle">
            Your honest feedback helps future guests make informed decisions.
          </p>

          <!-- Overall Rating -->
          <div class="form-group">
            <label class="form-label">Overall Rating</label>
            <RatingStars v-model="form.rating" />
          </div>

          <!-- Title -->
          <div class="form-group">
            <label class="form-label">Review Title</label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Summarize your stay in a few words..."
            />
          </div>

          <!-- Comment -->
          <div class="form-group">
            <label class="form-label">Your Review</label>
            <textarea
              v-model="form.comment"
              class="form-textarea"
              placeholder="Tell us about the cleanliness, service, location, and overall experience..."
            ></textarea>
            <span class="char-count">{{ form.comment.length }} / 2000</span>
          </div>

          <!-- Category Ratings -->
          <div class="form-group">
            <label class="form-label">Rate by Category</label>
            <div class="category-ratings">
              <div
                class="category-row"
                v-for="cat in categories"
                :key="cat.key"
              >
                <div class="cat-icon">
                  <span v-html="cat.icon"></span>
                </div>
                <span class="cat-name">{{ cat.label }}</span>
                <div class="cat-stars">
                  <button
                    v-for="s in 5"
                    :key="s"
                    class="cat-star"
                    :class="{ filled: s <= (catRatings[cat.key] || 0) }"
                    @click="catRatings[cat.key] = s"
                    type="button"
                  >
                    ★
                  </button>
                </div>
                <span class="cat-value">{{ catRatings[cat.key] || 0 }}.0</span>
              </div>
            </div>
          </div>

          <!-- Traveler Type -->
          <div class="form-group">
            <label class="form-label">Traveler Type</label>
            <div class="traveler-types">
              <button
                v-for="type in travelerTypes"
                :key="type"
                class="traveler-btn"
                :class="{ selected: form.travelerType === type }"
                @click="form.travelerType = type"
                type="button"
              >
                {{ type }}
              </button>
            </div>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <button class="cancel-btn" type="button" @click="$router.back()">
              Cancel
            </button>
            <button
              class="submit-btn"
              type="button"
              @click="submitReview"
              :disabled="submitting"
            >
              <span v-if="!submitting">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 20h9" />
                  <path
                    d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                  />
                </svg>
                Submit Review
              </span>
              <span v-else>Submitting...</span>
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="form-sidebar">
          <!-- Review Guidelines -->
          <div class="sidebar-card">
            <h4>Review Guidelines</h4>
            <ul class="guidelines-list">
              <li v-for="guide in guidelines" :key="guide.title">
                <div class="guide-icon" v-html="guide.icon"></div>
                <div>
                  <strong>{{ guide.title }}</strong>
                  <p>{{ guide.desc }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Need Help -->
          <div class="sidebar-card help-card">
            <div class="help-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
            </div>
            <div>
              <strong>Need Help?</strong>
              <p>Our guest support team is here to assist you 24/7</p>
              <a href="#" class="contact-link">Contact Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import RatingStars from "../components/RatingStars.vue";
import { createReview } from "../services/reviewService.js";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";

const form = reactive({
  rating: 5,
  title: "",
  comment: "",
  travelerType: "Solo Traveler",
});

const catRatings = reactive({
  cleanliness: 0,
  service: 0,
  location: 0,
  value: 0,
  comfort: 0,
});

const submitting = ref(false);

const categories = [
  { key: "cleanliness", label: "Cleanliness", icon: "🧹" },
  { key: "service", label: "Service", icon: "🛎️" },
  { key: "location", label: "Location", icon: "📍" },
  { key: "value", label: "Value for money", icon: "💰" },
  { key: "comfort", label: "Comfort", icon: "🛏️" },
];

const travelerTypes = [
  "Solo Traveler",
  "Couple",
  "Family",
  "Business",
  "Friends",
];

const guidelines = [
  {
    title: "Be honest and respectful",
    desc: "Share your genuine experience",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`,
  },
  {
    title: "Focus on your stay",
    desc: "Comment on the property, service, and amenities",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  },
  {
    title: "Avoid personal details",
    desc: "Do not share personal information about yourself or others",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
  {
    title: "Photos are welcome",
    desc: "Add photos to help others see what to expect",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  },
];

const submitReview = async () => {
  if (!form.comment.trim() || !form.rating) return;
  submitting.value = true;
  try {
    // Integrate with real API:
    // await createReview(reservationId, { ...form, ...catRatings });
    console.log("Submitting:", { ...form, catRatings });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.review-create-page {
  min-height: 100vh;
  background: #f9fafb;
  font-family:
    "Segoe UI",
    system-ui,
    -apple-system,
    sans-serif;
}

/* HERO */
.hero {
  position: relative;
  height: 340px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 30, 70, 0.45) 0%,
    rgba(10, 30, 70, 0.85) 100%
  );
  z-index: 1;
}

.hero-content {
  position: absolute;
  z-index: 2;
  left: 80px;
  bottom: 40px;
  color: white;
  max-width: 600px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.breadcrumb-current {
  color: white;
  font-weight: 600;
}

.hero-content h1 {
  font-size: 42px;
  font-weight: 800;
  margin: 0 0 10px;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px;
}

.hero-rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
}

.star-icon {
  color: #f59e0b;
  font-size: 18px;
}
.rating-value {
  font-size: 20px;
  font-weight: 800;
}
.divider {
  color: rgba(255, 255, 255, 0.5);
}
.review-count {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

/* FORM WRAPPER */
.form-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
  align-items: start;
}

/* FORM PANEL */
.form-panel {
  background: white;
  border-radius: 20px;
  padding: 36px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.05);
}

.form-panel h2 {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px;
}

.form-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 28px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #1a56db;
}

.form-textarea {
  width: 100%;
  height: 160px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px;
  color: #111827;
  outline: none;
  resize: none;
  line-height: 1.6;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #1a56db;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

/* Category ratings */
.category-ratings {
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.category-row:last-child {
  border-bottom: none;
}

.cat-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
}
.cat-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex: 1;
}

.cat-stars {
  display: flex;
  gap: 3px;
}

.cat-star {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #d1d5db;
  padding: 0;
  transition:
    color 0.15s,
    transform 0.1s;
}

.cat-star.filled {
  color: #f59e0b;
}
.cat-star:hover {
  transform: scale(1.2);
}

.cat-value {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  min-width: 28px;
  text-align: right;
}

/* Traveler type */
.traveler-types {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.traveler-btn {
  padding: 8px 18px;
  border: 1.5px solid #e5e7eb;
  border-radius: 30px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.traveler-btn:hover {
  border-color: #1a56db;
  color: #1a56db;
}

.traveler-btn.selected {
  border-color: #1a56db;
  background: #eff6ff;
  color: #1a56db;
  font-weight: 600;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.cancel-btn {
  height: 48px;
  padding: 0 24px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.submit-btn {
  height: 48px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background: #1a56db;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #1447c0;
  box-shadow: 0 4px 14px rgba(26, 86, 219, 0.35);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* SIDEBAR */
.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.05);
}

.sidebar-card h4 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
}

.guidelines-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guidelines-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.guide-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guidelines-list strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.guidelines-list p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.help-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.help-icon {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #1a56db;
}

.help-card strong {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.help-card p {
  margin: 4px 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.contact-link {
  font-size: 13px;
  color: #1a56db;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .form-container {
    grid-template-columns: 1fr;
  }

  .hero-content {
    left: 24px;
  }
}
</style>
