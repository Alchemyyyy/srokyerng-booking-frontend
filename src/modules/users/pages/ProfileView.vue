<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  BriefcaseIcon,
  UsersIcon,
  UserIcon,
  PencilIcon,
} from "@heroicons/vue/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/vue/24/solid";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, RouterLink, useRouter } from "vue-router";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import AppAlert from "@/shared/components/AppAlert.vue";
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import ProfileSummaryCard from "@/modules/users/components/ProfileSummaryCard.vue";
import ProfileCompletionCard from "@/modules/users/components/ProfileCompletionCard.vue";
import ProfileDetailsForm from "@/modules/users/components/ProfileDetailsForm.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { userService } from "@/modules/users/services/user.service";
import { useProfileImageUpload } from "@/modules/users/composables/useProfileImageUpload";
import { useProfileValidation } from "@/modules/users/composables/useProfileValidation";
import { getDashboardRouteByRole } from "@/shared/utils/roleRoutes";
import { useToastStore } from "@/shared/store/toastStore";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import BookingHistoryView from "@/modules/reservations/pages/BookingHistoryView.vue";

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const { t } = useI18n({ useScope: "global" });

const loading = ref(false);
const savingProfile = ref(false);
const savingPassword = ref(false);
const resendingVerification = ref(false);
const uploadingImage = ref(false);
const error = ref("");
const success = ref("");
const cropModalOpen = ref(false);
const cropperRef = ref(null);
const savedProfileSnapshot = ref(null);
const leaveConfirmationOpen = ref(false);
const pendingLeaveResolver = ref(null);
const allowNextNavigation = ref(false);
const activeAccountTab = ref("personal");

// Social connections state and simulation logic
// Keys are scoped per-user (matching the pattern used by e.g. shared/utils/currency.js)
// so one browser profile can't inherit another logged-in user's connected status.
const connKey = (provider) => `conn_${provider}_${authStore.user?.id ?? "anon"}`;
const googleConnected = ref(localStorage.getItem(connKey("google")) === "true" || !!authStore.user?.google_id);
const facebookConnected = ref(localStorage.getItem(connKey("facebook")) === "true");
const connectingProvider = ref(null);
const disconnectingProvider = ref(null);

