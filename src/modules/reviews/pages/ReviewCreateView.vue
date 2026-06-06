<template>
  <div class="create-page">
    <PublicNavbar />
    <!-- ── HERO ── -->

    <section class="create-hero">
      <img
        class="hero-bg"
        src="../../../assets/images/reviews/banner/banner1.png"
        alt="banner"
      />
      <div class="create-hero-overlay" />

      <div class="container">
        <nav class="breadcrumb">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span class="breadcrumb-link" @click="router.back()">{{
            t("reviewCreate.breadcrumb.stays")
          }}</span>
          <span class="sep">›</span>
          <span>Grand Palace Hotel</span>
          <span class="sep">›</span>
          <span class="breadcrumb-link" @click="cancel">{{
            t("reviewCreate.breadcrumb.reviews")
          }}</span>
          <span class="sep">›</span>
          <span class="active-crumb">{{
            t("reviewCreate.breadcrumb.write")
          }}</span>
        </nav>
        <h1 class="hero-title">{{ t("reviewCreate.hero.title") }}</h1>
        <p class="hero-sub">{{ t("reviewCreate.hero.subtitle") }}</p>
        <div class="hero-badge-row">
          <!-- Rating Card -->
          <div class="glass-card">
            <div class="glass-star">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            </div>
            <span class="glass-score">{{ t("reviewCreate.hero.score") }}</span>
            <span class="glass-label">{{ t("reviewCreate.hero.label") }}</span>
            <span class="glass-divider">|</span>
            <span class="glass-count">{{ t("reviewCreate.hero.count") }}</span>
          </div>

          <!-- Write a Review Button -->
          <button class="btn-write-review" @click="goToWriteReview">
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
            {{ t("reviewCreate.hero.writeReview") }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── FORM LAYOUT ── -->
    <div class="container form-layout">
      <main class="form-main">
        <div ref="reviewForm" class="form-card">
          <div class="form-card-header">
            <div class="header-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                stroke-width="2"
              >
                <path d="M12 20h9" />
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                />
              </svg>
            </div>
            <div>
              <h2 class="form-title">{{ t("reviewCreate.form.title") }}</h2>
              <p class="form-subtitle">{{ t("reviewCreate.form.subtitle") }}</p>
            </div>
          </div>

          <div class="form-grid">
            <section class="section-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">1</span>
                  <h3>{{ t("reviewCreate.form.ratingHeading") }}</h3>
                </div>
                <span class="panel-status">{{
                  t("reviewCreate.form.required")
                }}</span>
              </div>

              <div class="rating-hero">
                <div class="rating-score-card">
                  <div class="rating-score">{{ form.rating }}.0</div>
                </div>

                <div class="rating-content">
                  <RatingStars v-model="form.rating" size="lg" />

                  <h3>{{ ratingLabel }}</h3>

                  <p>
                    {{ t("reviewCreate.form.ratingRecommendation") }}
                  </p>
                </div>
              </div>

              <div class="experience-section">
                <div class="section-label">
                  {{ t("reviewCreate.form.experienceHeading") }}
                </div>

                <div class="experience-tags">
                  <button
                    v-for="tag in experienceTags"
                    :key="tag.labelKey"
                    class="tag-btn"
                    :class="{ active: selectedTags.includes(tag.labelKey) }"
                    @click="
                      selectedTags.includes(tag.labelKey)
                        ? selectedTags.splice(
                            selectedTags.indexOf(tag.labelKey),
                            1,
                          )
                        : selectedTags.push(tag.labelKey)
                    "
                    type="button"
                  >
                    <span class="tag-icon">{{ tag.icon }}</span>
                    {{ t(tag.labelKey) }}
                  </button>
                </div>
              </div>
            </section>

            <section class="section-panel mood-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">2</span>
                  <h3>{{ t("reviewCreate.form.moodHeading") }}</h3>
                </div>
                <span class="panel-status optional">{{
                  t("reviewCreate.form.optional")
                }}</span>
              </div>
              <div class="mood-selector">
                <button
                  v-for="mood in moods"
                  :key="mood"
                  class="mood-btn"
                  :class="{ active: selectedMood === mood }"
                  @click="selectedMood = mood"
                  type="button"
                >
                  {{ mood }}
                </button>
              </div>
            </section>

            <section class="section-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">3</span>
                  <h3>{{ t("reviewCreate.form.reviewTitle") }}</h3>
                </div>
                <span class="panel-status">{{
                  t("reviewCreate.form.required")
                }}</span>
              </div>
              <div class="input-wrap" :class="{ 'has-error': errors.title }">
                <input
                  id="review-title"
                  v-model="form.title"
                  type="text"
                  :placeholder="t('reviewCreate.form.reviewTitlePlaceholder')"
                  class="text-input"
                  maxlength="100"
                  @blur="validate('title')"
                />
                <span class="char-count">{{ form.title.length }}/100</span>
              </div>
              <div v-if="errors.title" class="error-msg">
                {{ errors.title }}
              </div>
            </section>

            <section class="section-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">4</span>
                  <h3>{{ t("reviewCreate.form.yourReview") }}</h3>
                </div>
                <span class="panel-status">{{
                  t("reviewCreate.form.required")
                }}</span>
              </div>
              <div
                class="textarea-wrap"
                :class="{ 'has-error': errors.content }"
              >
                <textarea
                  id="review-content"
                  v-model="form.content"
                  rows="6"
                  :placeholder="t('reviewCreate.form.reviewContentPlaceholder')"
                  class="textarea-input"
                  maxlength="2000"
                  @blur="validate('content')"
                ></textarea>
                <span class="char-count-bottom"
                  >{{ form.content.length }}/2000</span
                >
              </div>
              <div v-if="errors.content" class="error-msg">
                {{ errors.content }}
              </div>
            </section>

            <section class="section-panel category-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">5</span>
                  <h3>{{ t("reviewCreate.form.categoryHeading") }}</h3>
                </div>
                <span class="panel-status">{{
                  t("reviewCreate.form.required")
                }}</span>
              </div>
              <div class="category-grid">
                <div
                  v-for="cat in categories"
                  :key="cat.key"
                  class="cat-rating-row"
                >
                  <div class="cat-info">
                    <div class="cat-icon-wrap">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path :d="cat.icon" />
                      </svg>
                    </div>
                    <span class="cat-label">{{ t(cat.labelKey) }}</span>
                  </div>
                  <RatingStars v-model="form.categories[cat.key]" size="md" />
                  <span
                    class="cat-score-badge"
                    :class="getCategoryClass(form.categories[cat.key])"
                  >
                    {{ form.categories[cat.key] }}/5
                  </span>
                </div>
              </div>
            </section>

            <section class="section-panel travel-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">6</span>
                  <h3>{{ t("reviewCreate.form.travelerTypeHeading") }}</h3>
                </div>
                <span class="panel-status">{{
                  t("reviewCreate.form.required")
                }}</span>
              </div>
              <div class="traveler-types">
                <button
                  v-for="type in travelerTypes"
                  :key="type.value"
                  type="button"
                  class="type-btn"
                  :class="{ active: form.travelerType === type.value }"
                  @click="form.travelerType = type.value"
                >
                  <span class="type-emoji">{{ type.icon }}</span>
                  {{ t(type.labelKey) }}
                </button>
              </div>
            </section>

            <section class="section-panel photos-panel">
              <div class="panel-heading">
                <div>
                  <span class="section-number">7</span>
                  <h3>{{ t("reviewCreate.form.addPhotosHeading") }}</h3>
                </div>
                <span class="panel-status optional">{{
                  t("reviewCreate.form.optional")
                }}</span>
              </div>
              <div
                class="upload-zone"
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  stroke-width="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p class="upload-title">
                  {{ t("reviewCreate.form.uploadHint") }}
                </p>
                <p class="upload-sub">{{ t("reviewCreate.form.uploadSub") }}</p>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display: none"
                  @change="handleFiles"
                />
              </div>
              <div v-if="form.photos.length > 0" class="photo-previews">
                <div
                  v-for="(photo, i) in form.photos"
                  :key="i"
                  class="photo-thumb"
                >
                  <img :src="photo.url" :alt="'Photo ' + (i + 1)" />
                  <button class="remove-photo" @click="removePhoto(i)">
                    ×
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" type="button" @click="cancel">
              {{ t("common.cancel") }}
            </button>
            <button
              class="btn-submit"
              type="button"
              :class="{ loading: submitting }"
              :disabled="submitting"
              @click="submitReview"
            >
              <svg
                v-if="!submitting"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span v-if="submitting" class="spinner" />
              {{
                submitting
                  ? t("reviewCreate.form.submitting")
                  : t("reviewCreate.form.submitReview")
              }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="submitSuccess" class="success-banner">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Review submitted successfully! Redirecting...
            </div>
          </transition>
        </div>
      </main>

      <aside class="create-sidebar">
        <div class="sidebar-card progress-card">
          <div class="progress-top">
            <div
              class="progress-ring"
              :style="{
                background: `conic-gradient(var(--color-primary) ${progress}%, rgba(226, 232, 240, 1) ${progress}% 100%)`,
              }"
            >
              <div class="progress-ring-inner">
                <span>{{ progress }}%</span>
                <small>Complete</small>
              </div>
            </div>
            <div class="progress-summary">
              <h4>{{ t("reviewCreate.progress.title") }}</h4>
              <p>{{ t("reviewCreate.progress.description") }}</p>
            </div>
          </div>
          <div class="progress-list">
            <div
              v-for="step in progressSteps"
              :key="step.label"
              class="progress-step"
              :class="step.status"
            >
              <span class="step-icon">
                <template v-if="step.status === 'done'"> ✓ </template>
                <template v-else-if="step.status === 'current'">
                  <span class="step-current"></span>
                </template>
                <template v-else>
                  <span class="step-pending"></span>
                </template>
              </span>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-card hotel-card">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"
            :alt="t('reviewCreate.hotelCard.name')"
            class="hotel-thumb"
          />
          <div class="hotel-info">
            <span class="hotel-tag">{{
              t("reviewCreate.hotelCard.name")
            }}</span>
            <div class="hotel-rating">
              <RatingStars :model-value="4.9" readonly size="sm" />
              <span class="hotel-score">4.9</span>
              <span class="hotel-count">{{
                t("reviewCreate.hotelCard.reviewCount", { count: "1,284" })
              }}</span>
            </div>
            <div class="hotel-location">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {{ t("reviewCreate.hotelCard.location") }}
            </div>
          </div>
        </div>

        <div class="sidebar-card preview-card">
          <div class="preview-header">
            <div>
              <h4>{{ t("reviewCreate.preview.title") }}</h4>
              <span class="preview-subtitle">{{
                t("reviewCreate.preview.subtitle")
              }}</span>
            </div>
            <span class="preview-type">{{ ratingLabel }}</span>
          </div>
          <div class="preview-score-row">
            <div class="preview-rating">
              <span class="preview-score">{{ form.rating }}.0</span>
              <RatingStars :model-value="form.rating" readonly size="sm" />
            </div>
            <span class="preview-status">{{
              t(`reviewCreate.travelers.${form.travelerType}`)
            }}</span>
          </div>
          <h5 class="preview-title">
            {{ form.title || t("reviewCreate.preview.defaultTitle") }}
          </h5>
          <p class="preview-text">
            {{ form.content || t("reviewCreate.preview.defaultText") }}
          </p>
          <div v-if="selectedTags.length" class="preview-tags">
            <span v-for="tag in selectedTags" :key="tag" class="preview-chip">{{ t(tag) }}</span>
          </div>
        </div>

        <div class="sidebar-card tips-card">
          <h4 class="sidebar-card-title">{{ t("reviewCreate.tips.title") }}</h4>
          <ul class="tips-list">
            <li>{{ t("reviewCreate.tips.staff") }}</li>
            <li>{{ t("reviewCreate.tips.roomQuality") }}</li>
            <li>{{ t("reviewCreate.tips.value") }}</li>
            <li>{{ t("reviewCreate.tips.photos") }}</li>
            <li>{{ t("reviewCreate.tips.specific") }}</li>
          </ul>
        </div>
      </aside>
    </div>
    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RatingStars from "../components/RatingStars.vue";
import reviewService from "../services/reviewService.js";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const router = useRouter();
const route = useRoute();
const { t } = useI18n({ useScope: "global" });
const fileInput = ref(null);
const reviewForm = ref(null);
const submitting = ref(false);
const submitSuccess = ref(false);
const selectedMood = ref("😍");

const moods = ["😍", "😊", "😐", "😕", "😡"];

const experienceTags = [
  { icon: "✨", labelKey: "reviewCreate.form.tags.luxury" },
  { icon: "🏖", labelKey: "reviewCreate.form.tags.relaxing" },
  { icon: "🍽", labelKey: "reviewCreate.form.tags.greatFood" },
  { icon: "📍", labelKey: "reviewCreate.form.tags.greatLocation" },
  { icon: "🧹", labelKey: "reviewCreate.form.tags.cleanRooms" },
  { icon: "❤️", labelKey: "reviewCreate.form.tags.greatService" },
  { icon: "👨‍👩‍👧", labelKey: "reviewCreate.form.tags.familyFriendly" },
  { icon: "💰", labelKey: "reviewCreate.form.tags.greatValue" },
];

const selectedTags = ref([]);

const progressSteps = computed(() => {
  const steps = [
    {
      label: t("reviewCreate.progress.steps.overallRating"),
      done: !!form.value.rating,
    },
    {
      label: t("reviewCreate.progress.steps.reviewTitle"),
      done: form.value.title.trim().length >= 5,
    },
    {
      label: t("reviewCreate.progress.steps.yourReview"),
      done: form.value.content.trim().length >= 20,
    },
    {
      label: t("reviewCreate.progress.steps.categoryRatings"),
      done: Object.values(form.value.categories).every((score) => score >= 1),
    },
    {
      label: t("reviewCreate.progress.steps.addPhotos"),
      done: form.value.photos.length > 0,
    },
    {
      label: t("reviewCreate.progress.steps.submitReview"),
      done: submitSuccess.value,
    },
  ];

  const firstIncomplete = steps.findIndex(
    (step, index) =>
      !step.done && steps.slice(0, index).every((prev) => prev.done),
  );

  return steps.map((step, index) => ({
    ...step,
    status: step.done
      ? "done"
      : index === firstIncomplete
        ? "current"
        : "pending",
  }));
});

const progress = computed(() => {
  const steps = progressSteps.value;
  const doneCount = steps.filter((step) => step.status === "done").length;
  const currentCount = steps.filter((step) => step.status === "current").length;
  return Math.round(((doneCount + currentCount * 0.5) / steps.length) * 100);
});

const form = ref({
  rating: 5,
  title: "",
  content: "",
  categories: {
    cleanliness: 5,
    service: 5,
    location: 5,
    value: 5,
    comfort: 5,
  },
  travelerType: "solo",
  photos: [],
});

const errors = ref({});

const categories = [
  {
    key: "cleanliness",
    labelKey: "reviewCreate.form.categories.cleanliness",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    key: "service",
    labelKey: "reviewCreate.form.categories.service",
    icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  },
  {
    key: "location",
    labelKey: "reviewCreate.form.categories.location",
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  },
  {
    key: "value",
    labelKey: "reviewCreate.form.categories.value",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    key: "comfort",
    labelKey: "reviewCreate.form.categories.comfort",
    icon: "M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z",
  },
];

const travelerTypes = [
  { value: "solo", labelKey: "reviewCreate.travelers.solo", icon: "🧳" },
  { value: "couple", labelKey: "reviewCreate.travelers.couple", icon: "💑" },
  { value: "family", labelKey: "reviewCreate.travelers.family", icon: "👨‍👩‍👧" },
  {
    value: "business",
    labelKey: "reviewCreate.travelers.business",
    icon: "💼",
  },
  { value: "friends", labelKey: "reviewCreate.travelers.friends", icon: "🤝" },
];

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const ratingLabel = computed(
  () => ratingLabels[form.value.rating] || "Excellent",
);

const getCategoryClass = (score) => {
  if (score >= 4) return "score-high";
  if (score >= 3) return "score-mid";
  return "score-low";
};

const guidelines = [
  {
    label: "Be honest and respectful",
    text: "Share your genuine experience",
    icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  },
  {
    label: "Focus on your stay",
    text: "Comment on property, service, and amenities",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    label: "Avoid personal details",
    text: "Don't share personal info about others",
    icon: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94",
  },
  {
    label: "Photos are welcome",
    text: "Add photos to help others see what to expect",
    icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
  },
];

// Validation
const validate = (field) => {
  if (field === "title") {
    if (!form.value.title.trim()) {
      errors.value.title = t("reviewCreate.errors.titleRequired");
    } else if (form.value.title.trim().length < 5) {
      errors.value.title = t("reviewCreate.errors.titleMinLength");
    } else {
      delete errors.value.title;
    }
  }
  if (field === "content") {
    if (!form.value.content.trim()) {
      errors.value.content = t("reviewCreate.errors.contentRequired");
    } else if (form.value.content.trim().length < 20) {
      errors.value.content = t("reviewCreate.errors.contentMinLength");
    } else {
      delete errors.value.content;
    }
  }
  if (field === "rating") {
    if (!form.value.rating) {
      errors.value.rating = t("reviewCreate.errors.ratingRequired");
    } else {
      delete errors.value.rating;
    }
  }
};

const validateAll = () => {
  validate("title");
  validate("content");
  validate("rating");
  return Object.keys(errors.value).length === 0;
};

// File handling
const triggerFileInput = () => fileInput.value?.click();

const handleFiles = (e) => {
  const files = Array.from(e.target.files || []);
  files.slice(0, 10 - form.value.photos.length).forEach((file) => {
    const url = URL.createObjectURL(file);
    form.value.photos.push({ file, url });
  });
};

const handleDrop = (e) => {
  const files = Array.from(e.dataTransfer.files || []);
  files
    .filter((f) => f.type.startsWith("image/"))
    .slice(0, 10 - form.value.photos.length)
    .forEach((file) => {
      const url = URL.createObjectURL(file);
      form.value.photos.push({ file, url });
    });
};

const removePhoto = (i) => {
  URL.revokeObjectURL(form.value.photos[i].url);
  form.value.photos.splice(i, 1);
};

const goToWriteReview = () => {
  if (reviewForm.value) {
    reviewForm.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const navigateToReviews = () => {
  try {
    router.push({ name: "reviews" });
  } catch {
    router.back();
  }
};

const reservationId = computed(() => route.params.reservationId || "");

// Submit
const submitReview = async () => {
  if (!validateAll()) return;
  if (!reservationId.value) {
    console.error("Reservation ID is required to submit a review.");
    return;
  }

  submitting.value = true;
  try {
    await reviewService.createReview(reservationId.value, {
      rating: form.value.rating,
      comment: form.value.content.trim(),
    });
    submitSuccess.value = true;
    setTimeout(() => navigateToReviews(), 1600);
  } catch (err) {
    console.error("Submit failed", err);
  } finally {
    submitting.value = false;
  }
};

const cancel = () => {
  navigateToReviews();
};
</script>

<style scoped>
.create-page {
  background: var(--color-page);
  min-height: 100vh;
  font-family: var(--font-main);
}

/* ── HERO ── */
.create-hero {
  position: relative;
  padding: 80px 0 52px;
  overflow: hidden;
}

/* background image */
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* dark overlay on top of image */
.create-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 15, 35, 0.65),
    rgba(10, 15, 35, 0.2)
  );
  z-index: 1;
}

