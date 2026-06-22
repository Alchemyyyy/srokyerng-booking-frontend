<template>
  <div class="rm-page">
    <PublicNavbar />

    <!-- ── HERO ── -->
    <section class="rm-hero">
     
      <img
        class="rm-hero-img"
        src="../../../assets/images/reviews/banner/BannerReview.png"
        alt="banner"
      />
      <div class="rm-hero-overlay" />
      <div class="rm-container">
        <div class="rm-hero-inner">
          <div class="rm-hero-left">
            <!-- <p class="rm-eyebrow">{{ $t('reviewManagement.hero.eyebrow') }}</p> -->
            <h1
              class="rm-hero-title"
              v-html="$t('reviewManagement.hero.title')"
            ></h1>
            <p class="rm-hero-sub">
              {{ $t("reviewManagement.hero.subtitle") }}
            </p>
            <div class="rm-hero-actions">
              <button class="rm-btn-primary" @click="goToWriteReview">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M12 20h9" />
                  <path
                    d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                  />
                </svg>
                {{ $t("reviewManagement.hero.writeReview") }}
              </button>
            </div>
          </div>
          <div class="rm-hero-stats">
            <div class="rm-stat-pill">
              <span class="rm-stat-num">{{ totalReviews }}</span>
              <span class="rm-stat-label">{{
                $t("reviewManagement.hero.totalReviews")
              }}</span>
            </div>
            <div class="rm-stat-pill">
              <span class="rm-stat-num">{{ avgRating }}</span>
              <span class="rm-stat-label">{{
                $t("reviewManagement.hero.avgRating")
              }}</span>
            </div>
            <div class="rm-stat-pill">
              <span class="rm-stat-num">{{ pendingReviews }}</span>
              <span class="rm-stat-label">{{
                $t("reviewManagement.hero.readyToReview")
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FILTER STRIP ── -->
    <div class="rm-filter-strip">
      <div class="rm-container rm-filter-inner">
        <div class="rm-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="rm-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="rm-filter-right">
          <div class="rm-search-wrap">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('reviewManagement.filter.searchPlaceholder')"
              class="rm-search"
            />
          </div>
          <select v-model="sortBy" class="rm-select">
            <option value="recent">
              {{ $t("reviewManagement.filter.sortRecent") }}
            </option>
            <option value="highest">
              {{ $t("reviewManagement.filter.sortHighest") }}
            </option>
            <option value="lowest">
              {{ $t("reviewManagement.filter.sortLowest") }}
            </option>
          </select>
          <button
            class="rm-refresh-btn"
            @click="fetchMyReviews"
            title="Refresh"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── MAIN LAYOUT ── -->
    <div class="rm-container rm-main">
      <!-- LEFT: review cards -->
      <div class="rm-cards-col">
        <!-- Loading -->
        <div v-if="loading" class="rm-loading">
          <div class="rm-spinner"></div>
          <p>{{ $t("reviewManagement.state.loading") }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="rm-empty">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p class="rm-empty-title">
            {{ $t("reviewManagement.state.errorTitle") }}
          </p>
          <p class="rm-empty-sub">{{ error }}</p>
          <button class="rm-btn-outline" @click="fetchMyReviews">
            {{ $t("reviewManagement.state.tryAgain") }}
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredReviews.length === 0" class="rm-empty">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            stroke-width="1.5"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          <p class="rm-empty-title">
            {{ $t("reviewManagement.state.emptyTitle") }}
          </p>
          <p class="rm-empty-sub">
            {{ $t("reviewManagement.state.emptySub") }}
          </p>
          <button class="rm-btn-outline" @click="goToWriteReview">
            {{ $t("reviewManagement.state.writeFirst") }}
          </button>
        </div>

        <!-- Review Cards -->
        <template v-else>
          <div
            v-for="review in filteredReviews"
            :key="review.id"
            class="rm-card"
          >
            <!-- Card header -->
            <div class="rm-card-header">
              <div class="rm-card-meta">
                <span class="rm-res-badge"
                  >#RES-{{ review.reservation_id }}</span
                >
                <span class="rm-property-name">{{
                  review.property_name || "Property"
                }}</span>
              </div>
              <div class="rm-card-rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  />
                </svg>
                <span>{{ Number(review.rating || 0).toFixed(1) }}</span>
              </div>
            </div>

            <!-- Room + dates -->
            <div class="rm-card-sub">
              {{
                review.room_name || $t("reviewManagement.card.room")
              }}
              &middot; {{ formatDate(review.check_in_date) }}
              {{ $t("reviewManagement.card.to") }}
              {{ formatDate(review.check_out_date) }}
            </div>

            <!-- Stars + date -->
            <div class="rm-stars-row">
              <RatingStars :model-value="review.rating" readonly size="sm" />
              <span class="rm-rating-label">{{
                ratingLabel(review.rating)
              }}</span>
              <span class="rm-date">{{ formatDate(review.created_at) }}</span>
            </div>

            <!-- Comment -->
            <p class="rm-comment">{{ review.comment }}</p>

            <!-- Owner reply -->
            <div v-if="review.owner_reply" class="rm-owner-reply">
              <div class="rm-reply-header">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  />
                </svg>
                {{ $t("reviewManagement.card.propertyResponse") }}
              </div>
              <p class="rm-reply-text">{{ review.owner_reply }}</p>
            </div>

            <!-- Actions -->
            <div class="rm-card-actions">
              <button class="rm-btn-edit" @click="openEdit(review)">
                <svg
                  width="13"
                  height="13"
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
                {{ $t("reviewManagement.card.edit") }}
              </button>
              <button class="rm-btn-delete" @click="confirmDelete(review)">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                {{ $t("reviewManagement.card.delete") }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- RIGHT: sidebar -->
      <aside class="rm-sidebar">
        <!-- Stats card -->
        <div class="rm-side-card">
          <h4 class="rm-side-title">
            {{ $t("reviewManagement.sidebar.yourStats") }}
          </h4>
          <div class="rm-side-stats">
            <div class="rm-side-stat">
              <span class="rm-side-stat-num">{{ totalReviews }}</span>
              <span class="rm-side-stat-label">{{
                $t("reviewManagement.sidebar.reviews")
              }}</span>
            </div>
            <div class="rm-side-stat">
              <span class="rm-side-stat-num">{{ avgRating }}</span>
              <span class="rm-side-stat-label">{{
                $t("reviewManagement.sidebar.avgRating")
              }}</span>
            </div>
          </div>
          <!-- Breakdown -->
          <div class="rm-breakdown">
            <div v-for="n in [5, 4, 3, 2, 1]" :key="n" class="rm-bar-row">
              <span class="rm-bar-label">{{ n }}</span>
              <div class="rm-bar-track">
                <div
                  class="rm-bar-fill"
                  :style="{ width: getBreakdownPct(n) + '%' }"
                ></div>
              </div>
              <span class="rm-bar-count">{{ getBreakdownCount(n) }}</span>
            </div>
          </div>
        </div>

        <!-- Completed stays waiting for review -->
        <div class="rm-side-card" v-if="pendingReviews > 0">
          <h4 class="rm-side-title">
            {{ $t("reviewManagement.sidebar.completedStays") }}
          </h4>
          <div
            v-for="stay in completedStays"
            :key="stay.id"
            class="rm-stay-item"
            @click="router.push(`/customer/reservations/${stay.id}/review`)"
          >
            <div class="rm-stay-info">
              <span class="rm-stay-name">{{
                stay.property_name ||
                $t("reviewManagement.card.defaultProperty")
              }}</span>
              <span class="rm-stay-date"
                >{{ formatDate(stay.check_out_date) }} &middot; #RES-{{
                  stay.id
                }}</span
              >
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <!-- Write review CTA -->
        <div class="rm-side-card rm-cta-card">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            stroke-width="1.5"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <h4>{{ $t("reviewManagement.sidebar.ctaTitle") }}</h4>
          <p>{{ $t("reviewManagement.sidebar.ctaSub") }}</p>
          <button class="rm-btn-primary rm-cta-btn" @click="goToWriteReview">
            {{ $t("reviewManagement.hero.writeReview") }}
          </button>
        </div>
      </aside>
    </div>

    <!-- ── EDIT MODAL ── -->
    <teleport to="body">
      <div
        v-if="editingReview"
        class="rm-modal-backdrop"
        @click.self="closeEdit"
      >
        <div class="rm-modal">
          <div class="rm-modal-header">
            <h3>{{ $t("reviewManagement.editModal.title") }}</h3>
            <button class="rm-modal-close" @click="closeEdit">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="rm-modal-body">
            <label class="rm-label">{{
              $t("reviewManagement.editModal.ratingLabel")
            }}</label>
            <RatingStars v-model="editForm.rating" size="lg" />
            <label class="rm-label" style="margin-top: 20px">{{
              $t("reviewManagement.editModal.commentLabel")
            }}</label>
            <textarea
              v-model="editForm.comment"
              class="rm-textarea"
              rows="5"
              :placeholder="$t('reviewManagement.editModal.commentPlaceholder')"
              maxlength="500"
            ></textarea>
            <span class="rm-char-count">{{ editForm.comment.length }}/500</span>
          </div>
          <div class="rm-modal-footer">
            <button class="rm-btn-outline" @click="closeEdit">
              {{ $t("common.cancel") }}
            </button>
            <button class="rm-btn-primary" :disabled="saving" @click="saveEdit">
              {{
                saving
                  ? $t("reviewManagement.editModal.saving")
                  : $t("reviewManagement.editModal.saveChanges")
              }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ── DELETE CONFIRM ── -->
    <teleport to="body">
      <div
        v-if="deletingReview"
        class="rm-modal-backdrop"
        @click.self="cancelDelete"
      >
        <div class="rm-modal rm-modal-sm">
          <div class="rm-modal-header">
            <h3>{{ $t("reviewManagement.deleteModal.title") }}</h3>
            <button class="rm-modal-close" @click="cancelDelete">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="rm-modal-body">
            <p style="color: var(--rm-text-muted); margin: 0">
              {{ $t("reviewManagement.deleteModal.body") }}
            </p>
          </div>
          <div class="rm-modal-footer">
            <button class="rm-btn-outline" @click="cancelDelete">
              {{ $t("common.cancel") }}
            </button>
            <button
              class="rm-btn-danger"
              :disabled="deleting"
              @click="doDelete"
            >
              {{
                deleting
                  ? $t("reviewManagement.deleteModal.deleting")
                  : $t("reviewManagement.deleteModal.confirm")
              }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <PublicFooter />
  </div>
</template>

<script setup>
console.log("[PROBE] ReviewManagementView script executing");
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RatingStars from "../components/RatingStars.vue";
import reviewService from "../services/reviewService.js";
import http from "@/app/api/http";
import reviewApi from "../api/review.api.js";
import { useToastStore } from "@/shared/store/toastStore";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const router = useRouter();
const { t, locale } = useI18n();
const toast = useToastStore();

// ── State ──
const reviews = ref([]);
const loading = ref(false);
const error = ref(null);
const activeTab = ref("all");
const searchQuery = ref("");
const sortBy = ref("recent");

// Edit modal
const editingReview = ref(null);
const editForm = ref({ rating: 5, comment: "" });
const saving = ref(false);

// Delete confirm
const deletingReview = ref(null);
const deleting = ref(false);

// Completed stays that don't have a review yet (for sidebar + "Write a Review" CTA)
const completedStays = ref([]);
// Whether the customer has any reservations at all (used to decide where "Write a Review" sends them)
const hasAnyReservations = ref(false);

// ── Fetch ──
const fetchMyReviews = async () => {
  console.log("VERSION 999");

  loading.value = true;

  try {
    console.log("BEFORE SERVICE CALL");

    const data = await reviewService.getMyReviews();

    console.log("AFTER SERVICE CALL");
    console.log(data);

    reviews.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("FETCH ERROR:", e);
    error.value = e?.response?.data?.message || e?.message || "Failed to load reviews";
  } finally {
    loading.value = false;
  }
};

const fetchCompletedStays = async () => {
  try {
    const res = await http.get("/reservations/my");
    console.log("[stays] raw response:", res);

    const list = res?.data?.data || res?.data || [];
    console.log("[stays] parsed list:", list);
    console.log(
      "[stays] statuses:",
      list.map((r) => r.reservation_status),
    );

    hasAnyReservations.value = list.length > 0;

    const reviewedReservationIds = new Set(
      reviews.value.map((r) => r.reservation_id),
    );
    console.log("[stays] reviewedReservationIds:", reviewedReservationIds);

    completedStays.value = list.filter(
      (r) =>
        r.reservation_status === "completed" &&
        !reviewedReservationIds.has(r.id),
    );

    console.log("[stays] hasAnyReservations:", hasAnyReservations.value);
    console.log("[stays] completedStays:", completedStays.value);
  } catch (err) {
    console.error("[stays] fetch failed:", err?.response || err);
    completedStays.value = [];
    hasAnyReservations.value = false;
  }
};

onMounted(async () => {
  console.log("ONMOUNTED START");

  await fetchMyReviews();

  console.log("AFTER FETCH REVIEWS");

  await fetchCompletedStays();

  console.log("AFTER FETCH STAYS");
});

// ── Computed ──
const totalReviews = computed(() => reviews.value.length);

const avgRating = computed(() => {
  if (!reviews.value.length) return "—";
  const avg =
    reviews.value.reduce((s, r) => s + (Number(r.rating) || 0), 0) /
    reviews.value.length;
  return avg.toFixed(1);
});

const pendingReviews = computed(() => completedStays.value.length);

const filterTabs = computed(() => [
  {
    key: "all",
    label: `${t("reviewManagement.filter.tabAll")} (${reviews.value.length})`,
  },
  { key: "4plus", label: t("reviewManagement.filter.tab4plus") },
  { key: "replied", label: t("reviewManagement.filter.tabReplied") },
]);

const filteredReviews = computed(() => {
  let list = [...reviews.value];

  if (activeTab.value === "4plus") list = list.filter((r) => r.rating >= 4);
  if (activeTab.value === "replied") list = list.filter((r) => r.owner_reply);

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (r) =>
        r.comment?.toLowerCase().includes(q) ||
        r.property_name?.toLowerCase().includes(q),
    );
  }

  if (sortBy.value === "highest") list.sort((a, b) => b.rating - a.rating);
  else if (sortBy.value === "lowest") list.sort((a, b) => a.rating - b.rating);
  else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return list;
});

const getBreakdownCount = (stars) =>
  reviews.value.filter((r) => Math.round(r.rating) === stars).length;
const getBreakdownPct = (stars) => {
  if (!reviews.value.length) return 0;
  return Math.round((getBreakdownCount(stars) / reviews.value.length) * 100);
};

// ── Helpers ──
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const loc = locale.value === "km" ? "km-KH" : "en-US";
  return new Date(dateStr).toLocaleDateString(loc, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ratingLabel = (r) => {
  if (r >= 5) return t("reviewManagement.ratingLabel.excellent");
  if (r >= 4) return t("reviewManagement.ratingLabel.veryGood");
  if (r >= 3) return t("reviewManagement.ratingLabel.good");
  if (r >= 2) return t("reviewManagement.ratingLabel.fair");
  return t("reviewManagement.ratingLabel.poor");
};

const goToWriteReview = () => {
  if (completedStays.value.length > 0) {
    router.push(`/customer/reservations/${completedStays.value[0].id}/review`);
  } else if (hasAnyReservations.value) {
    toast.info(t("reviewManagement.state.noCompletedStays"));
    router.push("/customer/booking-history");
  } else {
    toast.info(t("reviewManagement.state.noReservations"));
    router.push("/properties");
  }
};

// ── Edit ──
const openEdit = (review) => {
  editingReview.value = review;
  editForm.value = { rating: review.rating, comment: review.comment || "" };
};

const closeEdit = () => {
  editingReview.value = null;
};

const saveEdit = async () => {
  saving.value = true;
  try {
    await reviewService.updateReview(editingReview.value.id, {
      rating: editForm.value.rating,
      comment: editForm.value.comment,
    });
    const idx = reviews.value.findIndex((r) => r.id === editingReview.value.id);
    if (idx !== -1) {
      reviews.value[idx] = { ...reviews.value[idx], ...editForm.value };
    }
    closeEdit();
    toast.success(t("reviewManagement.editModal.saveSuccess"));
  } catch (e) {
    toast.danger(
      e?.response?.data?.message ||
        e?.message ||
        t("reviewManagement.editModal.saveFailed"),
    );
  } finally {
    saving.value = false;
  }
};

// ── Delete ──
const confirmDelete = (review) => {
  deletingReview.value = review;
};

const cancelDelete = () => {
  deletingReview.value = null;
};

const doDelete = async () => {
  deleting.value = true;
  try {
    await reviewService.deleteReview(deletingReview.value.id);
    reviews.value = reviews.value.filter(
      (r) => r.id !== deletingReview.value.id,
    );
    cancelDelete();
    toast.success(t("reviewManagement.deleteModal.deleteSuccess"));
  } catch (e) {
    toast.danger(
      e?.response?.data?.message ||
        e?.message ||
        t("reviewManagement.deleteModal.deleteFailed"),
    );
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.rm-page {
  --rm-bg: var(--color-page);
  --rm-card-bg: var(--color-surface);
  --rm-border: var(--color-border);
  --rm-text: var(--color-text);
  --rm-text-muted: var(--color-muted);
  --rm-text-faint: var(--color-muted);
  --rm-primary: var(--color-primary);
  --rm-primary-dark: var(--color-primary-strong);
  --rm-danger: var(--color-danger);
  --rm-hero-h: 320px;
  background: var(--color-page);
  min-height: 100vh;
  font-family: var(--font-main);
}

/* ── Hero ── */
.rm-hero {
  position: relative;
  min-height: var(--rm-hero-h);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.rm-hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 50%;
}

.rm-hero-bg {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(
      ellipse at 80% 50%,
      rgba(37, 99, 235, 0.25) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 20% 80%,
      rgba(99, 102, 241, 0.15) 0%,
      transparent 50%
    );
}

.rm-hero-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.rm-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
  width: 100%;
  position: relative;
}

.rm-hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 60px 0;
  flex-wrap: wrap;
}

.rm-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #60a5fa;
  margin: 0 0 14px;
}

.rm-hero-title {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  margin: 80px 0 16px;
  letter-spacing: -0.03em;
}

.rm-hero-sub {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 28px;
  max-width: 420px;
}

.rm-hero-actions {
  display: flex;
  gap: 12px;
}

.rm-hero-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.rm-stat-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
}

.rm-stat-num {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text-inverse);
  line-height: 1;
}

