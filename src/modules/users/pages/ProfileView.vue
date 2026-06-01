<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  CameraIcon,
  CheckCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
import AppInput from "@/shared/components/AppInput.vue";
import AppTextarea from "@/shared/components/AppTextarea.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { userService } from "@/modules/users/services/user.service";

const authStore = useAuthStore();

const loading = ref(false);
const savingProfile = ref(false);
const savingPassword = ref(false);
const uploadingImage = ref(false);
const error = ref("");
const success = ref("");

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
});

const user = ref(null);

const userLabel = computed(() => user.value?.full_name || user.value?.email || "User");
const userInitial = computed(() => userLabel.value.trim().charAt(0).toUpperCase());

const roleLabel = computed(() => {
  const role = user.value?.role || "member";
  return role.charAt(0).toUpperCase() + role.slice(1);
});

const emailVerificationLabel = computed(() =>
  user.value?.email_verified_at ? "Verified" : "Not verified",
);

const profileImageUrl = computed(() => {
  const imageUrl = user.value?.profile_image_url;

  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
  const assetBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  return `${assetBaseUrl}${imageUrl}`;
});

const syncForm = (nextUser) => {
  user.value = nextUser;
  profileForm.full_name = nextUser.full_name || "";
  profileForm.phone = nextUser.phone || "";
  profileForm.gender = nextUser.gender || "";
  profileForm.date_of_birth = nextUser.date_of_birth
    ? String(nextUser.date_of_birth).slice(0, 10)
    : "";
  profileForm.address = nextUser.address || "";
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
    error.value = requestError.message || "Could not load profile";
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  savingProfile.value = true;
  error.value = "";
  success.value = "";

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
    success.value = "Profile updated";
  } catch (requestError) {
    error.value = requestError.message || "Could not update profile";
  } finally {
    savingProfile.value = false;
  }
};

const changePassword = async () => {
  savingPassword.value = true;
  error.value = "";
  success.value = "";

  try {
    await userService.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });

    passwordForm.current_password = "";
    passwordForm.new_password = "";
    success.value = "Password changed";
  } catch (requestError) {
    error.value = requestError.message || "Could not change password";
  } finally {
    savingPassword.value = false;
  }
};

const uploadProfileImage = async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  uploadingImage.value = true;
  error.value = "";
  success.value = "";

  try {
    const response = await userService.updateProfileImage(file);
    syncForm(response.data);
    syncAuthUser(response.data);
    success.value = "Profile image updated";
  } catch (requestError) {
    error.value = requestError.message || "Could not upload profile image";
  } finally {
    uploadingImage.value = false;
    event.target.value = "";
  }
};

onMounted(loadProfile);
</script>

<template>
  <main class="min-h-screen bg-(--color-page) px-4 py-8 text-(--color-text) sm:px-6 lg:px-8">
    <section class="mx-auto max-w-6xl">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
            Account
          </p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight">Profile settings</h1>
          <p class="mt-2 max-w-2xl text-sm text-(--color-muted)">
            Manage your personal details, profile image, and account password.
          </p>
        </div>
      </header>

      <div
        v-if="error"
        class="mb-5 rounded-lg border border-(--color-danger) bg-(--color-danger-soft) px-4 py-3 text-sm font-semibold text-(--color-danger)"
      >
        {{ error }}
      </div>

      <div
        v-if="success"
        class="mb-5 rounded-lg border border-(--color-success) bg-(--color-success-soft) px-4 py-3 text-sm font-semibold text-(--color-success)"
      >
        {{ success }}
      </div>

      <div
        v-if="loading"
        class="rounded-lg border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-card)"
      >
        <LoadingSpinner label="Loading profile..." />
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="space-y-6">
          <section class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
            <div class="flex flex-col items-center text-center">
              <div class="relative">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile"
                  class="h-28 w-28 rounded-full object-cover ring-4 ring-(--color-primary-soft)"
                />
                <div
                  v-else
                  class="flex h-28 w-28 items-center justify-center rounded-full bg-(--color-primary-soft) text-3xl font-bold text-(--color-primary) ring-4 ring-(--color-primary-soft)"
                >
                  {{ userInitial }}
                </div>
              </div>

              <h2 class="mt-4 text-xl font-bold">{{ userLabel }}</h2>
              <p class="mt-1 text-sm text-(--color-muted)">{{ user?.email }}</p>
              <span
                class="mt-3 rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-(--color-primary)"
              >
                {{ roleLabel }}
              </span>

              <label
                class="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--color-border) px-4 py-2 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                <CameraIcon class="h-5 w-5" />
                {{ uploadingImage ? "Uploading..." : "Upload image" }}
                <input
                  type="file"
                  class="sr-only"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="uploadingImage"
                  @change="uploadProfileImage"
                />
              </label>
            </div>
          </section>

          <section class="rounded-lg border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)">
            <div class="flex items-start gap-3">
              <ShieldCheckIcon class="mt-0.5 h-6 w-6 text-(--color-primary)" />
              <div>
                <h3 class="font-bold">Email status</h3>
                <p class="mt-1 text-sm text-(--color-muted)">
                  {{ emailVerificationLabel }}
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div class="space-y-6">
          <form
            class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
            @submit.prevent="saveProfile"
          >
            <div class="mb-5 flex items-center gap-3">
              <UserCircleIcon class="h-6 w-6 text-(--color-primary)" />
              <div>
                <h2 class="text-xl font-bold">Personal information</h2>
                <p class="text-sm text-(--color-muted)">Update your public profile details.</p>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppInput
                v-model="profileForm.full_name"
                label="Full name"
                placeholder="Your full name"
                required
              />
              <AppInput
                v-model="profileForm.phone"
                label="Phone"
                placeholder="012345678"
              />
              <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
                <span>Gender</span>
                <select
                  v-model="profileForm.gender"
                  class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none transition focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-focus-ring)"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <AppInput
                v-model="profileForm.date_of_birth"
                type="date"
                label="Date of birth"
              />
              <div class="md:col-span-2">
                <AppTextarea
                  v-model="profileForm.address"
                  label="Address"
                  placeholder="Your address"
                  rows="3"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                type="submit"
                class="rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-strong) disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="savingProfile"
              >
                {{ savingProfile ? "Saving..." : "Save profile" }}
              </button>
            </div>
          </form>

          <form
            class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
            @submit.prevent="changePassword"
          >
            <div class="mb-5 flex items-center gap-3">
              <KeyIcon class="h-6 w-6 text-(--color-primary)" />
              <div>
                <h2 class="text-xl font-bold">Change password</h2>
                <p class="text-sm text-(--color-muted)">
                  You will receive a security notification after changing it.
                </p>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppInput
                v-model="passwordForm.current_password"
                type="password"
                label="Current password"
                required
              />
              <AppInput
                v-model="passwordForm.new_password"
                type="password"
                label="New password"
                required
              />
            </div>

            <div class="mt-6 flex justify-end">
              <button
                type="submit"
                class="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="savingPassword"
              >
                {{ savingPassword ? "Changing..." : "Change password" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>