/* content above everything */
.create-hero .container {
  margin-top: 50px;
  position: relative;
  z-index: 2;
}

.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 28px;
  position: relative;
  width: 100%;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.84rem;
  margin-bottom: 20px;
  margin-top: -15px;
}

.breadcrumb a,
.breadcrumb-link {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}

.breadcrumb a:hover,
.breadcrumb-link:hover {
  color: white;
}
.sep {
  opacity: 0.4;
}
.active-crumb {
  color: white;
  font-weight: 500;
}

.hero-title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 500;
  color: white;
  letter-spacing: -0.02em;
  margin: 0 0 18px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-sub {
  color: rgba(255, 255, 255, 0.82);
  font-size: 1.05rem;
  max-width: 500px;
  line-height: 1.55;
  margin: 0;
}
.hero-badge-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.glass-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 20px;
}

.glass-star {
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-score {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
}

.glass-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.glass-divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1rem;
}

.glass-count {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.6);
}

.btn-write-review {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 13px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
  white-space: nowrap;
}

.btn-write-review:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.55);
}

.btn-write-review:active {
  transform: translateY(0);
}

/* ── LAYOUT ── */
.form-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 36px;
  padding: 40px 28px 80px;
  align-items: start;
}

/* ── FORM CARD ── */
.form-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 36px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  border: 1px solid var(--color-border);
}

