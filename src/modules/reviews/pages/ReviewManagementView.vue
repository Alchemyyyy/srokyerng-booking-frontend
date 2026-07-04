<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RatingStars from "../components/RatingStars.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import reviewService from "../services/reviewService.js";
import http from "@/app/api/http";
import { useToastStore } from "@/shared/store/toastStore";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from "@heroicons/vue/24/outline";

const router = useRouter();
const { t, locale } = useI18n();
const toast = useToastStore();

// ── State ──
const reviews = ref([]);
const loading = ref(false);
const error = ref(null);
const activeTab = ref("by-you"); // 'about-you' or 'by-you'
const searchQuery = ref("");
const sortBy = ref("recent");

// Edit modal
const editingReview = ref(null);
const editForm = ref({ rating: 5, comment: "" });
const saving = ref(false);

// Delete confirm
const deletingReview = ref(null);
const deleting = ref(false);

// Completed stays that don't have a review yet (Reviews to write)
const completedStays = ref([]);
const hasAnyReservations = ref(false);

// ── Fetching Data ──
const fetchMyReviews = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await reviewService.getMyReviews();
    reviews.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "Failed to load reviews";
  } finally {
    loading.value = false;
  }
};

const fetchCompletedStays = async () => {
  try {
    const res = await http.get("/reservations/my");
    const list = res?.data?.data || res?.data || [];
    hasAnyReservations.value = list.length > 0;

    const reviewedReservationIds = new Set(
      reviews.value.map((r) => r.reservation_id)
    );

    completedStays.value = list.filter(
      (r) =>
        r.reservation_status === "completed" &&
        !reviewedReservationIds.has(r.id)
    );
  } catch (err) {
    completedStays.value = [];
    hasAnyReservations.value = false;
  }
};

onMounted(async () => {
  await fetchMyReviews();
  await fetchCompletedStays();
});

// ── Computed Properties ──
const totalReviews = computed(() => reviews.value.length);

const avgRating = computed(() => {
  if (!reviews.value.length) return "—";
  const avg =
    reviews.value.reduce((s, r) => s + (Number(r.rating) || 0), 0) /
    reviews.value.length;
  return avg.toFixed(1);
});

const filteredReviews = computed(() => {
  let list = [...reviews.value];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (r) =>
        r.comment?.toLowerCase().includes(q) ||
        r.property_name?.toLowerCase().includes(q)
    );
  }

  if (sortBy.value === "highest") list.sort((a, b) => b.rating - a.rating);
  else if (sortBy.value === "lowest") list.sort((a, b) => a.rating - b.rating);
  else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return list;
});

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

// ── Edit Actions ──
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
        t("reviewManagement.editModal.saveFailed")
    );
  } finally {
    saving.value = false;
  }
};

// ── Delete Actions ──
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
      (r) => r.id !== deletingReview.value.id
    );
    cancelDelete();
    toast.success(t("reviewManagement.deleteModal.deleteSuccess"));
  } catch (e) {
    toast.danger(
      e?.response?.data?.message ||
        e?.message ||
        t("reviewManagement.deleteModal.deleteFailed")
    );
  } finally {
    deleting.value = false;
  }
};
</script>

