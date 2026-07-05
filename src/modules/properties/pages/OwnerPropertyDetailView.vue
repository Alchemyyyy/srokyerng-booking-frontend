<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { propertyApi } from "../api/property.api";
import AppModal from "@/shared/components/AppModal.vue";
import AppInput from "@/shared/components/AppInput.vue";
import AppButton from "@/shared/components/AppButton.vue";
import PropertyLocationMap from "@/shared/components/PropertyLocationMap.vue";
import AvailabilityCalendar from "@/modules/calendar/components/AvailabilityCalendar.vue";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { useToastStore } from "@/shared/store/toastStore";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import {
  ClockIcon,
  XCircleIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const loading = ref(true);
const error = ref("");
const property = ref(null);
const images = ref([]);
const togglingStatus = ref(false);

const previewImageUrl = ref(null);
const openImagePreview = (url) => {
  previewImageUrl.value = url;
  document.body.style.overflow = "hidden";
};
const closeImagePreview = () => {
  previewImageUrl.value = null;
  document.body.style.overflow = "";
};

// 'pending' | 'rejected' | null
const editRequestStatus = ref(null);
const editRequestReason = ref("");

// ── Edit modal state ──────────────────────────────────────────────────────────
const isEditModalOpen = ref(false);
const editSubmitting = ref(false);
const editForm = ref({
  name: "",
  type: "Hotel",
  location: "Phnom Penh",
  address: "",
  description: "",
  contact_phone: "",
  contact_email: "",
  number_of_floors: 1,
});
const editErrors = ref({});
const cities = ref([]);

const categoryMap = {
  Hotel: 1,
  Villa: 2,
  Apartment: 3,
  Homestay: 4,
  Guesthouse: 5,
};

const propertyTypeOptions = computed(() => [
  { value: "Hotel", label: t("owner.propertiesPage.types.hotel") },
  { value: "Villa", label: t("owner.propertiesPage.types.villa") },
  { value: "Apartment", label: t("owner.propertiesPage.types.apartment") },
  { value: "Homestay", label: t("owner.propertiesPage.types.homestay") },
  { value: "Guesthouse", label: t("owner.propertiesPage.types.guesthouse") },
]);

const cityCoordinates = {
  "Phnom Penh": { lat: 11.5564, lng: 104.9282 },
  "Siem Reap": { lat: 13.3671, lng: 103.8448 },
  Kampot: { lat: 10.6112, lng: 104.181 },
  Sihanoukville: { lat: 10.6345, lng: 103.4972 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
  "Koh Rong": { lat: 10.7167, lng: 103.25 },
};

// ── Computed status helper ────────────────────────────────────────────────────
const statusName = computed(
  () =>
    property.value?.status?.status_name || property.value?.status_name || "",
);

const isApproved = computed(() => statusName.value === "approved");

// ── Fallback image ────────────────────────────────────────────────────────────
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f0f2f5'/%3E%3Crect x='300' y='160' width='600' height='440' rx='32' ry='32' fill='none' stroke='%23c8cdd6' stroke-width='18'/%3E%3Ccircle cx='460' cy='310' r='60' fill='%23c8cdd6'/%3E%3Cpolygon points='300,600 560,340 720,500 840,380 900,600' fill='%23c8cdd6'/%3E%3C/svg%3E";

// ── Format date ───────────────────────────────────────────────────────────────
const formatDate = (value) => {
  if (!value) return t("owner.propertyDetailPage.notAvailable");
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return t("owner.propertyDetailPage.notAvailable");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ── Status badge class ────────────────────────────────────────────────────────
const statusBadgeClass = computed(() => {
  switch (statusName.value) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "suspended":
      return "bg-blue-50 text-blue-700 border-blue-100";
    default:
      return "bg-rose-50 text-rose-700 border-rose-100";
  }
});

const statusDotClass = computed(() => {
  switch (statusName.value) {
    case "approved":
      return "bg-emerald-500";
    case "pending":
      return "bg-amber-500 animate-pulse";
    case "suspended":
      return "bg-blue-500";
    default:
      return "bg-rose-500";
  }
});

// ── Can edit: approved + no pending edit ──────────────────────────────────────
const canEdit = computed(() => editRequestStatus.value !== "pending");

// ── Fetch images ──────────────────────────────────────────────────────────────
const fetchImages = async () => {
  try {
    const res = await propertyApi.getAllPropertyImages(route.params.id);
    const items = Array.isArray(res) ? res : res?.data || [];
    images.value = items.map((img) => ({
      ...img,
      url: resolveAssetUrl(img.image_url),
    }));
  } catch (err) {
    console.error("Failed to load images:", err);
  }
};

// ── Fetch property ────────────────────────────────────────────────────────────
const fetchProperty = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await propertyApi.getMyPropertyById(route.params.id);
    const data = Array.isArray(res) ? res[0] : res?.data || res;
    property.value = data;
  } catch (err) {
    error.value = t("owner.propertyDetailPage.toasts.loadPropertyDetailsFailed");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// ── Fetch cities ──────────────────────────────────────────────────────────────
const fetchCities = async () => {
  try {
    const res = await propertyApi.getCities();
    cities.value = Array.isArray(res) ? res : (res?.data ?? []);
  } catch {
    cities.value = [];
  }
};

// ── Fetch edit-request status ─────────────────────────────────────────────────
const fetchEditRequestStatus = async () => {
  editRequestStatus.value = null;
  editRequestReason.value = "";
  if (statusName.value !== "approved") return;

  try {
    const pendingRes = await propertyApi.getPendingEditRequest(route.params.id);
    const pending = Array.isArray(pendingRes)
      ? pendingRes[0]
      : (pendingRes?.data ?? pendingRes);
    if (
      pending &&
      (pending.status === "pending" || pending.status_name === "pending")
    ) {
      editRequestStatus.value = "pending";
      return;
    }
  } catch {
    // no pending request
  }

  try {
    const historyRes = await propertyApi.getEditRequests(route.params.id);
    const history = Array.isArray(historyRes)
      ? historyRes
      : (historyRes?.data ?? []);
    const latest = history[0];
    if (
      latest &&
      (latest.status === "rejected" || latest.status_name === "rejected")
    ) {
      editRequestStatus.value = "rejected";
      editRequestReason.value =
        latest.rejection_reason ||
        latest.rejected_reason ||
        latest.reason ||
        "";
    }
  } catch {
    // no history
  }
};

// ── Open edit modal ───────────────────────────────────────────────────────────
const openEditModal = () => {
  if (!property.value) return;
  const p = property.value;
  editForm.value = {
    name: p.property_name || "",
    type: (() => {
      const raw = p.category?.category_name || p.category_name || "Hotel";
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    })(),
    location: p.city?.city_name || p.city_name || "Phnom Penh",
    address: p.address || "",
    description: p.description || "",
    contact_phone: p.contact_phone || "",
    contact_email: p.contact_email || "",
    number_of_floors: p.number_of_floors ?? 1,
  };
  editErrors.value = {};
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editErrors.value = {};
};

// ── Validate edit form ────────────────────────────────────────────────────────
const validateEdit = () => {
  const e = {};
  if (!editForm.value.name.trim())
    e.name = t("owner.propertyDetailPage.errors.nameRequired");
  else if (editForm.value.name.trim().length < 3)
    e.name = t("owner.propertyDetailPage.errors.nameMinLength");
  if (!editForm.value.address.trim())
    e.address = t("owner.propertyDetailPage.errors.addressRequired");
  else if (editForm.value.address.trim().length < 5)
    e.address = t("owner.propertyDetailPage.errors.addressMinLength");
  if (!editForm.value.contact_phone.trim())
    e.contact_phone = t("owner.propertyDetailPage.errors.phoneRequired");
  if (!editForm.value.contact_email.trim())
    e.contact_email = t("owner.propertyDetailPage.errors.emailRequired");
  else if (!/\S+@\S+\.\S+/.test(editForm.value.contact_email))
    e.contact_email = t("owner.propertyDetailPage.errors.emailInvalid");
  editErrors.value = e;
  return Object.keys(e).length === 0;
};

// ── Submit edit ───────────────────────────────────────────────────────────────
const handleEditSubmit = async () => {
  if (!validateEdit()) return;

  const coords = cityCoordinates[editForm.value.location] || {
    lat: property.value?.latitude || 11.5564,
    lng: property.value?.longitude || 104.9282,
  };

  const matchedCity = cities.value.find(
    (c) => c.name === editForm.value.location,
  );

  const payload = {
    property_name: editForm.value.name,
    category_id: categoryMap[editForm.value.type] || 1,
    description: editForm.value.description || "",
    address: editForm.value.address,
    city_id: matchedCity?.id ?? null,
    province_id: matchedCity?.province_id ?? null,
    country_id: 1,
    latitude: coords.lat,
    longitude: coords.lng,
    contact_phone: editForm.value.contact_phone,
    contact_email: editForm.value.contact_email,
    number_of_floors: Number(editForm.value.number_of_floors) || 1,
  };

  editSubmitting.value = true;
  try {
    if (isApproved.value) {
      // Approved property → submit edit request for admin approval
      await propertyApi.submitEditRequest(route.params.id, payload);
      toast.success(
        t("owner.propertyDetailPage.toasts.propertyChangesSubmitted"),
      );
      editRequestStatus.value = "pending";
    } else {
      // Non-approved property → update directly
      await propertyApi.updateProperty(route.params.id, payload);
      toast.success(t("owner.propertyDetailPage.toasts.propertyUpdated"));
      await fetchProperty();
    }
    closeEditModal();
    await fetchEditRequestStatus();
  } catch (err) {
    toast.danger(t("owner.propertyDetailPage.toasts.submitChangesFailed"));
    console.error(err);
  } finally {
    editSubmitting.value = false;
  }
};

// ── Deactivate / Activate ─────────────────────────────────────────────────────
const handleDeactivate = async () => {
  if (!confirm(t("owner.propertyDetailPage.confirm.deactivateMessage")))
    return;
  togglingStatus.value = true;
  try {
    await propertyApi.deactivateProperty(route.params.id);
    await fetchProperty();
  } catch (err) {
    console.error("Failed to deactivate:", err);
  } finally {
    togglingStatus.value = false;
  }
};

const handleActivate = async () => {
  if (!confirm(t("owner.propertyDetailPage.confirm.activateMessage"))) return;
  togglingStatus.value = true;
  try {
    await propertyApi.activateProperty(route.params.id);
    await fetchProperty();
  } catch (err) {
    console.error("Failed to activate:", err);
  } finally {
    togglingStatus.value = false;
  }
};

onMounted(async () => {
  await fetchProperty();
  await fetchImages();
  await Promise.all([fetchEditRequestStatus(), fetchCities()]);
});
</script>

<template>
  <main class="ml-64 mt-25 min-h-screen px-6 pb-10 text-(--color-text)">
    <!-- Loading -->
    <OwnerLoadingState
      v-if="loading"
      :label="t('owner.propertyDetailPage.loading')"
    />

    <!-- Error -->
    <div v-else-if="error" class="py-24 text-center text-rose-500 text-sm">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="property" class="space-y-6">
      <!-- Header -->
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <button
            @click="router.push({ name: 'owner.properties' })"
            class="text-xs text-(--color-muted) hover:text-(--color-primary) transition mb-2"
          >
            ← {{ t("owner.propertyDetailPage.backToProperties") }}
          </button>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ property.property_name }}
          </h1>
          <p class="text-sm text-(--color-muted) mt-1">
            {{ property.city?.city_name }},
            {{ property.province?.province_name }},
            {{ property.country?.country_name }}
          </p>
        </div>

        <!-- Status badges -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border"
            :class="statusBadgeClass"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass" />
            {{ statusLabel(statusName) }}
          </span>

          <span
            v-if="editRequestStatus === 'pending'"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-amber-100 text-amber-700 border-amber-200"
          >
            <ClockIcon class="w-3 h-3" />
            {{ t("owner.propertyDetailPage.badges.pendingChanges") }}
          </span>

          <span
            v-else-if="editRequestStatus === 'rejected'"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-rose-50 text-rose-700 border-rose-100"
          >
            <XCircleIcon class="w-3 h-3" />
            {{ t("owner.propertyDetailPage.badges.changesRejected") }}
          </span>
        </div>
      </header>

      <!-- ── Edit-request banners ──────────────────────────────────────────── -->
      <!-- Pending banner -->
      <div
        v-if="editRequestStatus === 'pending'"
        class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-700"
      >
        <ClockIcon class="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <p class="font-bold text-sm">
            {{ t("owner.propertyDetailPage.banners.pendingTitle") }}
          </p>
          <p class="text-[13px] text-amber-600 mt-0.5">
            {{ t("owner.propertyDetailPage.banners.pendingMessage") }}
          </p>
        </div>
      </div>

      <!-- Rejected banner -->
      <div
        v-else-if="editRequestStatus === 'rejected'"
        class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700"
      >
        <XCircleIcon class="w-5 h-5 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-bold text-sm">
            {{ t("owner.propertyDetailPage.banners.rejectedTitle") }}
          </p>
          <p v-if="editRequestReason" class="text-[13px] mt-1">
            <span class="font-semibold"
              >{{ t("owner.propertyDetailPage.banners.reasonLabel") }}:</span
            >
            {{ editRequestReason }}
          </p>
          <p class="text-[13px] mt-1 opacity-80">
            {{ t("owner.propertyDetailPage.banners.rejectedMessage") }}
          </p>
          <button
            @click="openEditModal"
            class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
          >
            <PencilSquareIcon class="w-3.5 h-3.5" />
            {{ t("owner.propertyDetailPage.banners.editAndResubmit") }}
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 1. Images -->
          <div
            v-if="images.length > 0"
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.propertyImages") }}
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="img in images"
                :key="img.id"
                class="relative aspect-[4/3] rounded-xl overflow-hidden bg-(--color-surface-soft) group cursor-pointer"
                @click="openImagePreview(img.url)"
              >
                <img
                  :src="img.url"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  v-if="img.is_cover"
                  class="absolute top-2 left-2 bg-(--color-primary) text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                >
                  {{ t("owner.propertyDetailPage.cover") }}
                </span>
              </div>
            </div>
          </div>

          <!-- No images -->
          <div
            v-else-if="!loading"
            class="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-6 text-center space-y-3"
          >
            <div
              class="aspect-[4/3] max-w-xs mx-auto rounded-xl overflow-hidden bg-(--color-surface-soft)"
            >
              <img
                :src="fallbackImage"
                :alt="t('owner.propertyDetailPage.noImagesAlt')"
                class="w-full h-full object-cover"
              />
            </div>
            <p class="text-(--color-muted) text-sm">
              {{ t("owner.propertyDetailPage.noImagesUploaded") }}
            </p>
          </div>

          <!-- 2. Availability Calendar -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.availabilityCalendar") }}
            </h2>
            <AvailabilityCalendar :property-id="property.id" mode="owner" />
          </div>

          <!-- 3. Property Information -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.propertyInformation") }}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{
                    t("owner.propertyDetailPage.fields.propertyName")
                  }}</span
                >
                <span class="font-semibold">{{ property.property_name }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.category") }}</span
                >
                <span class="font-semibold">{{
                  property.category?.category_name ||
                  property.category_name ||
                  "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.city") }}</span
                >
                <span class="font-semibold">{{
                  property.city?.city_name || property.city || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.province") }}</span
                >
                <span class="font-semibold">{{
                  property.province?.province_name || property.province || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.country") }}</span
                >
                <span class="font-semibold">{{
                  property.country?.country_name || property.country || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{
                    t("owner.propertyDetailPage.fields.numberOfFloors")
                  }}</span
                >
                <span class="font-semibold">{{
                  property.number_of_floors ?? "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.address") }}</span
                >
                <span class="font-semibold">{{ property.address || "-" }}</span>
              </div>
              <div v-if="property.description" class="sm:col-span-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.description") }}</span
                >
                <span class="font-semibold">{{ property.description }}</span>
              </div>
            </div>
          </div>

          <!-- 4. Contact Information -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.contactInformation") }}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.phone") }}</span
                >
                <span class="font-semibold">{{
                  property.contact_phone || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.email") }}</span
                >
                <span class="font-semibold">{{
                  property.contact_email || "-"
                }}</span>
              </div>
            </div>
          </div>

          <!-- 5. Location Coordinates -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.locationCoordinates") }}
            </h2>
            <PropertyLocationMap
              :latitude="property.latitude"
              :longitude="property.longitude"
              :label="property.property_name"
            />
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.latitude") }}</span
                >
                <span class="font-semibold">{{
                  property.latitude || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.longitude") }}</span
                >
                <span class="font-semibold">{{
                  property.longitude || "-"
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- End left column -->

        <!-- Right column -->
        <div class="space-y-6">
          <!-- Owner Info -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.ownerInformation") }}
            </h2>
            <div class="space-y-3 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.name") }}</span
                >
                <span class="font-semibold">{{
                  property.owner?.full_name || property.full_name || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.phone") }}</span
                >
                <span class="font-semibold">{{
                  property.owner?.phone || property.owner_phone || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >{{ t("owner.propertyDetailPage.fields.email") }}</span
                >
                <span class="font-semibold">{{
                  property.owner?.email || property.owner_email || "-"
                }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-3"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.quickActions") }}
            </h2>

            <!-- Edit Property button — context-aware -->
            <button
              v-if="canEdit"
              @click="openEditModal"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-(--color-primary-soft) text-(--color-primary) text-sm font-semibold hover:bg-(--color-primary)/20 transition"
            >
              <span class="flex items-center gap-2">
                <PencilSquareIcon class="w-4 h-4" />
                {{ t("owner.propertyDetailPage.actions.editProperty") }}
              </span>
              <span>→</span>
            </button>

            <!-- Pending edit: edit disabled -->
            <div
              v-else-if="editRequestStatus === 'pending'"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 text-sm font-semibold cursor-not-allowed opacity-80"
            >
              <span class="flex items-center gap-2">
                <ClockIcon class="w-4 h-4" />
                {{ t("owner.propertyDetailPage.actions.editPendingApproval") }}
              </span>
              <span class="text-xs font-medium">{{
                t("owner.propertyDetailPage.actions.locked")
              }}</span>
            </div>

            <!-- Manage Rooms -->
            <RouterLink
              :to="`/owner/rooms?propertyId=${property.id}`"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-(--color-primary-soft) text-(--color-primary) text-sm font-semibold hover:bg-(--color-primary)/20 transition"
            >
              <span>{{ t("owner.propertyDetailPage.actions.manageRooms") }}</span>
              <span>→</span>
            </RouterLink>

            <!-- Deactivate — only if approved -->
            <button
              v-if="statusName === 'approved'"
              @click="handleDeactivate"
              :disabled="togglingStatus"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 disabled:opacity-50 transition"
            >
              <span>{{
                togglingStatus
                  ? t("owner.propertyDetailPage.actions.processing")
                  : t("owner.propertyDetailPage.actions.deactivateProperty")
              }}</span>
              <span>⏸</span>
            </button>

            <!-- Activate — only if suspended -->
            <button
              v-if="statusName === 'suspended'"
              @click="handleActivate"
              :disabled="togglingStatus"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50 transition"
            >
              <span>{{
                togglingStatus
                  ? t("owner.propertyDetailPage.actions.processing")
                  : t("owner.propertyDetailPage.actions.activateProperty")
              }}</span>
              <span>▶</span>
            </button>

            <!-- Back to Properties -->
            <button
              @click="router.push({ name: 'owner.properties' })"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-(--color-border) text-(--color-muted) text-sm font-semibold hover:bg-(--color-surface-soft) transition"
            >
              <span>{{ t("owner.propertyDetailPage.backToProperties") }}</span>
              <span>→</span>
            </button>
          </div>

          <!-- Timeline -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-3 text-sm"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              {{ t("owner.propertyDetailPage.sections.timeline") }}
            </h2>
            <div>
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                >{{ t("owner.propertyDetailPage.fields.created") }}</span
              >
              <span class="font-semibold">{{
                formatDate(property.created_at)
              }}</span>
            </div>
            <div>
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                >{{ t("owner.propertyDetailPage.fields.lastUpdated") }}</span
              >
              <span class="font-semibold">{{
                formatDate(property.updated_at)
              }}</span>
            </div>
          </div>
        </div>
        <!-- End right column -->
      </div>
    </div>
  </main>

  <!-- ── Edit Property Modal ─────────────────────────────────────────────────── -->
  <AppModal
    :open="isEditModalOpen"
    :title="
      isApproved
        ? t('owner.propertyDetailPage.modal.requestChangesTitle')
        : t('owner.propertyDetailPage.modal.editPropertyTitle')
    "
    @close="closeEditModal"
  >
    <div class="p-1 space-y-5">
      <!-- Approved-property notice -->
      <div
        v-if="isApproved"
        class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm"
      >
        <ClockIcon class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <p>
          <span class="font-bold"
            >{{ t("owner.propertyDetailPage.modal.approvalRequiredTitle") }}</span
          >
          {{ t("owner.propertyDetailPage.modal.approvalRequiredMessage") }}
        </p>
      </div>

      <!-- Rejected-edit context -->
      <div
        v-if="editRequestStatus === 'rejected' && editRequestReason"
        class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm"
      >
        <XCircleIcon class="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <span class="font-bold"
            >{{
              t("owner.propertyDetailPage.modal.previousRejectionReason")
            }}</span
          >
          {{ editRequestReason }}
        </p>
      </div>

      <!-- Form fields -->
      <div class="space-y-4">
        <div>
          <AppInput
            v-model="editForm.name"
            :label="t('owner.propertyDetailPage.modal.form.nameLabel')"
            :placeholder="t('owner.propertyDetailPage.modal.form.namePlaceholder')"
          />
          <span v-if="editErrors.name" class="text-xs text-rose-500 mt-1 block">
            {{ editErrors.name }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
            {{ t("owner.propertyDetailPage.modal.form.typeLabel") }}
            <select
              v-model="editForm.type"
              class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
            >
              <option
                v-for="opt in propertyTypeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </label>

          <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
            {{ t("owner.propertyDetailPage.modal.form.locationLabel") }}
            <select
              v-model="editForm.location"
              class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
            >
              <template v-if="cities.length">
                <option v-for="c in cities" :key="c.id" :value="c.name">
                  {{ c.name }}
                </option>
              </template>
              <template v-else>
                <option>Phnom Penh</option>
                <option>Siem Reap</option>
                <option>Kampot</option>
                <option>Sihanoukville</option>
                <option>Battambang</option>
                <option>Koh Rong</option>
              </template>
            </select>
          </label>
        </div>

        <div>
          <AppInput
            v-model.number="editForm.number_of_floors"
            type="number"
            min="1"
            :label="t('owner.propertyDetailPage.modal.form.floorsLabel')"
            :placeholder="t('owner.propertyDetailPage.modal.form.floorsPlaceholder')"
          />
        </div>

        <div>
          <AppInput
            v-model="editForm.contact_phone"
            :label="t('owner.propertyDetailPage.modal.form.phoneLabel')"
            :placeholder="t('owner.propertyDetailPage.modal.form.phonePlaceholder')"
          />
          <span
            v-if="editErrors.contact_phone"
            class="text-xs text-rose-500 mt-1 block"
          >
            {{ editErrors.contact_phone }}
          </span>
        </div>

        <div>
          <AppInput
            v-model="editForm.contact_email"
            :label="t('owner.propertyDetailPage.modal.form.emailLabel')"
            type="email"
            :placeholder="t('owner.propertyDetailPage.modal.form.emailPlaceholder')"
          />
          <span
            v-if="editErrors.contact_email"
            class="text-xs text-rose-500 mt-1 block"
          >
            {{ editErrors.contact_email }}
          </span>
        </div>

        <div>
          <AppInput
            v-model="editForm.address"
            :label="t('owner.propertyDetailPage.modal.form.addressLabel')"
            :placeholder="t('owner.propertyDetailPage.modal.form.addressPlaceholder')"
          />
          <span
            v-if="editErrors.address"
            class="text-xs text-rose-500 mt-1 block"
          >
            {{ editErrors.address }}
          </span>
        </div>

        <div>
          <label class="text-sm font-semibold text-(--color-text) block mb-2"
            >{{ t("owner.propertyDetailPage.modal.form.descriptionLabel") }}</label
          >
          <textarea
            v-model="editForm.description"
            rows="3"
            :placeholder="
              t('owner.propertyDetailPage.modal.form.descriptionPlaceholder')
            "
            class="w-full p-3.5 rounded-sm border border-(--color-border) bg-(--color-input) text-(--color-text) text-sm outline-none focus:border-(--color-primary) transition resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-(--color-border)">
        <AppButton variant="secondary" type="button" @click="closeEditModal">
          {{ t("owner.propertyDetailPage.modal.cancel") }}
        </AppButton>
        <AppButton
          type="button"
          :disabled="editSubmitting"
          @click="handleEditSubmit"
        >
          <span class="flex items-center gap-2">
            <CheckCircleIcon v-if="!editSubmitting" class="w-4 h-4" />
            {{
              editSubmitting
                ? t("owner.propertyDetailPage.modal.submitting")
                : isApproved
                  ? t("owner.propertyDetailPage.modal.submitForApproval")
                  : t("owner.propertyDetailPage.modal.saveChanges")
            }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>

  <div
    v-if="previewImageUrl"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    @click="closeImagePreview"
  >
    <button
      @click="closeImagePreview"
      :aria-label="t('owner.propertyDetailPage.closePreview')"
      class="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition cursor-pointer z-50"
    >
      <XMarkIcon class="w-6 h-6" />
    </button>
    <img
      :src="previewImageUrl"
      :alt="t('owner.propertyDetailPage.propertyImageAlt')"
      class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-zoom-out"
      @click.stop
    />
  </div>
</template>
