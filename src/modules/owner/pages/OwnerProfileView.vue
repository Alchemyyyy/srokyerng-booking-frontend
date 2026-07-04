<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import {
  ShieldCheckIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, RouterLink } from "vue-router";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import AppAlert from "@/shared/components/AppAlert.vue";
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import ProfileCompletionCard from "@/modules/users/components/ProfileCompletionCard.vue";
import ProfileDetailsForm from "@/modules/users/components/ProfileDetailsForm.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { userService } from "@/modules/users/services/user.service";
import { useProfileImageUpload } from "@/modules/users/composables/useProfileImageUpload";
import { useProfileValidation } from "@/modules/users/composables/useProfileValidation";
import { useToastStore } from "@/shared/store/toastStore";
import { useSidebar } from "@/shared/composables/useSidebar";

const authStore = useAuthStore();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();
const { t } = useI18n({ useScope: "global" });

const loading = ref(false);
const savingProfile = ref(false);
const resendingVerification = ref(false);
const uploadingImage = ref(false);
const error = ref("");
const cropModalOpen = ref(false);
const cropperRef = ref(null);
const savedProfileSnapshot = ref(null);
const leaveConfirmationOpen = ref(false);
const pendingLeaveResolver = ref(null);
const allowNextNavigation = ref(false);
const activeTab = ref("about");
const isEditing = ref(false);

// Keys are scoped per-user (matching the pattern used by e.g. shared/utils/currency.js)
// so one browser profile can't inherit another logged-in user's connected status.
const connKey = (provider) => `conn_${provider}_${authStore.user?.id ?? "anon"}`;
const googleConnected = ref(
  localStorage.getItem(connKey("google")) === "true" || !!authStore.user?.google_id,
);
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

const {
  selectedImageFile,
  selectedImagePreviewUrl,
  hasSelectedImage,
  selectProfileImage,
  cancelProfileImageSelection,
} = useProfileImageUpload({
  t,
  onError: (message) => {
    if (message) toastStore.danger(message);
  },
});

const profileForm = reactive({
  full_name: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  address: "",
});

const {
  profileErrors,
  validateProfileForm,
} = useProfileValidation({ profileForm, passwordForm: reactive({}), t });

const user = ref(null);

const userLabel = computed(() => user.value?.full_name || user.value?.email || "Host");
const roleLabel = computed(() => t("profile.roles.owner"));
const emailVerificationLabel = computed(() =>
  user.value?.email_verified_at ? t("profile.verified") : t("profile.notVerified"),
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
  if (!savedProfileSnapshot.value) return false;
  return JSON.stringify(currentProfileSnapshot.value) !== JSON.stringify(savedProfileSnapshot.value);
});
const hasUnsavedChanges = computed(() => hasProfileChanges.value || hasSelectedImage.value);

