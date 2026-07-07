<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import http from "@/app/api/http";
import { reservationApi } from "@/modules/reservations/api/reservation.api";
import AvailabilityCalendar from "@/modules/calendar/components/AvailabilityCalendar.vue";
import RoomFormModal from "@/modules/rooms/components/RoomFormModal.vue";
import { useRoomStore } from "@/modules/rooms/store/roomStore";
import { useToastStore } from "@/shared/store/toastStore";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import { formatPrice } from "@/shared/utils/currency";

const roomStore = useRoomStore();

const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");

// ── State ─────────────────────────────────────────────────────────────────────
const room = ref(null);
const images = ref([]);
const bookings = ref([]);
const loading = ref(true);
const bookingsLoading = ref(false);
const error = ref(null);
const activeTab = ref("calendar"); // "calendar" | "bookings" | "images"
const uploadingImages = ref(false);
const deletingImageId = ref(null);

// ── Edit modal state ─────────────────────────────────────────────────────────
const isEditRoomModalOpen = ref(false);
const editFormErrors = ref({});
const ownerProperties = ref([]);
const editRoomForm = ref({
  propertyId: "",
  type: "",
  roomName: "",
  guests: 2,
  description: "",
  basePrice: 0,
  inventory: 1,
  floorNumber: null,
  image: "",
  existingImages: [],
});

const roomId = computed(() => route.params.id);

// ── Fetch room detail ─────────────────────────────────────────────────────────
const fetchRoom = async () => {
  try {
    loading.value = true;
    error.value = null;
    const res = await http.get(`/rooms/${roomId.value}`);
    room.value = res?.data?.data ?? res?.data ?? res;
  } catch (err) {
    error.value =
      err?.response?.data?.message ?? t("owner.roomDetailPage.loadError");
    console.error("[OwnerRoomDetail] fetchRoom:", err);
  } finally {
    loading.value = false;
  }
};

// ── Fetch room images ─────────────────────────────────────────────────────────
const fetchImages = async () => {
  try {
    const res = await http.get(`/rooms/${roomId.value}/images`);
    const data = res?.data?.data ?? res?.data ?? [];
    images.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[OwnerRoomDetail] fetchImages:", err);
  }
};

// ── Fetch room bookings ───────────────────────────────────────────────────────
const fetchBookings = async () => {
  try {
    bookingsLoading.value = true;
    // Reuses the shared reservation API client instead of calling http
    // directly, so this endpoint has one source of truth across the app.
    // TODO: swap to a room-scoped endpoint (e.g. reservationApi.listOwnerReservationsByRoom(roomId))
    // once the backend exposes one — right now this fetches every owner
    // reservation and filters client-side, which won't scale forever.
    const res = await reservationApi.listOwnerReservations();
    const data = res?.data ?? res ?? [];
    const all = Array.isArray(data) ? data : [];

    // Filter by current room ID
    bookings.value = all.filter((b) => b.room_id === Number(roomId.value));
  } catch (err) {
    console.error("[OwnerRoomDetail] fetchBookings:", err);
    bookings.value = [];
  } finally {
    bookingsLoading.value = false;
  }
};

// ── Fetch owner's properties (needed for the edit modal's property dropdown) ──
const fetchOwnerProperties = async () => {
  try {
    const res = await http.get("/properties/my");
    const data = res?.data?.data ?? res?.data ?? res;
    const list = Array.isArray(data) ? data : [];

    // The raw API returns `property_name`, but RoomFormModal.vue's dropdown
    // (shared with ManageRoomsView.vue) reads `.name` — normalize here so
    // the modal doesn't need two different property shapes depending on
    // which page opened it.
    ownerProperties.value = list.map((p) => ({
      ...p,
      name: p.property_name || p.name,
    }));
  } catch (err) {
    console.error("[OwnerRoomDetail] fetchOwnerProperties:", err);
  }
};

// Floor number defaults to 1 when left blank — mirrors ManageRoomsView.vue's
// behavior so editing a room from either page produces the same result.
const normalizeFloorNumber = (value) => {
  if (value === null || value === undefined || value === "") return 1;
  return Number(value);
};

