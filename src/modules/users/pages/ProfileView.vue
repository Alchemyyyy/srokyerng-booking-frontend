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
import PasswordChangeForm from "@/modules/users/components/PasswordChangeForm.vue";
import SessionManagementCard from "@/modules/users/components/SessionManagementCard.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { userService } from "@/modules/users/services/user.service";
import { useProfileImageUpload } from "@/modules/users/composables/useProfileImageUpload";
import { useProfileValidation } from "@/modules/users/composables/useProfileValidation";
import { getDashboardRouteByRole } from "@/shared/utils/roleRoutes";
import { useToastStore } from "@/shared/store/toastStore";

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

const changePassword = async () => {
  savingPassword.value = true;
  error.value = "";
  success.value = "";

  if (!validatePasswordForm()) {
    savingPassword.value = false;
    return;
  }

  try {
    await userService.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });

    passwordForm.current_password = "";
    passwordForm.new_password = "";
    passwordForm.confirm_password = "";
    toastStore.success(t("profile.toast.passwordChanged"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.errors.changePassword"));
  } finally {
    savingPassword.value = false;
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
  <main class="min-h-screen bg-white dark:bg-neutral-950 px-4 py-16 text-gray-900 dark:text-white sm:px-6 lg:px-8 font-sans transition-colors duration-300">
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
        class="rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center shadow-xl"
      >
        <LoadingSpinner :label="t('profile.loading')" />
      </div>

      <!-- Main Airbnb Split Layout -->
      <div v-else class="grid gap-12 lg:grid-cols-[280px_1fr] items-start">
        <!-- Left Navigation Sidebar -->
        <aside class="lg:sticky lg:top-28 lg:self-start space-y-6 pr-4 lg:border-r border-gray-200 dark:border-neutral-800/80 lg:min-h-[60vh]">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            Profile
          </h1>

          <nav class="space-y-2" aria-label="Profile navigation">
            <!-- About me -->
            <button
              type="button"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 cursor-pointer"
              :class="[activeAccountTab === 'personal' ? 'bg-gray-100 dark:bg-neutral-800 font-bold text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50 font-semibold text-gray-700 dark:text-gray-200']"
              @click="activeAccountTab = 'personal'"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-rose-600 font-bold text-sm shadow-xs">
                {{ userInitial }}
              </span>
              <span>About me</span>
            </button>

            <!-- Past trips -->
            <RouterLink
              :to="{ name: 'customer.reservations' }"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50 font-semibold text-gray-700 dark:text-gray-200 group"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-neutral-800 text-amber-600 font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                💼
              </span>
              <span>Past trips</span>
            </RouterLink>

            <!-- Connections -->
            <RouterLink
              :to="{ name: 'customer.wishlist' }"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50 font-semibold text-gray-700 dark:text-gray-200 group"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-neutral-800 text-blue-600 font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                👥
              </span>
              <span>Connections</span>
            </RouterLink>

            <!-- Security & Preferences -->
            <button
              type="button"
              class="w-full flex items-center gap-4 rounded-2xl py-3 px-4 text-left transition-all duration-200 cursor-pointer"
              :class="[activeAccountTab === 'security' ? 'bg-gray-100 dark:bg-neutral-800 font-bold text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50 font-semibold text-gray-700 dark:text-gray-200']"
              @click="activeAccountTab = 'security'"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-neutral-800 text-emerald-600 font-bold text-lg shadow-xs">
                🔒
              </span>
              <span>Login & security</span>
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
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-neutral-900 text-amber-500 border border-amber-500/30 shadow-xs">
                  <ShieldCheckIcon class="h-6 w-6" />
                </span>
                <div>
                  <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ t("profile.emailVerification.title") }}
                  </h2>
                  <p class="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
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
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">About me</h1>
              <button
                type="button"
                class="bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
                @click="isEditing = !isEditing"
              >
                {{ isEditing ? 'Cancel' : 'Edit' }}
              </button>
            </div>

            <div v-if="!isEditing">
              <!-- Airbnb Card & Callout Section -->
              <div class="flex flex-col lg:flex-row gap-12 items-start mb-12">
                <!-- Profile Identity Card -->
                <div class="bg-white dark:bg-neutral-900 rounded-[32px] p-8 shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center w-full max-w-[320px] min-h-[240px] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] group">
                  <div class="relative mb-5">
                    <button
                      type="button"
                      class="relative block rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#FF385C] group-hover:scale-105 transition-all duration-300 shadow-md"
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
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ userLabel }}</h2>
                  <p class="text-xs text-gray-500 font-normal">Guest</p>
                </div>

                <!-- Complete your profile callout -->
                <div class="flex-1 max-w-md py-4">
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Complete your profile</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-normal">
                    Your Airbnb profile is an important part of every reservation. Complete yours to help other hosts and guests get to know you.
                  </p>
                  <button
                    type="button"
                    class="bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 text-sm cursor-pointer"
                    @click="isEditing = true"
                  >
                    Get started
                  </button>
                </div>
              </div>

              <!-- Divider Line -->
              <div class="border-b border-gray-200 dark:border-neutral-800 my-10 w-full"></div>

              <!-- Reviews Row -->
              <div class="flex items-center gap-4 text-base font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer py-2 group">
                <ChatBubbleLeftEllipsisIcon class="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-[#FF385C] transition-colors" />
                <span>Show reviews I've written</span>
              </div>
            </div>

            <!-- Expandable Edit Form -->
            <div v-else class="space-y-8 animate-fadeIn">
              <ProfileDetailsForm
                :form="profileForm"
                :errors="profileErrors"
                :saving="savingProfile"
                :has-changes="hasProfileChanges"
                @submit="saveProfile"
              />
            </div>
          </section>

          <!-- Security view -->
          <section v-else-if="activeAccountTab === 'security'" id="security" class="space-y-8">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{{ t("profile.securityTitle") }}</h2>
              <p class="mt-2 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                {{ t("profile.securityDesc") }}
              </p>
            </div>

            <PasswordChangeForm
              :form="passwordForm"
              :errors="passwordErrors"
              :saving="savingPassword"
              @submit="changePassword"
            />

            <SessionManagementCard />
          </section>
        </div>
      </div>
    </section>

    <AppModal
      :open="leaveConfirmationOpen"
      :title="t('profile.leave.title')"
      panel-class="!rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-2xl backdrop-blur-2xl bg-white dark:bg-neutral-900"
      @close="resolveLeaveConfirmation(false)"
    >
      <p class="text-base leading-relaxed text-gray-600 dark:text-gray-400 font-medium py-2">
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
          class="!rounded-2xl font-bold px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 bg-[#FF385C] hover:bg-[#E31C5F]"
          @click="resolveLeaveConfirmation(true)"
        >
          {{ t("profile.leave.confirm") }}
        </AppButton>
      </template>
    </AppModal>

    <AppModal
      :open="cropModalOpen"
      :title="t('profile.summary.cropImage')"
      panel-class="max-w-xl !rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl bg-white dark:bg-neutral-900 transition-all duration-300"
      @close="closeCropModal"
    >
      <div class="space-y-6 py-2">
        <p class="text-base leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
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
          class="!rounded-2xl font-bold px-8 py-3.5 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-[#FF385C] hover:bg-[#E31C5F] text-white"
          :loading="uploadingImage"
          :disabled="uploadingImage"
          @click="applyCropAndUpload"
        >
          {{ t("profile.summary.saveImage") }}
        </AppButton>
      </template>
    </AppModal>
  </main>
</template>