<template>
  <div>
    <PublicNavbar />

    <div class="min-h-screen bg-(--color-page) text-(--color-text) antialiased pb-24 font-sans pt-32">
      <div class="mx-auto max-w-4xl px-4 sm:px-6">
        
        <!-- Page Title -->
        <div class="border-b border-(--color-border) pb-5 mb-8">
          <h1 class="text-4xl font-black tracking-tight text-(--color-text)">
            Reviews
          </h1>
          
          <!-- Airbnb Reviews Tab Switcher -->
          <div class="flex gap-6 mt-6 text-sm font-bold">
            <button
              type="button"
              class="pb-3 border-b-2 transition-all duration-200 cursor-pointer"
              :class="activeTab === 'by-you' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
              @click="activeTab = 'by-you'"
            >
              Reviews by you
            </button>
            <button
              type="button"
              class="pb-3 border-b-2 transition-all duration-200 cursor-pointer"
              :class="activeTab === 'about-you' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
              @click="activeTab = 'about-you'"
            >
              Reviews about you
            </button>
          </div>
        </div>

        <!-- MAIN LAYOUT -->
        <main>
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-20 bg-(--color-surface) border border-(--color-border)/60 rounded-3xl shadow-xs">
            <LoadingSpinner :label="t('reviewManagement.state.loading')" class="justify-center" />
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-16 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
            <ExclamationTriangleIcon class="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p class="text-sm font-bold text-rose-600">{{ error }}</p>
            <button @click="fetchMyReviews" class="mt-2 text-xs font-black text-(--color-primary) uppercase tracking-wider hover:underline">
              {{ t('reviewManagement.state.tryAgain') }}
            </button>
          </div>

          <!-- Tab: Reviews About You -->
          <div v-else-if="activeTab === 'about-you'" class="py-16 text-left border border-(--color-border) bg-(--color-surface) rounded-[32px] p-8 max-w-xl shadow-xs">
            <span class="text-4xl block mb-4">💬</span>
            <h2 class="text-2xl font-black text-(--color-text) tracking-tight">No reviews about you yet</h2>
            <p class="text-sm text-(--color-muted) leading-relaxed mt-2">
              Reviews written by hosts after check-out will appear here when they are published.
            </p>
          </div>

          <!-- Tab: Reviews By You (Airbnb Structure) -->
          <div v-else-if="activeTab === 'by-you'" class="space-y-12">
            
            <!-- SECTION 1: Reviews to Write -->
            <div class="space-y-4">
              <h3 class="text-lg font-black tracking-tight text-(--color-text)">Reviews to write</h3>
              
              <div v-if="completedStays.length === 0" class="border border-(--color-border) bg-(--color-surface-soft)/40 rounded-3xl p-6 text-sm text-(--color-muted) font-medium">
                You’ve written reviews for all your past trips. Nice work!
              </div>
              
              <div v-else class="grid gap-4 sm:grid-cols-2">
                <div
                  v-for="stay in completedStays"
                  :key="stay.id"
                  class="border border-(--color-border) bg-(--color-surface) rounded-[24px] p-5 shadow-xs flex items-center justify-between gap-4"
                >
                  <div class="min-w-0">
                    <h4 class="text-sm font-bold text-(--color-text) truncate">{{ stay.property_name || 'Property' }}</h4>
                    <p class="text-xs text-(--color-muted) mt-1">Checked out: {{ formatDate(stay.check_out_date) }}</p>
                  </div>
                  <button
                    type="button"
                    @click="router.push(`/customer/reservations/${stay.id}/review`)"
                    class="bg-(--color-primary) hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>Write review</span>
                    <ChevronRightIcon class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- SECTION 2: Past Reviews You've Written -->
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-(--color-border) pb-2">
                <h3 class="text-lg font-black tracking-tight text-(--color-text)">Past reviews you’ve written</h3>
                <span class="text-xs bg-(--color-surface-soft) text-(--color-muted) font-bold px-2.5 py-1 rounded-full border border-(--color-border)">
                  {{ totalReviews }} Written
                </span>
              </div>

              <!-- Search and Sort Strip -->
              <div v-if="reviews.length > 0" class="flex flex-col sm:flex-row gap-3 items-center justify-between pb-2">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search reviews..."
                  class="w-full sm:max-w-xs bg-(--color-surface) border border-(--color-border) rounded-xl px-4 py-2 text-xs font-semibold text-(--color-text) outline-none focus:border-(--color-primary) transition-all"
                />
                
                <div class="flex items-center gap-2 self-end sm:self-auto">
                  <select v-model="sortBy" class="bg-(--color-surface) border border-(--color-border) rounded-xl px-3 py-2 text-xs font-semibold text-(--color-text) outline-none cursor-pointer">
                    <option value="recent">Most recent</option>
                    <option value="highest">Highest rating</option>
                    <option value="lowest">Lowest rating</option>
                  </select>
                  <button
                    type="button"
                    @click="fetchMyReviews"
                    class="p-2 border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-soft) rounded-xl transition cursor-pointer"
                    title="Refresh"
                  >
                    <ArrowPathIcon class="h-4 w-4 text-(--color-text)" />
                  </button>
                </div>
              </div>

              <div v-if="filteredReviews.length === 0" class="border border-dashed border-(--color-border) rounded-[28px] py-12 text-center text-sm font-semibold text-(--color-muted)">
                <ChatBubbleLeftRightIcon class="h-10 w-10 mx-auto mb-2 opacity-35" />
                <p>No reviews found.</p>
              </div>

              <!-- Reviews List Stack -->
              <div v-else class="space-y-6">
                <div
                  v-for="review in filteredReviews"
                  :key="review.id"
                  class="border-b border-(--color-border) pb-8 last:border-b-0 flex flex-col md:flex-row gap-6 justify-between items-start"
                >
                  <!-- Left: Property Details & Meta -->
                  <div class="w-full md:w-56 shrink-0 space-y-1.5">
                    <span class="inline-flex text-[9px] font-mono font-black uppercase tracking-wider bg-(--color-surface-soft) text-(--color-muted) border border-(--color-border)/80 px-2 py-0.5 rounded-md">
                      #RES-{{ review.reservation_id }}
                    </span>
                    <h4 class="text-base font-black text-(--color-text) tracking-tight">
                      {{ review.property_name || 'Property' }}
                    </h4>
                    <p class="text-xs text-(--color-muted) font-semibold leading-relaxed">
                      {{ review.room_name || 'Room' }}
                    </p>
                    <p class="text-[10px] text-(--color-muted)/80 font-bold">
                      Stayed: {{ formatDate(review.check_in_date) }} &ndash; {{ formatDate(review.check_out_date) }}
                    </p>
                  </div>

                  <!-- Center: Rating, comment and responses -->
                  <div class="flex-1 space-y-3">
                    <div class="flex items-center gap-3">
                      <RatingStars :model-value="review.rating" readonly size="sm" />
                      <span class="text-xs font-black text-(--color-text) bg-(--color-surface-soft) px-2 py-0.5 rounded-md border border-(--color-border)">
                        {{ review.rating }}.0 ({{ ratingLabel(review.rating) }})
                      </span>
                      <span class="text-[10px] text-(--color-muted) font-semibold">
                        Reviewed: {{ formatDate(review.created_at) }}
                      </span>
                    </div>
                    
                    <p class="text-sm leading-relaxed text-(--color-text) font-normal break-words whitespace-pre-line">
                      {{ review.comment }}
                    </p>

                    <!-- Owner Response Reply Box -->
                    <div v-if="review.owner_reply" class="bg-(--color-surface-soft)/40 border border-(--color-border) rounded-2xl p-4 mt-3 relative">
                      <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-xs font-black text-(--color-text) flex items-center gap-1.5">
                          💬 Response from host
                        </span>
                      </div>
                      <p class="text-xs leading-relaxed text-(--color-muted) font-medium italic break-words">
                        &ldquo;{{ review.owner_reply }}&rdquo;
                      </p>
                    </div>
                  </div>

                  <!-- Right: Actions -->
                  <div class="flex sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      @click="openEdit(review)"
                      class="flex-1 md:w-28 border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-soft) text-(--color-text) font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <PencilSquareIcon class="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      @click="confirmDelete(review)"
                      class="flex-1 md:w-28 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <TrashIcon class="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <!-- EDIT REVIEW MODAL -->
      <div
        v-if="editingReview"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
        @click.self="closeEdit"
      >
        <div class="bg-(--color-surface) border border-(--color-border) rounded-[28px] w-full max-w-lg shadow-2xl p-6 space-y-6">
          <div class="flex justify-between items-center border-b border-(--color-border) pb-4">
            <h3 class="text-lg font-black text-(--color-text)">Edit review</h3>
            <button
              type="button"
              @click="closeEdit"
              class="text-(--color-muted) hover:text-(--color-text) text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-black text-(--color-muted) uppercase tracking-wider mb-2">Rating</label>
              <RatingStars v-model="editForm.rating" size="lg" />
            </div>
            
            <div>
              <label class="block text-xs font-black text-(--color-muted) uppercase tracking-wider mb-2">Comment</label>
              <textarea
                v-model="editForm.comment"
                rows="5"
                placeholder="Share details of your experience..."
                maxlength="500"
                class="w-full bg-(--color-surface-soft)/50 border border-(--color-border) rounded-2xl px-4 py-3 text-sm font-bold text-(--color-text) outline-none focus:border-(--color-primary) focus:bg-(--color-surface) transition"
              ></textarea>
              <div class="flex justify-end text-[10px] font-bold text-(--color-muted) mt-1">
                {{ editForm.comment.length }}/500
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="closeEdit"
              class="px-5 py-2.5 border border-(--color-border) text-(--color-text) text-xs font-bold rounded-xl hover:bg-(--color-surface-soft) transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="saving"
              @click="saveEdit"
              class="px-6 py-2.5 bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE CONFIRM MODAL -->
      <div
        v-if="deletingReview"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
        @click.self="cancelDelete"
      >
        <div class="bg-(--color-surface) border border-(--color-border) rounded-[28px] w-full max-w-sm shadow-2xl p-6 space-y-6">
          <div class="flex justify-between items-center border-b border-(--color-border) pb-4">
            <h3 class="text-lg font-black text-(--color-text)">Delete review</h3>
            <button
              type="button"
              @click="cancelDelete"
              class="text-(--color-muted) hover:text-(--color-text) text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <p class="text-sm text-(--color-muted) leading-relaxed font-semibold">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              @click="cancelDelete"
              class="px-5 py-2.5 border border-(--color-border) text-(--color-text) text-xs font-bold rounded-xl hover:bg-(--color-surface-soft) transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="deleting"
              @click="doDelete"
              class="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <span v-if="deleting">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <PublicFooter />
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>