// ── Edit modal ────────────────────────────────────────────────────────────────
const openEditRoomModal = () => {
  if (!room.value) return;

  editRoomForm.value = {
    propertyId: room.value.property_id,
    type: room.value.room_type_id,
    roomName: room.value.room_name || room.value.type,
    guests: room.value.max_guests || room.value.guests,
    description: room.value.description || "",
    basePrice: room.value.price_per_night || room.value.basePrice,
    inventory: room.value.total_rooms || room.value.inventory,
    floorNumber: room.value.floor_number ?? null,
    image: room.value.image || "",
    existingImages: images.value.map((img) => ({
      id: img.id,
      url: getFullImageUrl(img.image_url),
      isCover: img.is_cover === 1,
    })),
  };

  editFormErrors.value = {};
  isEditRoomModalOpen.value = true;
};

const closeEditRoomModal = () => {
  isEditRoomModalOpen.value = false;
};

const handleEditRoom = async (formData) => {
  editFormErrors.value = {};

  const errors = {};
  if (!formData.propertyId) errors.propertyId = t("owner.manageRoomsPage.errors.chooseProperty");
  if (!formData.type) errors.type = t("owner.manageRoomsPage.errors.typeRequired");
  editFormErrors.value = errors;
  if (Object.keys(errors).length > 0) return;

  try {
    await roomStore.updateRoom(formData.propertyId, roomId.value, {
      room_type_id: Number(formData.type),
      room_name: formData.roomName,
      description: formData.description,
      price_per_night: Number(formData.basePrice),
      max_guests: Number(formData.guests),
      total_rooms: Number(formData.inventory),
      floor_number: normalizeFloorNumber(formData.floorNumber),
    });

    // Delete any existing images the owner removed in the modal.
    if (formData.removedImageIds?.length) {
      for (const imageId of formData.removedImageIds) {
        try {
          await roomStore.deleteRoomImage(roomId.value, imageId);
        } catch (delErr) {
          console.error(`Failed to delete image ${imageId}:`, delErr);
          toast.danger(t("owner.manageRoomsPage.toasts.imageRemoveFailed"));
        }
      }
    }

    // Upload new images if any
    if (formData.imageFiles?.length) {
      const fd = new FormData();
      formData.imageFiles.forEach((file) => fd.append("images", file));
      try {
        await roomStore.uploadRoomImages(roomId.value, fd);
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
        toast.danger(t("owner.manageRoomsPage.toasts.imageUploadFailed"));
      }
    }

    closeEditRoomModal();
    toast.success(t("owner.manageRoomsPage.toasts.roomUpdated"), { title: t("owner.roomDetailPage.updatedTitle") });

    // Refresh this page's own data so the header, stats, and image
    // gallery immediately reflect the edit instead of waiting for a
    // manual refresh.
    await Promise.all([fetchRoom(), fetchImages()]);
  } catch (err) {
    toast.danger(err?.response?.data?.message ?? t("owner.roomDetailPage.updateFailed"), {
      title: t("owner.roomDetailPage.updateFailedTitle"),
    });
  }
};