.form-card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-light);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 4px;
}

.form-subtitle {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin: 0;
}

.form-grid {
  display: grid;
  gap: 22px;
}

.section-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 32px;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 800;
  margin-right: 10px;
}

.panel-heading h3 {
  display: inline;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.panel-status {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary);
}

.panel-status.optional {
  color: var(--color-muted);
}

.experience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.tag-btn {
  height: 52px;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  padding: 0 20px;

  border-radius: 999px;

  border: 1px solid var(--color-border);

  background: var(--color-surface);

  color: var(--color-text);

  font-size: 0.92rem;
  font-weight: 600;

  cursor: pointer;

  transition: all 0.25s ease;
}

.tag-btn:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.tag-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-icon {
  font-size: 1rem;
}

.mood-panel .mood-selector {
  justify-content: space-between;
}

.mood-btn {
  width: 100%;
  max-width: 88px;
  padding: 16px 0;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1.15rem;
  cursor: pointer;
  transition: all 0.18s;
}

.mood-btn:hover,
.mood-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.rating-hero {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 32px;
  align-items: center;

  margin-bottom: 28px;
  padding-bottom: 28px;

  border-bottom: 1px solid var(--color-border);
}

.rating-score-card {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 160px;

  border-radius: 24px;

  background:
    linear-gradient(
      180deg,
      rgba(37, 99, 235, 0.08),
      rgba(37, 99, 235, 0.03)
    );

  border: 1px solid var(--color-border);
}