.rm-stat-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ── Filter strip ── */
.rm-filter-strip {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: var(--shadow-card);
}

.rm-filter-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 0;
  padding-bottom: 0;
  min-height: 56px;
  flex-wrap: wrap;
}

.rm-tabs {
  display: flex;
  gap: 0;
}

.rm-tab {
  padding: 18px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--rm-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
  white-space: nowrap;
}

.rm-tab:hover {
  color: var(--rm-text);
}

.rm-tab.active {
  color: var(--rm-primary);
  border-bottom-color: var(--rm-primary);
}

.rm-filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rm-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-page);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 14px;
  color: var(--rm-text-faint);
}

.rm-search {
  border: none;
  background: none;
  outline: none;
  font-size: 0.85rem;
  color: var(--rm-text);
  width: 160px;
}

.rm-search::placeholder {
  color: var(--rm-text-faint);
}

.rm-select {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.84rem;
  color: var(--rm-text);
  background: var(--color-page);
  outline: none;
  cursor: pointer;
}

.rm-refresh-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-page);
  color: var(--rm-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.rm-refresh-btn:hover {
  background: var(--rm-border);
  color: var(--rm-text);
}

/* ── Main layout ── */
.rm-main {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  padding-top: 32px;
  padding-bottom: 60px;
  align-items: start;
}

/* ── Cards col ── */
.rm-cards-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Loading / Empty ── */
.rm-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: var(--rm-text-muted);
  font-size: 0.9rem;
}

