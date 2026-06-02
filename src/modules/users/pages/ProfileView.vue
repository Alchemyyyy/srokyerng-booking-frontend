<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, useRouter } from "vue-router";
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
const uploadingImage = ref(false);
const error = ref("");
const success = ref("");
const cropModalOpen = ref(false);
const cropperRef = ref(null);
const savedProfileSnapshot = ref(null);
const leaveConfirmationOpen = ref(false);
const pendingLeaveResolver = ref(null);
const allowNextNavigation = ref(false);

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

const userLabel = computed(() => user.value?.full_name || user.value?.email || "User");

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

const openCropModal = () => {
  cropModalOpen.value = true;
};

const applyCrop = async () => {
  const result = cropperRef.value?.getResult();
  await applyProfileImageCrop(result?.canvas);
  cropModalOpen.value = false;
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
  <main class="min-h-screen bg-(--color-page) px-4 py-10 text-(--color-text) sm:px-6 lg:px-8">
    <section class="mx-auto max-w-6xl">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <AppButton
            type="button"
            variant="primary"
            size="sm"
            class="mb-4 !rounded-lg"
            @click="goBack"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            {{ t("common.back") }}
          </AppButton>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
            {{ t("profile.account") }}
          </p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {{ t("profile.title") }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-(--color-muted)">
            {{ t("profile.subtitle") }}
          </p>
        </div>
      </header>

      <AppAlert
        v-if="error"
        variant="danger"
        class="mb-5"
        dismissible
        @close="error = ''"
      >
        {{ error }}
      </AppAlert>

      <AppAlert
        v-if="success"
        variant="success"
        class="mb-5"
        dismissible
        @close="success = ''"
      >
        {{ success }}
      </AppAlert>

      <div
        v-if="loading"
        class="rounded-lg border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-card)"
      >
        <LoadingSpinner :label="t('profile.loading')" />
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <ProfileSummaryCard
            :user-label="userLabel"
            :email="user?.email"
            :role-label="roleLabel"
            :avatar-src="avatarPreviewUrl"
            :email-verified="Boolean(user?.email_verified_at)"
            :email-verification-label="emailVerificationLabel"
            :email-verification-tone-class="emailVerificationToneClass"
            :uploading-image="uploadingImage"
            :has-selected-image="hasSelectedImage"
            :selected-image-name="selectedImageFile?.name"
            @select-image="selectProfileImage"
            @edit-image="openCropModal"
            @save-image="uploadProfileImage"
            @cancel-image="cancelProfileImageSelection"
          />

          <ProfileCompletionCard
            :completion-percent="profileCompletionPercent"
            :completion-items="profileCompletionItems"
          />
        </aside>

        <div class="space-y-6">
          <ProfileDetailsForm
            :form="profileForm"
            :errors="profileErrors"
            :saving="savingProfile"
            :has-changes="hasProfileChanges"
            @submit="saveProfile"
          />

          <PasswordChangeForm
            :form="passwordForm"
            :errors="passwordErrors"
            :saving="savingPassword"
            @submit="changePassword"
          />
        </div>
      </div>
    </section>

    <AppModal
      :open="leaveConfirmationOpen"
      :title="t('profile.leave.title')"
      @close="resolveLeaveConfirmation(false)"
    >
      <p class="text-sm leading-6 text-(--color-muted)">
        {{ t("profile.leave.message") }}
      </p>

      <template #footer>
        <AppButton
          type="button"
          variant="secondary"
          class="!rounded-lg"
          @click="resolveLeaveConfirmation(false)"
        >
          {{ t("profile.leave.stay") }}
        </AppButton>
        <AppButton
          type="button"
          variant="danger"
          class="!rounded-lg"
          @click="resolveLeaveConfirmation(true)"
        >
          {{ t("profile.leave.confirm") }}
        </AppButton>
      </template>
    </AppModal>

    <AppModal
      :open="cropModalOpen"
      :title="t('profile.summary.cropImage')"
      panel-class="max-w-xl"
      @close="cropModalOpen = false"
    >
      <div class="space-y-5">
        <p class="text-sm leading-6 text-(--color-muted)">
          {{ t("profile.summary.cropDescription") }}
        </p>

        <Cropper
          ref="cropperRef"
          class="h-[360px] rounded-lg bg-black"
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
          class="!rounded-lg"
          @click="cropModalOpen = false"
        >
          {{ t("common.cancel") }}
        </AppButton>
        <AppButton
          type="button"
          class="!rounded-lg"
          @click="applyCrop"
        >
          {{ t("profile.summary.applyCrop") }}
        </AppButton>
      </template>
    </AppModal>
  </main>
</template>