.rating-score {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;

  color: var(--color-primary);
}

.rating-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rating-content h3 {
  margin: 14px 0 8px;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
}

.rating-content p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-muted);
}

.experience-section {
  margin-top: 8px;
}

.section-label {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: var(--color-text);
}

.category-grid {
  display: grid;
  gap: 12px;
}

.cat-rating-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.02);
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-icon-wrap {
  width: 34px;
  height: 34px;
  background: var(--color-primary-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.cat-label {
  font-size: 0.92rem;
  font-weight: 700;
}

.type-btn {
  flex: 1;
  min-width: 110px;
  padding: 14px 18px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}

.type-btn.active,
.type-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.upload-zone {
  border: 1px dashed var(--color-border);
  background: rgba(0, 0, 0, 0.02);
}

.upload-zone:hover {
  background: var(--color-primary-soft);
}

.photo-thumb {
  width: 80px;
  height: 80px;
  border-radius: 18px;
}

.form-actions {
  display: flex;
  gap: 14px;
  margin-top: 30px;
}

.btn-cancel {
  flex: 1;
}

.btn-submit {
  flex: 2;
}

.preview-card,
.progress-card,
.hotel-card,
.tips-card {
  border-radius: 24px;
}

.progress-card {
  padding: 24px;
}

/* Sections */
.form-section {
  margin-bottom: 28px;
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}

.required {
  color: var(--color-danger);
  margin-left: 2px;
}
.optional {
  font-weight: 400;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 28px 0;
}

/* Overall Rating */
.overall-rating-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rating-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Inputs */
.input-wrap {
  position: relative;
}

.text-input {
  width: 100%;
  padding: 13px 100px 13px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--color-text);
  background: var(--color-input);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.input-wrap.has-error .text-input,
.textarea-wrap.has-error .textarea-input {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.08);
}
.text-input,
.textarea-input {
  background: var(--color-input);
  color: var(--color-text);
}

.char-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  color: var(--color-muted);
  pointer-events: none;
}