.rm-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--rm-border);
  border-top-color: var(--rm-primary);
  border-radius: 50%;
  animation: rm-spin 0.7s linear infinite;
}

@keyframes rm-spin {
  to {
    transform: rotate(360deg);
  }
}

.rm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 24px;
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.rm-empty-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--rm-text);
  margin: 0;
}

.rm-empty-sub {
  font-size: 0.87rem;
  color: var(--rm-text-muted);
  margin: 0;
}

/* ── Review card ── */
.rm-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.rm-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.rm-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rm-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rm-res-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--color-primary-soft);
  color: var(--rm-primary);
  padding: 3px 9px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.rm-property-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--rm-text);
}

.rm-card-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--rm-text);
}

.rm-card-sub {
  font-size: 0.82rem;
  color: var(--rm-text-muted);
}

.rm-stars-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rm-rating-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--rm-text);
}

.rm-date {
  font-size: 0.8rem;
  color: var(--rm-text-faint);
  margin-left: auto;
}

.rm-comment {
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.65;
  margin: 0;
}

/* Owner reply */
.rm-owner-reply {
  background: var(--color-surface-soft);
  border-left: 3px solid var(--rm-primary);
  border-radius: 0 10px 10px 0;
  padding: 12px 16px;
}

.rm-reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--rm-primary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rm-reply-text {
  font-size: 0.87rem;
  color: var(--rm-text-muted);
  margin: 0;
  line-height: 1.55;
}