const requestLeaveConfirmation = () => {
  if (!hasUnsavedChanges.value) return Promise.resolve(true);

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
  authStore.user = { ...authStore.user, ...nextUser };
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
  if (!selectedImageFile.value) return;

  uploadingImage.value = true;
  error.value = "";

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
  if (!result?.canvas) return;

  try {
    const blob = await new Promise((resolve) =>
      result.canvas.toBlob(resolve, selectedImageFile.value?.type || "image/jpeg", 0.92),
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

const handleBeforeUnload = (event) => {
  if (!hasUnsavedChanges.value) return;
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
  <main
    class="owner-profile transition-all duration-300 my-25 space-y-6"
    :class="isSidebarOpen ? 'ml-64' : 'ml-20'"
  >
    <!-- Header -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-(--color-text)">Profile</h1>
        <p class="mt-1 text-sm text-(--color-muted)">
          Manage your host profile, photo, and account security.
        </p>
      </div>
    </header>

    <AppAlert v-if="error" variant="danger" class="rounded-xl" dismissible @close="error = ''">
      {{ error }}
    </AppAlert>

    <OwnerLoadingState v-if="loading" :label="t('profile.loading')" />

    <template v-else>
      <!-- Email verification banner -->
      <section
        v-if="!isEmailVerified"
        class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-700 dark:text-amber-400 shadow-sm"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-4">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-surface) text-amber-500 border border-amber-500/30">
              <ShieldCheckIcon class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-base font-bold text-(--color-text)">{{ t("profile.emailVerification.title") }}</h2>
              <p class="mt-1 text-xs leading-relaxed text-(--color-muted)">
                {{ t("profile.emailVerification.description") }}
              </p>
            </div>
          </div>
          <AppButton
            type="button"
            variant="secondary"
            size="md"
            class="shrink-0 rounded-xl whitespace-nowrap"
            :loading="resendingVerification"
            :disabled="resendingVerification"
            @click="resendVerificationEmail"
          >
            {{ t("profile.emailVerification.resend") }}
          </AppButton>
        </div>
      </section>

      <!-- Tabs -->
      <section class="owner-toolbar">
        <div class="owner-filter-tabs">
          <button
            v-for="tab in [
              { key: 'about', label: 'About me' },
              { key: 'connections', label: 'Connections' },
            ]"
            :key="tab.key"
            class="owner-filter-btn"
            :class="activeTab === tab.key ? 'owner-filter-btn--active' : ''"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </section>

      <!-- About me -->
      <div v-if="activeTab === 'about'" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <section class="rounded-xl border border-(--color-border) bg-(--color-surface) shadow-sm p-6 lg:order-1">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-(--color-text)">Personal details</h2>
            <button
              type="button"
              class="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-text) hover:bg-(--color-surface-soft) transition cursor-pointer"
              @click="isEditing = !isEditing"
            >
              {{ isEditing ? 'Cancel' : 'Edit' }}
            </button>
          </div>

          <div v-if="!isEditing" class="flex flex-col sm:flex-row sm:items-center gap-6">
            <button
              type="button"
              class="relative block rounded-full overflow-hidden shrink-0 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              title="Update photo"
              @click="cropModalOpen = true"
            >
              <UserAvatar :name="userLabel" :src="avatarPreviewUrl" size-class="h-20 w-20 text-3xl font-semibold" />
            </button>
            <div>
              <h3 class="text-lg font-bold text-(--color-text)">{{ userLabel }}</h3>
              <span class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-(--color-primary)/10 px-2.5 py-1 text-xs font-bold text-(--color-primary)">
                <UserCircleIcon class="h-3.5 w-3.5" />
                {{ roleLabel }}
              </span>
              <p class="mt-2 text-xs font-semibold" :class="isEmailVerified ? 'text-(--color-success)' : 'text-amber-500'">
                {{ emailVerificationLabel }}
              </p>
            </div>
          </div>

          <ProfileDetailsForm
            v-else
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

          <div class="mt-6 border-t border-(--color-border) pt-5">
            <RouterLink
              :to="{ name: 'owner.reviews' }"
              class="flex items-center gap-3 text-sm font-semibold text-(--color-text) hover:text-(--color-primary) transition-colors"
            >
              <ChatBubbleLeftEllipsisIcon class="h-5 w-5 text-(--color-muted)" />
              <span>See reviews about my properties</span>
            </RouterLink>
          </div>
        </section>

        <ProfileCompletionCard
          class="lg:order-2"
          :completion-percent="profileCompletionPercent"
          :completion-items="profileCompletionItems"
        />
      </div>

      <!-- Connections -->
      <section v-else-if="activeTab === 'connections'" class="rounded-xl border border-(--color-border) bg-(--color-surface) shadow-sm overflow-hidden divide-y divide-(--color-border) max-w-2xl">
        <div class="p-6 flex items-start justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="h-10 w-10 shrink-0 bg-red-500/5 dark:bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/10">
              <svg class="h-5 w-5 text-red-500 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.111 4.113-3.418 0-6.19-2.772-6.19-6.19 0-3.418 2.772-6.19 6.19-6.19 1.483 0 2.844.522 3.917 1.39l3.138-3.138C19.043 2.122 15.844 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 11.24-4.553 11.24-11.24 0-.79-.086-1.541-.24-2.24H12.24z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-(--color-text)">Google Account</h3>
              <p class="text-xs text-(--color-muted) mt-1">Allows one-tap login and registration.</p>
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
              class="px-4 py-2 border border-(--color-border) hover:bg-(--color-surface-soft) text-(--color-text) text-xs font-bold rounded-lg transition cursor-pointer"
              @click="triggerDisconnect('google')"
            >
              Disconnect
            </button>
            <button
              v-else
              type="button"
              :disabled="connectingProvider === 'google'"
              class="px-4 py-2 bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              @click="handleConnect('google')"
            >
              <span v-if="connectingProvider === 'google'" class="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ connectingProvider === 'google' ? 'Connecting...' : 'Connect' }}</span>
            </button>
          </div>
        </div>

        <div class="p-6 flex items-start justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="h-10 w-10 shrink-0 bg-blue-600/5 dark:bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/10">
              <svg class="h-5 w-5 text-blue-600 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-(--color-text)">Facebook Account</h3>
              <p class="text-xs text-(--color-muted) mt-1">Link your Facebook profile to instantly log in.</p>
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
              class="px-4 py-2 border border-(--color-border) hover:bg-(--color-surface-soft) text-(--color-text) text-xs font-bold rounded-lg transition cursor-pointer"
              @click="triggerDisconnect('facebook')"
            >
              Disconnect
            </button>
            <button
              v-else
              type="button"
              :disabled="connectingProvider === 'facebook'"
              class="px-4 py-2 bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              @click="handleConnect('facebook')"
            >
              <span v-if="connectingProvider === 'facebook'" class="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ connectingProvider === 'facebook' ? 'Connecting...' : 'Connect' }}</span>
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- Leave confirmation -->
    <AppModal
      :open="leaveConfirmationOpen"
      :title="t('profile.leave.title')"
      panel-class="rounded-2xl border border-(--color-border) shadow-2xl bg-(--color-surface)"
      @close="resolveLeaveConfirmation(false)"
    >
      <p class="text-sm leading-relaxed text-(--color-muted) py-2">
        {{ t("profile.leave.message") }}
      </p>
      <template #footer>
        <AppButton type="button" variant="secondary" class="rounded-xl" @click="resolveLeaveConfirmation(false)">
          {{ t("profile.leave.stay") }}
        </AppButton>
        <AppButton type="button" variant="danger" class="rounded-xl" @click="resolveLeaveConfirmation(true)">
          {{ t("profile.leave.confirm") }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Crop modal -->
    <AppModal
      :open="cropModalOpen"
      :title="t('profile.summary.cropImage')"
      panel-class="max-w-xl rounded-2xl border border-(--color-border) shadow-2xl bg-(--color-surface)"
      @close="closeCropModal"
    >
      <div class="space-y-6 py-2">
        <p class="text-sm leading-relaxed text-(--color-muted)">
          {{ t("profile.summary.cropDescription") }}
        </p>
        <Cropper
          ref="cropperRef"
          class="h-90 rounded-xl bg-black overflow-hidden"
          :src="selectedImagePreviewUrl"
          :stencil-props="{ aspectRatio: 1 }"
          image-restriction="stencil"
          :auto-zoom="true"
        />
      </div>
      <template #footer>
        <AppButton type="button" variant="secondary" class="rounded-xl" :disabled="uploadingImage" @click="closeCropModal">
          {{ t("common.cancel") }}
        </AppButton>
        <AppButton type="button" class="rounded-xl" :loading="uploadingImage" :disabled="uploadingImage" @click="applyCropAndUpload">
          {{ t("profile.summary.saveImage") }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Disconnect confirmation -->
    <AppModal
      :open="!!disconnectingProvider"
      title="Disconnect account?"
      panel-class="rounded-2xl border border-(--color-border) shadow-2xl bg-(--color-surface) max-w-sm"
      @close="disconnectingProvider = null"
    >
      <p class="text-sm leading-relaxed text-(--color-muted) py-2">
        Are you sure you want to disconnect your Srok-Yerng Booking account from this {{ disconnectingProvider }} account?
      </p>
      <template #footer>
        <AppButton type="button" variant="secondary" class="rounded-xl" @click="disconnectingProvider = null">
          Cancel
        </AppButton>
        <AppButton type="button" variant="danger" class="rounded-xl" @click="confirmDisconnect">
          Disconnect
        </AppButton>
      </template>
    </AppModal>
  </main>
</template>

<style scoped>
.owner-profile {
  padding: 0 24px 80px;
  background: var(--color-page);
}
.owner-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.owner-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.owner-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.owner-filter-btn:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
}
.owner-filter-btn--active {
  background: var(--color-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}
</style>