// ── Image upload ──────────────────────────────────────────────────────────────
const handleImageUpload = async (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  uploadingImages.value = true;
  try {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    await http.post(`/rooms/${roomId.value}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchImages();
    toast.success(t("owner.roomDetailPage.imagesUploaded"), { title: t("owner.roomDetailPage.uploadedTitle") });
  } catch (err) {
    toast.danger(err?.response?.data?.message ?? t("owner.roomDetailPage.imagesUploadFailed"), {
      title: t("owner.roomDetailPage.uploadFailedTitle"),
    });
  } finally {
    uploadingImages.value = false;
  }
};

// ── Delete image ──────────────────────────────────────────────────────────────
const handleDeleteImage = async (imageId) => {
  deletingImageId.value = imageId;
  try {
    await http.delete(`/rooms/${roomId.value}/images/${imageId}`);
    images.value = images.value.filter((i) => i.id !== imageId);
    toast.success(t("owner.roomDetailPage.imageDeleted"), { title: t("owner.roomDetailPage.deletedTitle") });
  } catch (err) {
    toast.danger(err?.response?.data?.message ?? t("owner.roomDetailPage.imageDeleteFailed"), {
      title: t("owner.roomDetailPage.deleteFailedTitle"),
    });
  } finally {
    deletingImageId.value = null;
  }
};

// ── Set cover image ───────────────────────────────────────────────────────────
const handleSetCover = async (imageId) => {
  try {
    await http.patch(`/rooms/${roomId.value}/images/${imageId}/cover`);
    images.value = images.value.map((i) => ({
      ...i,
      is_cover: i.id === imageId ? 1 : 0,
    }));
    toast.success(t("owner.roomDetailPage.coverUpdated"), { title: t("owner.roomDetailPage.updatedTitle") });
  } catch (err) {
    toast.danger(t("owner.roomDetailPage.coverUpdateFailed"), { title: t("owner.roomDetailPage.errorTitle") });
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getFullImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
};

const coverImage = computed(() => {
  const cover = images.value.find((i) => i.is_cover === 1) || images.value[0];
  return cover ? getFullImageUrl(cover.image_url) : null;
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getBookingStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "confirmed")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

// ── Tab change ────────────────────────────────────────────────────────────────
const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === "bookings" && bookings.value.length === 0) {
    fetchBookings();
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchRoom(), fetchImages(), fetchOwnerProperties()]);
});
</script>

<template> <div class=" bg-(--color-page) text-(--color-text) ">
    <!-- Loading -->
    <OwnerLoadingState v-if="loading" :label="t('owner.roomDetailPage.loading')" />

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex items-center justify-center min-h-[60vh]"
    >
      <div class="text-center space-y-3">
        <p class="text-sm font-bold text-rose-500">{{ error }}</p>
        <button
          @click="fetchRoom"
          class="text-xs font-black text-(--color-primary) uppercase tracking-widest hover:underline"
        >
          {{ t("owner.roomDetailPage.retry") }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="room">
      <!-- Back + Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-muted) hover:text-(--color-primary) transition-colors mb-6 group"
        >
          <ArrowLeftIcon
            class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          />
          {{ t("owner.roomDetailPage.backToRooms") }}
        </button>

        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-1"
            >
              {{ t("owner.roomDetailPage.roomDetail") }}
            </p>
            <h1 class="text-3xl font-black tracking-tight text-(--color-text)">
              {{ room.room_name }}
            </h1>
            <p class="text-sm text-(--color-muted) mt-1">
              ID: #ROOM-{{ room.id }}
            </p>
          </div>

          <!-- Edit button -->
          <button
            @click="openEditRoomModal"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--color-primary) hover:bg-(--color-primary-strong) text-white text-xs font-black uppercase tracking-widest transition-colors shadow-md"
          >
            <PencilSquareIcon class="w-4 h-4" />
            {{ t("owner.manageRoomsPage.editRoom") }}
          </button>
        </div>
      </div>

      <!-- Hero + Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Cover Image -->
        <div class="lg:col-span-1">
          <div
            class="relative rounded-[24px] overflow-hidden border border-(--color-border) bg-(--color-surface) aspect-[4/3]"
            :class="images.length > 0 ? 'cursor-pointer group' : ''"
            @click="images.length > 0 && switchTab('images')"
          >
            <img
              v-if="coverImage"
              :src="coverImage"
              :alt="room.room_name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-(--color-surface-soft)"
            >
              <PhotoIcon class="w-12 h-12 text-(--color-border)" />
            </div>

            <span
              v-if="images.length > 1"
              class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white shadow-md"
            >
              <PhotoIcon class="w-3.5 h-3.5" />
              {{ t("owner.roomDetailPage.photosCount", { count: images.length }) }}
            </span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-[20px] p-5"
          >
            <div
              class="w-8 h-8 rounded-lg bg-(--color-primary-soft) flex items-center justify-center mb-3"
            >
              <CurrencyDollarIcon class="w-4 h-4 text-(--color-primary)" />
            </div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)"
            >
              {{ t("owner.roomDetailPage.pricePerNight") }}
            </p>
            <p class="text-2xl font-black text-(--color-primary) mt-1">
              {{ formatPrice(room.price_per_night) }}
            </p>
          </div>

          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-[20px] p-5"
          >
            <div
              class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3"
            >
              <UsersIcon class="w-4 h-4 text-blue-600" />
            </div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)"
            >
              {{ t("owner.roomDetailPage.maxGuests") }}
            </p>
            <p class="text-2xl font-black text-(--color-text) mt-1">
              {{ room.max_guests }}
            </p>
          </div>

          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-[20px] p-5"
          >
            <div
              class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3"
            >
              <HomeModernIcon class="w-4 h-4 text-emerald-600" />
            </div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)"
            >
              {{ t("owner.roomDetailPage.totalRooms") }}
            </p>
            <p class="text-2xl font-black text-(--color-text) mt-1">
              {{ room.total_rooms }}
            </p>
          </div>

          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-[20px] p-5 sm:col-span-3"
          >
            <p
              class="text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-2"
            >
              {{ t("owner.roomDetailPage.description") }}
            </p>
            <p class="text-sm text-(--color-muted) font-medium leading-relaxed">
              {{ room.description || t("owner.roomDetailPage.noDescription") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-(--color-border) mb-6">
        <div class="flex items-center gap-1">
          <button
            v-for="tab in [
              { id: 'calendar', label: t('owner.roomDetailPage.tabAvailability'), icon: CalendarDaysIcon },
              { id: 'bookings', label: t('owner.roomDetailPage.tabBookings'), icon: UsersIcon },
              { id: 'images', label: t('owner.roomDetailPage.tabImages'), icon: PhotoIcon },
            ]"
            :key="tab.id"
            @click="switchTab(tab.id)"
            class="flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all"
            :class="
              activeTab === tab.id
                ? 'border-(--color-primary) text-(--color-primary)'
                : 'border-transparent text-(--color-muted) hover:text-(--color-text)'
            "
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab: Availability Calendar -->
      <div v-show="activeTab === 'calendar'">
        <div
          class="bg-(--color-surface) border border-(--color-border) rounded-[24px] p-6"
        >
          <h2
            class="text-xs font-black uppercase tracking-widest text-(--color-muted) mb-4"
          >
            {{ t("owner.roomDetailPage.availabilityCalendar") }}
          </h2>
          <AvailabilityCalendar :room-id="room.id" mode="owner" />
        </div>
      </div>

      <!-- Tab: Bookings -->
      <div v-show="activeTab === 'bookings'">
        <!-- Loading -->
        <div v-if="bookingsLoading" class="text-center py-12">
          <div
            class="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-3"
          />
          <p class="text-sm text-(--color-muted) font-medium">
            {{ t("owner.roomDetailPage.loadingBookings") }}
          </p>
        </div>

        <!-- Empty -->
        <div
          v-else-if="bookings.length === 0"
          class="text-center py-16 border border-dashed border-(--color-border) rounded-[24px]"
        >
          <CalendarDaysIcon
            class="w-10 h-10 text-(--color-border) mx-auto mb-3"
          />
          <p class="text-sm font-bold text-(--color-text)">{{ t("owner.roomDetailPage.noBookings") }}</p>
          <p class="text-xs text-(--color-muted) mt-1">
            {{ t("owner.roomDetailPage.noBookingsDesc") }}
          </p>
        </div>

        <!-- Bookings List -->
        <div v-else class="space-y-4">
          <div
            v-for="booking in bookings"
            :key="booking.id"
            class="bg-(--color-surface) border border-(--color-border) rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-black text-(--color-text)">
                  {{ booking.customer_name || t("owner.roomDetailPage.guest") }}
                </p>
                <span
                  class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  :class="getBookingStatusColor(booking.reservation_status)"
                >
                  {{ statusLabel(booking.reservation_status) }}
                </span>
              </div>
              <p class="text-xs text-(--color-muted) font-medium">
                {{ booking.customer_email }}
              </p>
              <div
                class="flex items-center gap-3 text-xs text-(--color-muted) pt-1"
              >
                <span
                  >{{ t("owner.roomDetailPage.checkIn") }}:
                  <strong class="text-(--color-text)">{{
                    formatDate(booking.check_in_date)
                  }}</strong></span
                >
                <span>→</span>
                <span
                  >{{ t("owner.roomDetailPage.checkOut") }}:
                  <strong class="text-(--color-text)">{{
                    formatDate(booking.check_out_date)
                  }}</strong></span
                >
                <span>·</span>
                <span
                  >{{ t("owner.roomDetailPage.nightsCount", { count: booking.total_nights }) }}</span
                >
              </div>
            </div>

            <div class="text-right">
              <p
                class="text-[9px] font-black uppercase tracking-widest text-(--color-muted)"
              >
                {{ t("owner.roomDetailPage.total") }}
              </p>
              <p class="text-xl font-black text-(--color-primary)">
                {{ formatPrice(booking.total_amount) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Images -->
      <div v-show="activeTab === 'images'">
        <div class="space-y-6">
          <!-- Upload button -->
          <div class="flex items-center justify-between">
            <p
              class="text-xs font-black uppercase tracking-widest text-(--color-muted)"
            >
              {{ t("owner.roomDetailPage.imagesCount", { count: images.length }) }}
            </p>
            <label
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--color-primary) hover:bg-(--color-primary-strong) text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md"
            >
              <PhotoIcon class="w-4 h-4" />
              {{ uploadingImages ? t("owner.roomDetailPage.uploading") : t("owner.roomDetailPage.uploadImages") }}
              <input
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                :disabled="uploadingImages"
                @change="handleImageUpload"
              />
            </label>
          </div>

          <!-- Empty -->
          <div
            v-if="images.length === 0"
            class="text-center py-16 border border-dashed border-(--color-border) rounded-[24px]"
          >
            <PhotoIcon class="w-10 h-10 text-(--color-border) mx-auto mb-3" />
            <p class="text-sm font-bold text-(--color-text)">{{ t("owner.roomDetailPage.noImages") }}</p>
            <p class="text-xs text-(--color-muted) mt-1">
              {{ t("owner.roomDetailPage.noImagesDesc") }}
            </p>
          </div>

          <!-- Images Grid -->
          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div
              v-for="image in images"
              :key="image.id"
              class="relative group rounded-[16px] overflow-hidden border border-(--color-border) aspect-square bg-(--color-surface-soft)"
            >
              <img
                :src="getFullImageUrl(image.image_url)"
                :alt="`Room image ${image.id}`"
                class="w-full h-full object-cover"
              />

              <!-- Cover badge -->
              <div
                v-if="image.is_cover === 1"
                class="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              >
                {{ t("owner.roomDetailPage.cover") }}
              </div>

              <!-- Actions overlay -->
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
              >
                <!-- Set as cover -->
                <button
                  v-if="image.is_cover !== 1"
                  @click="handleSetCover(image.id)"
                  class="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                  :title="t('owner.roomDetailPage.setAsCover')"
                >
                  <CheckCircleIcon class="w-4 h-4" />
                </button>

                <!-- Delete -->
                <button
                  @click="handleDeleteImage(image.id)"
                  :disabled="deletingImageId === image.id"
                  class="p-2 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition disabled:opacity-50"
                  :title="t('owner.roomDetailPage.deleteImage')"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <RoomFormModal
      :open="isEditRoomModalOpen"
      :title="t('owner.manageRoomsPage.editRoom')"
      :model-value="editRoomForm"
      :properties="ownerProperties"
      :errors="editFormErrors"
      :submit-label="t('owner.manageRoomsPage.saveChanges')"
      @close="closeEditRoomModal"
      @submit="(data) => handleEditRoom(data)"
    />
  </div>
</template>