/* Card actions */
.rm-card-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--rm-border);
  margin-top: 4px;
}

.rm-btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--rm-primary);
  background: var(--color-primary-soft);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.rm-btn-edit:hover {
  background: var(--color-primary-soft);
}

.rm-btn-delete {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--rm-danger);
  background: var(--color-danger-soft);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.rm-btn-delete:hover {
  background: var(--color-danger-soft);
}

/* ── Sidebar ── */
.rm-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 72px;
}

.rm-side-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.rm-side-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--rm-text);
  margin: 0 0 16px;
}

.rm-side-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.rm-side-stat {
  flex: 1;
  background: var(--color-surface-soft);
  border-radius: var(--radius-sm);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rm-side-stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--rm-primary);
}

.rm-side-stat-label {
  font-size: 0.72rem;
  color: var(--rm-text-muted);
  text-align: center;
}

/* Breakdown bars */
.rm-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rm-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rm-bar-label {
  font-size: 0.78rem;
  color: var(--rm-text-muted);
  width: 12px;
  text-align: center;
  flex-shrink: 0;
}

.rm-bar-track {
  flex: 1;
  height: 6px;
  background: var(--rm-border);
  border-radius: 99px;
  overflow: hidden;
}

.rm-bar-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: 99px;
  transition: width 0.6s ease;
}