.textarea-wrap {
  position: relative;
}

.textarea-input {
  width: 100%;
  padding: 14px 16px 36px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--color-text);
  background: var(--color-input);
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  min-height: 140px;
}

.textarea-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.char-count-bottom {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 0.78rem;
  color: var(--color-muted);
  pointer-events: none;
}

/* Error */
.error-msg {
  margin-top: 6px;
  font-size: 0.82rem;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Category Ratings */
.category-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.cat-rating-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  transition: background 0.15s;
}

.cat-rating-row:last-child {
  border-bottom: none;
}
.cat-rating-row:hover {
  background: var(--color-surface-soft);
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
  flex: 1;
}

.cat-icon-wrap {
  width: 30px;
  height: 30px;
  background: var(--color-primary-soft);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.cat-label {
  font-size: 0.88rem;
  font-weight: 600;
}

.cat-score-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  min-width: 42px;
  text-align: center;
  flex-shrink: 0;
}

.cat-score-badge.score-high {
  background: var(--color-success-soft);
  color: var(--color-success);
}
.cat-score-badge.score-mid {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}
.cat-score-badge.score-low {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

/* Traveler Types */
.traveler-types {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.type-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.type-emoji {
  font-size: 1.1rem;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 36px 24px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-zone:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.upload-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.upload-sub {
  font-size: 0.8rem;
  color: var(--color-muted);
  margin: 0;
}

.photo-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.photo-thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.7);
  color: white;
  border: none;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 14px;
  margin-top: 36px;
}

.btn-cancel {
  flex: 1;
  padding: 15px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  border-color: var(--color-border);
  background: var(--color-surface-soft);
}

.btn-submit {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-strong);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success */
.success-banner {
  margin-top: 20px;
  padding: 14px 20px;
  background: var(--color-success-soft);
  color: var(--color-success);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.9rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── SIDEBAR ── */
.create-sidebar {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: var(--color-surface);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border);
}

.progress-card {
  padding: 24px;
  border-radius: 24px;
}

.hotel-card {
  border-radius: 24px;
  overflow: hidden;
  padding: 0;
}

.preview-card {
  padding: 24px;
  border-radius: 24px;
}

.tips-card {
  border-radius: 24px;
}

.hotel-tag {
  display: inline-flex;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.progress-top {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.progress-ring {
  width: 400px;
  height: 150px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  /* border: 1px solid #e8e5e5; */
  background: conic-gradient(var(--color-primary) 75%, rgb(179, 194, 213) 0);
}

.progress-ring-inner {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.14);
  font-weight: 800;
  color: var(--color-text);
  text-align: center;
  border: 1px solid white;
}

.progress-ring-inner small {
  display: block;
  font-size: 0.72rem;
  color: var(--color-muted);
  font-weight: 600;
}

.progress-summary h4 {
  font-size: 1rem;
  margin: 0 0 6px;
  color: var(--color-text);
}

.progress-summary p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.progress-list {
  display: grid;
  gap: 12px;
}

.progress-step {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  border: 2px solid transparent;
}

.progress-step.done .step-icon {
  background: var(--color-success-soft);
  color: var(--color-success);
  border-color: var(--color-success-soft);
}

.progress-step.current .step-icon {
  background: var(--color-surface);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.progress-step.pending .step-icon {
  background: var(--color-surface);
  color: var(--color-muted);
  border-color: var(--color-border);
}

.step-current,
.step-pending {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: block;
}

.step-current {
  border: 2px solid var(--primary);
  background: white;
}

.step-pending {
  border: 2px solid #cbd5e1;
  background: white;
}

.step-label {
  font-size: 0.92rem;
  color: var(--text-heading);
}

.progress-step.pending .step-label {
  color: var(--text-faint);
}

@media (prefers-color-scheme: dark) {
  .step-label,
  .progress-step.pending .step-label {
    color: #f8fafc;
  }
}

[data-theme="dark"] .step-label,
[data-theme="dark"] .progress-step.pending .step-label {
  color: #f8fafc;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.preview-subtitle {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.84rem;
}

.preview-type {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

.preview-score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.preview-rating {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.preview-score {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-heading);
}

.preview-status {
  background: #f8fafc;
  color: var(--text-heading);
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.84rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

@media (prefers-color-scheme: dark) {
  .preview-status {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
    border-color: rgba(255, 255, 255, 0.14);
  }
}

[data-theme="dark"] .preview-status {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.14);
}

.preview-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text-heading);
}

.preview-text {
  margin: 0 0 16px;
  color: var(--text-body);
  line-height: 1.8;
  min-height: 6.5rem;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-chip {
  background: #eff6ff;
  color: var(--primary);
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .preview-chip {
    background: rgba(56, 189, 248, 0.14);
    color: #f8fafc;
    border: 1px solid rgba(248, 250, 252, 0.14);
  }
}

[data-theme="dark"] .preview-chip {
  background: rgba(56, 189, 248, 0.14);
  color: #f8fafc;
  border: 1px solid rgba(248, 250, 252, 0.14);
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--text-faint);
  font-size: 0.84rem;
}

.hotel-card {
  padding: 0;
  overflow: hidden;
}

.hotel-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.hotel-info {
  padding: 16px 18px 18px;
}

.hotel-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 8px;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.hotel-score {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-heading);
}

.hotel-count {
  font-size: 0.8rem;
  color: var(--text-faint);
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* end of sidebar card style */

.sidebar-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.sidebar-card-header h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0;
}

.sidebar-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 14px;
}