const handleConnect = (provider) => {
  connectingProvider.value = provider;
  setTimeout(() => {
    if (provider === "google") {
      googleConnected.value = true;
      localStorage.setItem(connKey("google"), "true");
    } else {
      facebookConnected.value = true;
      localStorage.setItem(connKey("facebook"), "true");
    }
    connectingProvider.value = null;
    toastStore.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account connected successfully!`);
  }, 1200);
};

const triggerDisconnect = (provider) => {
  disconnectingProvider.value = provider;
};

const confirmDisconnect = () => {
  const provider = disconnectingProvider.value;
  if (provider === "google") {
    googleConnected.value = false;
    localStorage.setItem(connKey("google"), "false");
  } else {
    facebookConnected.value = false;
    localStorage.setItem(connKey("facebook"), "false");
  }
  disconnectingProvider.value = null;
  toastStore.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected.`);
};
const isEditing = ref(false);

const {
  selectedImageFile,
  selectedImagePreviewUrl,
  hasSelectedImage,
  selectProfileImage,
  applyProfileImageCrop,
  cancelProfileImageSelection,
} = useProfileImageUpload({
  t,
  onError: (message) => {
    if (message) {
      toastStore.danger(message);
    }
  },
  onSuccess: (message) => {
    success.value = message;
  },
});

const profileForm = reactive({
  full_name: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  address: "",
});

const passwordForm = reactive({
  current_password: "",
  new_password: "",
  confirm_password: "",
});
const {
  profileErrors,
  passwordErrors,
  validateProfileForm,
  validatePasswordForm,
} = useProfileValidation({
  profileForm,
  passwordForm,
  t,
});

const user = ref(null);

const isCustomerAccount = computed(() => (user.value?.role || authStore.user?.role) === "customer");
const userLabel = computed(() => user.value?.full_name || user.value?.email || "Meoun");
const userInitial = computed(() => userLabel.value.charAt(0).toUpperCase());

const roleLabel = computed(() => {
  const role = user.value?.role || "member";
  return t(`profile.roles.${role}`);
});

const reviewsRouteName = computed(() => {
  const role = user.value?.role || authStore.user?.role;
  if (role === "customer") return "customer.reviews";
  if (role === "owner") return "owner.reviews";
  return null;
});

const emailVerificationLabel = computed(() =>
  user.value?.email_verified_at ? t("profile.verified") : t("profile.notVerified"),
);
const emailVerificationToneClass = computed(() =>
  user.value?.email_verified_at
    ? "bg-(--color-success-soft) text-(--color-success)"
    : "bg-(--color-warning-soft) text-(--color-warning)",
);
const isEmailVerified = computed(() => Boolean(user.value?.email_verified_at));
const avatarPreviewUrl = computed(
  () => selectedImagePreviewUrl.value || user.value?.profile_image_url,
);
const profileCompletionItems = computed(() => [
  { label: t("profile.completion.items.name"), complete: Boolean(user.value?.full_name) },
  { label: t("profile.completion.items.phone"), complete: Boolean(user.value?.phone) },
  { label: t("profile.completion.items.email"), complete: Boolean(user.value?.email_verified_at) },
  { label: t("profile.completion.items.photo"), complete: Boolean(user.value?.profile_image_url) },
]);
const profileCompletionPercent = computed(() => {
  const completed = profileCompletionItems.value.filter((item) => item.complete).length;
  return Math.round((completed / profileCompletionItems.value.length) * 100);
});

const currentProfileSnapshot = computed(() => ({
  full_name: profileForm.full_name.trim(),
  phone: profileForm.phone.trim(),
  gender: profileForm.gender,
  date_of_birth: profileForm.date_of_birth,
  address: profileForm.address.trim(),
}));
const hasProfileChanges = computed(() => {
  if (!savedProfileSnapshot.value) {
    return false;
  }

  return JSON.stringify(currentProfileSnapshot.value) !== JSON.stringify(savedProfileSnapshot.value);
});
const hasUnsavedChanges = computed(() => hasProfileChanges.value || hasSelectedImage.value);

const requestLeaveConfirmation = () => {
  if (!hasUnsavedChanges.value) {
    return Promise.resolve(true);
  }

  leaveConfirmationOpen.value = true;

  return new Promise((resolve) => {
    pendingLeaveResolver.value = resolve;
  });
};

const resolveLeaveConfirmation = (confirmed) => {
  leaveConfirmationOpen.value = false;
  pendingLeaveResolver.value?.(confirmed);
  pendingLeaveResolver.value = null;
};

const syncForm = (nextUser) => {
  user.value = nextUser;
  profileForm.full_name = nextUser.full_name || "";
  profileForm.phone = nextUser.phone || "";
  profileForm.gender = nextUser.gender || "";
  profileForm.date_of_birth = nextUser.date_of_birth
    ? String(nextUser.date_of_birth).slice(0, 10)
    : "";
  profileForm.address = nextUser.address || "";
  savedProfileSnapshot.value = { ...currentProfileSnapshot.value };
};

const syncAuthUser = (nextUser) => {
  authStore.user = {
    ...authStore.user,
    ...nextUser,
  };
};

const loadProfile = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await userService.getMe();
    syncForm(response.data);
    syncAuthUser(response.data);
  } catch (requestError) {
    error.value = requestError.message || t("profile.errors.loadProfile");
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  savingProfile.value = true;
  error.value = "";
  success.value = "";

  if (!validateProfileForm()) {
    savingProfile.value = false;
    return;
  }

  try {
    const response = await userService.updateMe({
      full_name: profileForm.full_name,
      phone: profileForm.phone || null,
      gender: profileForm.gender || null,
      date_of_birth: profileForm.date_of_birth || null,
      address: profileForm.address || null,
    });

    syncForm(response.data);
    syncAuthUser(response.data);
    isEditing.value = false;
    toastStore.success(t("profile.toast.profileUpdated"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.errors.updateProfile"));
  } finally {
    savingProfile.value = false;
  }
};


const resendVerificationEmail = async () => {
  resendingVerification.value = true;

  try {
    await authStore.resendVerificationEmail();
    toastStore.success(t("profile.toast.verificationSent"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.errors.resendVerification"));
  } finally {
    resendingVerification.value = false;
  }
};

const uploadProfileImage = async () => {
  if (!selectedImageFile.value) {
    return;
  }

  uploadingImage.value = true;
  error.value = "";
  success.value = "";

  try {
    const response = await userService.updateProfileImage(selectedImageFile.value);
    syncForm(response.data);
    syncAuthUser(response.data);
    cancelProfileImageSelection();
    toastStore.success(t("profile.toast.imageUpdated"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.errors.uploadImage"));
  } finally {
    uploadingImage.value = false;
  }
};

const handleProfileImageSelect = (event) => {
  selectProfileImage(event);
  if (hasSelectedImage.value) {
    cropModalOpen.value = true;
  }
};

const removeProfileImage = async () => {
  uploadingImage.value = true;
  error.value = "";
  success.value = "";

  try {
    const response = await userService.deleteProfileImage();
    syncForm(response.data);
    syncAuthUser(response.data);
    toastStore.success(t("profile.toast.imageRemoved", "Profile image removed successfully"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.errors.removeImage", "Failed to remove profile image"));
  } finally {
    uploadingImage.value = false;
  }
};

const applyCropAndUpload = async () => {
  const result = cropperRef.value?.getResult();
  if (!result?.canvas) {
    return;
  }

  try {
    const blob = await new Promise((resolve) =>
      result.canvas.toBlob(resolve, selectedImageFile.value?.type || "image/jpeg", 0.92)
    );

    if (blob) {
      const croppedFile = new File([blob], selectedImageFile.value?.name || "avatar.jpg", {
        type: blob.type || selectedImageFile.value?.type,
      });

      selectedImageFile.value = croppedFile;
      cropModalOpen.value = false;
      await uploadProfileImage();
    }
  } catch (err) {
    toastStore.danger(t("profile.errors.uploadImage"));
  }
};

const closeCropModal = () => {
  cropModalOpen.value = false;
  cancelProfileImageSelection();
};

const goBack = async () => {
  const canLeave = await requestLeaveConfirmation();

  if (!canLeave) {
    return;
  }

  allowNextNavigation.value = true;

  if (window.history.length > 1) {
    router.back();
    return;
  }

  await router.push(getDashboardRouteByRole(authStore.user?.role) || { name: "public.home" });
};

const handleBeforeUnload = (event) => {
  if (!hasUnsavedChanges.value) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
};

onBeforeRouteLeave(async () => {
  if (allowNextNavigation.value) {
    allowNextNavigation.value = false;
    return true;
  }

  return requestLeaveConfirmation();
});

onMounted(() => {
  loadProfile();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <div class="min-h-screen bg-(--color-page) flex flex-col">
    <PublicNavbar v-if="authStore.user?.role !== 'owner' && authStore.user?.role !== 'admin'" />
    <main 
      class="flex-1 min-h-screen pb-16 px-4 text-(--color-text) sm:px-6 lg:px-8 font-sans transition-colors duration-300"
      :class="[authStore.user?.role !== 'owner' && authStore.user?.role !== 'admin' ? 'pt-32' : 'pt-8']"
    >
    <section class="mx-auto max-w-6xl">
      <AppAlert
        v-if="error"
        variant="danger"
        class="mb-6 rounded-2xl"
        dismissible
        @close="error = ''"
      >
        {{ error }}
      </AppAlert>

      <AppAlert
        v-if="success"
        variant="success"
        class="mb-6 rounded-2xl"
        dismissible
        @close="success = ''"
      >
        {{ success }}
      </AppAlert>

      <div
        v-if="loading"
        class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-12 text-center shadow-xl"
      >
        <LoadingSpinner :label="t('profile.loading')" />
      </div>

      <!-- Main Airbnb Split Layout -->
      <div v-else class="grid gap-12 lg:grid-cols-[280px_1fr] items-start">
        <!-- Left Navigation Sidebar -->
        <aside class="lg:sticky lg:top-28 lg:self-start space-y-6 pr-4 lg:border-r border-(--color-border) lg:min-h-[60vh]">
          <h1 class="text-3xl font-bold tracking-tight text-(--color-text) mb-8">
            Profile
          </h1>

          <nav class="space-y-2" aria-label="Profile navigation">
            <!-- About me -->
            <button
              type="button"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 cursor-pointer"
              :class="[activeAccountTab === 'personal' ? 'bg-(--color-surface-soft) font-bold text-(--color-text)' : 'hover:bg-(--color-surface-soft)/60 font-semibold text-(--color-muted)']"
              @click="activeAccountTab = 'personal'"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-rose-600 font-bold text-sm shadow-xs">
                {{ userInitial }}
              </span>
              <span>About me</span>
            </button>

            <!-- Past trips -->
            <button
              v-if="isCustomerAccount"
              type="button"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 cursor-pointer group"
              :class="[activeAccountTab === 'trips' ? 'bg-(--color-surface-soft) font-bold text-(--color-text)' : 'hover:bg-(--color-surface-soft)/60 font-semibold text-(--color-muted)']"
              @click="activeAccountTab = 'trips'"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-warning-soft) text-(--color-warning) shadow-xs group-hover:scale-105 transition-transform">
                <BriefcaseIcon class="h-4 w-4" />
              </span>
              <span>Past trips</span>
            </button>

            <!-- Connections -->
            <button
              type="button"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 cursor-pointer group"
              :class="[activeAccountTab === 'connections' ? 'bg-(--color-surface-soft) font-bold text-(--color-text)' : 'hover:bg-(--color-surface-soft)/60 font-semibold text-(--color-muted)']"
              @click="activeAccountTab = 'connections'"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary) shadow-xs group-hover:scale-105 transition-transform">
                <UsersIcon class="h-4 w-4" />
              </span>
              <span>Connections</span>
            </button>

          </nav>
        </aside>

        <!-- Right Main Content Area -->
        <div class="lg:pl-6 space-y-8">
          <section
            v-if="!isEmailVerified"
            class="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-700 dark:text-amber-400 shadow-sm"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-4">
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--color-surface) text-amber-500 border border-amber-500/30 shadow-xs">
                  <ShieldCheckIcon class="h-6 w-6" />
                </span>
                <div>
                  <h2 class="text-lg font-bold text-(--color-text)">
                    {{ t("profile.emailVerification.title") }}
                  </h2>
                  <p class="mt-1 text-xs leading-relaxed text-(--color-muted) font-medium">
                    {{ t("profile.emailVerification.description") }}
                  </p>
                </div>
              </div>

              <AppButton
                type="button"
                variant="secondary"
                size="md"
                class="shrink-0 !rounded-2xl shadow-sm whitespace-nowrap font-bold px-6 py-3 hover:scale-105 active:scale-95 transition-all duration-200"
                :loading="resendingVerification"
                :disabled="resendingVerification"
                @click="resendVerificationEmail"
              >
                {{ t("profile.emailVerification.resend") }}
              </AppButton>
            </div>
          </section>

          <!-- Personal / About me view -->
          <section v-if="activeAccountTab === 'personal'" id="personal-details">
            <div class="flex items-center gap-4 mb-10">
              <h1 class="text-3xl font-bold text-(--color-text)">About me</h1>
              <button
                type="button"
                class="bg-(--color-surface-soft) hover:opacity-90 text-(--color-text) text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
                @click="isEditing = !isEditing"
              >
                {{ isEditing ? 'Cancel' : 'Edit' }}
              </button>
            </div>

            <div v-if="!isEditing">
              <!-- Airbnb Card & Callout Section -->
              <div class="flex flex-col lg:flex-row gap-12 items-start mb-12">
                <!-- Profile Identity Card -->
                <div class="bg-(--color-surface) rounded-[32px] p-8 shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-(--color-border) flex flex-col items-center justify-center text-center w-full max-w-[320px] min-h-[240px] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] group">
                  <div class="relative mb-5">
                    <button
                      type="button"
                      class="relative block rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-(--color-wishlist) group-hover:scale-105 transition-all duration-300 shadow-md"
                      @click="cropModalOpen = true"
                      title="Update photo"
                    >
                      <UserAvatar
                        :name="userLabel"
                        :src="avatarPreviewUrl"
                        size-class="h-28 w-28 text-5xl font-semibold"
                      />
                    </button>
                  </div>
                  <h2 class="text-2xl font-bold text-(--color-text) mb-1">{{ userLabel }}</h2>
                  <p class="text-xs text-(--color-muted) font-normal">{{ roleLabel }}</p>
                </div>

                <!-- Complete your profile callout -->
                <div class="flex-1 max-w-md py-4">
                  <h3 class="text-2xl font-bold text-(--color-text) mb-3">Complete your profile</h3>
                  <p class="text-sm text-(--color-muted) leading-relaxed mb-6 font-normal">
                    Your Airbnb profile is an important part of every reservation. Complete yours to help other hosts and guests get to know you.
                  </p>
                  <button
                    type="button"
                    class="bg-(--color-primary) hover:opacity-90 text-white font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 text-sm cursor-pointer"
                    @click="isEditing = true"
                  >
                    Get started
                  </button>
                </div>
              </div>

              <!-- Divider Line -->
              <div class="border-b border-(--color-border) my-10 w-full"></div>

              <!-- Reviews Row -->
              <RouterLink
                v-if="reviewsRouteName"
                :to="{ name: reviewsRouteName }"
                class="flex items-center gap-4 text-base font-semibold text-(--color-text) hover:underline cursor-pointer py-2 group"
              >
                <ChatBubbleLeftEllipsisIcon class="h-6 w-6 text-(--color-muted) group-hover:text-(--color-wishlist) transition-colors" />
                <span>{{ isCustomerAccount ? "Show reviews I've written" : "Show reviews about my properties" }}</span>
              </RouterLink>
            </div>

            <!-- Expandable Edit Form -->
            <div v-else class="space-y-8 animate-fadeIn">
              <ProfileDetailsForm
                :form="profileForm"
                :errors="profileErrors"
                :saving="savingProfile"
                :has-changes="hasProfileChanges"
                :user-name="userLabel"
                :avatar-src="avatarPreviewUrl"
                :has-custom-avatar="!!(user?.profile_image_url)"
                :uploading-image="uploadingImage"
                @submit="saveProfile"
                @file-select="handleProfileImageSelect"
                @delete-click="removeProfileImage"
              />
            </div>
          </section>


          <!-- Trips view -->
          <section v-else-if="activeAccountTab === 'trips'" id="trips" class="space-y-8 animate-fadeIn">
            <BookingHistoryView :hideNavbarAndFooter="true" />
          </section>

          <!-- Connections view -->
          <section v-else-if="activeAccountTab === 'connections'" id="connections" class="space-y-8 animate-fadeIn max-w-2xl">
            <div>
              <h2 class="text-3xl font-black tracking-tight text-(--color-text)">Social Connections</h2>
              <p class="mt-2 text-sm leading-relaxed text-(--color-muted) font-semibold">
                Manage your connected accounts. Log in instantly and secure your Srok-Yerng Booking account.
              </p>
            </div>

            <div class="border border-(--color-border) bg-(--color-surface) rounded-[28px] overflow-hidden divide-y divide-(--color-border)">
              <!-- Google Account Card -->
              <div class="p-6 flex items-start justify-between gap-6">
                <div class="flex items-start gap-4">
                  <div class="h-10 w-10 shrink-0 bg-red-500/5 dark:bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/10">
                    <svg class="h-5 w-5 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.111 4.113-3.418 0-6.19-2.772-6.19-6.19 0-3.418 2.772-6.19 6.19-6.19 1.483 0 2.844.522 3.917 1.39l3.138-3.138C19.043 2.122 15.844 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 11.24-4.553 11.24-11.24 0-.79-.086-1.541-.24-2.24H12.24z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-(--color-text)">Google Account</h3>
                    <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                      Allows one-tap login and registration. Safe and secure.
                    </p>
                    <div v-if="googleConnected" class="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Connected
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    v-if="googleConnected"
                    type="button"
                    @click="triggerDisconnect('google')"
                    class="px-4 py-2 border border-(--color-border) hover:bg-(--color-surface-soft) text-(--color-text) text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                  <button
                    v-else
                    type="button"
                    :disabled="connectingProvider === 'google'"
                    @click="handleConnect('google')"
                    class="px-5 py-2.5 bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span v-if="connectingProvider === 'google'" class="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{{ connectingProvider === 'google' ? 'Connecting...' : 'Connect' }}</span>
                  </button>
                </div>
              </div>

              <!-- Facebook Account Card -->
              <div class="p-6 flex items-start justify-between gap-6">
                <div class="flex items-start gap-4">
                  <div class="h-10 w-10 shrink-0 bg-blue-600/5 dark:bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/10">
                    <svg class="h-5 w-5 text-blue-600 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-(--color-text)">Facebook Account</h3>
                    <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                      Link your Facebook profile to instantly log into your bookings.
                    </p>
                    <div v-if="facebookConnected" class="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Connected
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    v-if="facebookConnected"
                    type="button"
                    @click="triggerDisconnect('facebook')"
                    class="px-4 py-2 border border-(--color-border) hover:bg-(--color-surface-soft) text-(--color-text) text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                  <button
                    v-else
                    type="button"
                    :disabled="connectingProvider === 'facebook'"
                    @click="handleConnect('facebook')"
                    class="px-5 py-2.5 bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span v-if="connectingProvider === 'facebook'" class="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{{ connectingProvider === 'facebook' ? 'Connecting...' : 'Connect' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>

    <AppModal
      :open="leaveConfirmationOpen"
      :title="t('profile.leave.title')"
      panel-class="!rounded-3xl border border-(--color-border) shadow-2xl backdrop-blur-2xl bg-(--color-surface)"
      @close="resolveLeaveConfirmation(false)"
    >
      <p class="text-base leading-relaxed text-(--color-muted) font-medium py-2">
        {{ t("profile.leave.message") }}
      </p>

      <template #footer>
        <AppButton
          type="button"
          variant="secondary"
          class="!rounded-2xl font-bold px-6 py-3 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          @click="resolveLeaveConfirmation(false)"
        >
          {{ t("profile.leave.stay") }}
        </AppButton>
        <AppButton
          type="button"
          variant="danger"
          class="!rounded-2xl font-bold px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 bg-(--color-wishlist) hover:bg-(--color-wishlist-strong)"
          @click="resolveLeaveConfirmation(true)"
        >
          {{ t("profile.leave.confirm") }}
        </AppButton>
      </template>
    </AppModal>

    <AppModal
      :open="cropModalOpen"
      :title="t('profile.summary.cropImage')"
      panel-class="max-w-xl !rounded-3xl border border-(--color-border) shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl bg-(--color-surface) transition-all duration-300"
      @close="closeCropModal"
    >
      <div class="space-y-6 py-2">
        <p class="text-base leading-relaxed text-(--color-muted) font-medium">
          {{ t("profile.summary.cropDescription") }}
        </p>

        <Cropper
          ref="cropperRef"
          class="h-[360px] rounded-2xl bg-black overflow-hidden shadow-inner ring-1 ring-white/10"
          :src="selectedImagePreviewUrl"
          :stencil-props="{ aspectRatio: 1 }"
          image-restriction="stencil"
          :auto-zoom="true"
        />
      </div>

      <template #footer>
        <AppButton
          type="button"
          variant="secondary"
          class="!rounded-2xl font-bold px-6 py-3.5 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          :disabled="uploadingImage"
          @click="closeCropModal"
        >
          {{ t("common.cancel") }}
        </AppButton>
        <AppButton
          type="button"
          class="!rounded-2xl font-bold px-8 py-3.5 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-(--color-wishlist) hover:bg-(--color-wishlist-strong) text-white"
          :loading="uploadingImage"
          :disabled="uploadingImage"
          @click="applyCropAndUpload"
        >
          {{ t("profile.summary.saveImage") }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Disconnect Social Confirmation Modal -->
    <AppModal
      :open="!!disconnectingProvider"
      title="Disconnect account?"
      panel-class="!rounded-3xl border border-(--color-border) shadow-2xl backdrop-blur-2xl bg-(--color-surface) max-w-sm"
      @close="disconnectingProvider = null"
    >
      <p class="text-base leading-relaxed text-(--color-muted) font-medium py-2">
        Are you sure you want to disconnect your Srok-Yerng Booking account from this {{ disconnectingProvider }} account? You will no longer be able to log in using it.
      </p>

      <template #footer>
        <AppButton
          type="button"
          variant="secondary"
          class="!rounded-2xl font-bold px-6 py-3.5 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          @click="disconnectingProvider = null"
        >
          Cancel
        </AppButton>
        <AppButton
          type="button"
          variant="danger"
          class="!rounded-2xl font-bold px-6 py-3.5 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 bg-(--color-wishlist) hover:bg-(--color-wishlist-strong) text-white"
          @click="confirmDisconnect"
        >
          Disconnect
        </AppButton>
      </template>
    </AppModal>
  </main>
    <PublicFooter v-if="authStore.user?.role !== 'owner' && authStore.user?.role !== 'admin'" />
  </div>
</template>