.rm-bar-count {
  font-size: 0.72rem;
  color: var(--rm-text-muted);
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}

/* Stays */
.rm-stay-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.1s;
}

.rm-stay-item:last-child {
  border-bottom: none;
}
.rm-stay-item:hover {
  opacity: 0.8;
}

.rm-stay-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rm-stay-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--rm-text);
}

.rm-stay-date {
  font-size: 0.76rem;
  color: var(--rm-text-faint);
}

/* CTA card */
.rm-cta-card {
  background: var(--color-primary-soft);
  border-color: var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rm-cta-card h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--rm-text);
  margin: 8px 0 0;
}

.rm-cta-card p {
  font-size: 0.83rem;
  color: var(--rm-text-muted);
  margin: 0 0 4px;
  line-height: 1.5;
}

.rm-cta-btn {
  width: 100%;
  justify-content: center;
}

/* ── Buttons ── */
.rm-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: var(--rm-primary);
  color: var(--rm-text);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s,
    box-shadow 0.15s;
  box-shadow: 0 4px 14px var(--color-focus-ring);
}

.rm-btn-primary:hover {
  background: var(--rm-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px var(--color-focus-ring);
}

.rm-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.rm-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  color: var(--rm-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.rm-btn-edit,
.rm-btn-delete {
  margin-top: 17px;
}

.rm-btn-outline:hover {
  background: var(--color-page);
}

.rm-btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--rm-danger);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.rm-btn-danger:hover {
  background: #dc2626;
}
.rm-btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Modal ── */
.rm-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.rm-modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 520px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.rm-modal-sm {
  max-width: 400px;
}

.rm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.rm-modal-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--rm-text);
  margin: 0;
}

.rm-modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-page);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--rm-text-muted);
  transition: background 0.15s;
}

.rm-modal-close:hover {
  background: var(--rm-border);
}

.rm-modal-body {
  padding: 24px;
}

.rm-label {
  display: block;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--rm-text);
  margin-bottom: 8px;
}

.rm-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 0.9rem;
  color: var(--rm-text);
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.rm-textarea:focus {
  border-color: var(--rm-primary);
}

.rm-char-count {
  display: block;
  text-align: right;
  font-size: 0.76rem;
  color: var(--rm-text-faint);
  margin-top: 4px;
}

.rm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--rm-border);
  background: var(--color-surface);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .rm-main {
    grid-template-columns: 1fr;
  }

  .rm-sidebar {
    position: static;
    order: -1;
  }

  .rm-hero-stats {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .rm-stat-pill {
    min-width: 80px;
  }

  .rm-filter-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 0;
    gap: 8px;
  }

  .rm-filter-right {
    width: 100%;
    flex-wrap: wrap;
  }
  .rm-search-wrap {
    flex: 1;
  }
  .rm-search {
    width: 100%;
  }
}
</style>