.guide-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin: 12px 0;
}

.guide-icon {
  width: 28px;
  height: 28px;
  background: var(--primary-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--primary);
}

.guide-label {
  font-size: 0.87rem;
  font-weight: 600;
  color: var(--text-heading);
  line-height: 1.3;
}

.guide-sub {
  font-size: 0.79rem;
  color: var(--text-faint);
  margin-top: 2px;
  line-height: 1.4;
}

.learn-more-link {
  display: inline-block;
  color: var(--primary);
  font-size: 0.84rem;
  font-weight: 600;
  margin-top: 10px;
  text-decoration: none;
}

/* Hotel Card */
.hotel-card {
  padding: 0;
  overflow: hidden;
}

.hotel-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.hotel-info {
  padding: 16px 18px 18px;
}

.hotel-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 8px;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.hotel-score {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-heading);
}

.hotel-count {
  font-size: 0.8rem;
  color: var(--text-faint);
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* Tips */
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tips-list li {
  font-size: 0.84rem;
  color: var(--text-muted);
  line-height: 1.45;
  padding-left: 18px;
  position: relative;
}

.tips-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: 700;
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .create-sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 640px) {
  .create-hero {
    padding: 80px 0 36px;
  }
  .hero-title {
    font-size: 1.8rem;
  }
  .form-card {
    padding: 22px 18px;
  }
  .form-layout {
    padding: 24px 16px 60px;
    gap: 20px;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-cancel,
  .btn-submit {
    flex: 1;
  }
  .cat-info {
    min-width: 100px;
  }
  .traveler-types {
    gap: 8px;
  }
  .type-btn {
    padding: 9px 14px;
    font-size: 0.82rem;
  }
  .cat-score-badge {
    display: none;
  }
}
@media (max-width: 768px) {
  .rating-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .rating-score-card {
    max-width: 220px;
    width: 100%;
    margin: 0 auto;
  }

  .rating-content {
    align-items: center;
  }
}
</style>
