<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { ChevronRightIcon, EyeIcon, EyeSlashIcon, KeyIcon, PencilIcon } from "@heroicons/vue/24/outline";
import { useToastStore } from "@/shared/store/toastStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import { userApi } from "../api/user.api";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import SessionManagementCard from "../components/SessionManagementCard.vue";

const { t } = useI18n({ useScope: "global" });

const router = useRouter();
const toastStore = useToastStore();
const authStore = useAuthStore();
const { isSidebarOpen } = useSidebar();

const rolePrefix = computed(() => {
  const role = authStore.user?.role;
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "customer";
});
const isDashboardRole = computed(() => ["owner", "admin"].includes(authStore.user?.role));

const activeEdit = ref(false);
const savingPassword = ref(false);

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordForm = reactive({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const passwordErrors = reactive({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const toggleEdit = () => {
  activeEdit.value = !activeEdit.value;
  // Clear state on toggle
  passwordForm.current_password = "";
  passwordForm.new_password = "";
  passwordForm.confirm_password = "";
  passwordErrors.current_password = "";
  passwordErrors.new_password = "";
  passwordErrors.confirm_password = "";
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
};

const handleSave = async () => {
  passwordErrors.current_password = "";
  passwordErrors.new_password = "";
  passwordErrors.confirm_password = "";

  if (passwordForm.new_password.length < 6) {
    passwordErrors.new_password = t("settingsPage.loginSecurity.errors.passwordTooShort");
    return;
  }

  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordErrors.confirm_password = t("settingsPage.loginSecurity.errors.passwordMismatch");
    return;
  }

  savingPassword.value = true;
  try {
    await userApi.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });

    toastStore.success(t("settingsPage.loginSecurity.toasts.passwordUpdated"));
    toggleEdit();
  } catch (err) {
    const errorData = err.response?.data || {};
    const backendErrors = errorData.errors || {};

    passwordErrors.current_password = backendErrors.current_password || "";
    passwordErrors.new_password = backendErrors.new_password || "";
    passwordErrors.confirm_password = backendErrors.confirm_password || "";

    toastStore.danger(err.message || errorData.message || t("settingsPage.loginSecurity.errors.updateFailed"));
  } finally {
    savingPassword.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans transition-all duration-300"
    :class="authStore.user?.role === 'admin' ? (isSidebarOpen ? 'ml-64' : 'ml-20') : ''"
  >
    <PublicNavbar v-if="!isDashboardRole" />

    <main
      class="flex-1 min-h-screen pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col"
      :class="isDashboardRole ? 'pt-25' : 'pt-32'"
    >
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          {{ t("settingsPage.loginSecurity.breadcrumb.account") }}
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">{{ t("settingsPage.loginSecurity.breadcrumb.current") }}</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        {{ t("settingsPage.loginSecurity.title") }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Main Form Section (Left Side) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Password update card -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex justify-between items-start">
              <div class="flex items-start gap-4 flex-1 pr-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                  <KeyIcon class="h-5 w-5" />
                </div>
                <div class="flex-grow">
                  <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.loginSecurity.password.label") }}</h3>

                  <!-- Display state -->
                  <p v-if="!activeEdit" class="text-sm text-(--color-muted) mt-1.5 font-semibold">
                    {{ t("settingsPage.loginSecurity.password.lastUpdated") }}
                  </p>

                  <!-- Edit inline form -->
                  <div v-else class="mt-5 space-y-4 max-w-md animate-fadeIn">
                    <!-- Current Password -->
                    <div>
                      <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                        {{ t("settingsPage.loginSecurity.password.currentLabel") }}
                      </label>
                      <div class="relative">
                        <input
                          v-model="passwordForm.current_password"
                          :type="showCurrentPassword ? 'text' : 'password'"
                          class="w-full rounded-xl border border-(--color-border) pl-4 pr-12 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                          :placeholder="t('settingsPage.loginSecurity.password.currentPlaceholder')"
                        />
                        <button
                          type="button"
                          @click="showCurrentPassword = !showCurrentPassword"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-text) cursor-pointer"
                        >
                          <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5" />
                          <EyeSlashIcon v-else class="h-5 w-5" />
                        </button>
                      </div>
                      <p v-if="passwordErrors.current_password" class="text-xs text-rose-500 font-bold mt-1">
                        {{ passwordErrors.current_password }}
                      </p>
                    </div>

                    <!-- New Password -->
                    <div>
                      <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                        {{ t("settingsPage.loginSecurity.password.newLabel") }}
                      </label>
                      <div class="relative">
                        <input
                          v-model="passwordForm.new_password"
                          :type="showNewPassword ? 'text' : 'password'"
                          class="w-full rounded-xl border border-(--color-border) pl-4 pr-12 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                          :placeholder="t('settingsPage.loginSecurity.password.newPlaceholder')"
                        />
                        <button
                          type="button"
                          @click="showNewPassword = !showNewPassword"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-text) cursor-pointer"
                        >
                          <EyeIcon v-if="!showNewPassword" class="h-5 w-5" />
                          <EyeSlashIcon v-else class="h-5 w-5" />
                        </button>
                      </div>
                      <p v-if="passwordErrors.new_password" class="text-xs text-rose-500 font-bold mt-1">
                        {{ passwordErrors.new_password }}
                      </p>
                    </div>

                    <!-- Confirm New Password -->
                    <div>
                      <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                        {{ t("settingsPage.loginSecurity.password.confirmLabel") }}
                      </label>
                      <div class="relative">
                        <input
                          v-model="passwordForm.confirm_password"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          class="w-full rounded-xl border border-(--color-border) pl-4 pr-12 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                          :placeholder="t('settingsPage.loginSecurity.password.confirmPlaceholder')"
                        />
                        <button
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-text) cursor-pointer"
                        >
                          <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                          <EyeSlashIcon v-else class="h-5 w-5" />
                        </button>
                      </div>
                      <p v-if="passwordErrors.confirm_password" class="text-xs text-rose-500 font-bold mt-1">
                        {{ passwordErrors.confirm_password }}
                      </p>
                    </div>

                    <!-- Save / Cancel Controls -->
                    <div class="flex gap-3 pt-2">
                      <button
                        type="button"
                        @click="handleSave"
                        :disabled="savingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password"
                        class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                      >
                        <span v-if="savingPassword">{{ t("settingsPage.loginSecurity.password.updating") }}</span>
                        <span v-else>{{ t("settingsPage.loginSecurity.password.updateButton") }}</span>
                      </button>
                      <button
                        type="button"
                        @click="toggleEdit"
                        class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                      >
                        {{ t("settingsPage.loginSecurity.password.cancelButton") }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                @click="toggleEdit"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--color-border) hover:bg-(--color-surface-soft) text-xs font-bold text-(--color-text) transition active:scale-95 cursor-pointer"
              >
                <PencilIcon class="h-3.5 w-3.5 text-(--color-muted)" />
                <span>{{ activeEdit ? t("settingsPage.loginSecurity.password.cancelButton") : t("settingsPage.loginSecurity.password.updateToggle") }}</span>
              </button>
            </div>
          </div>

          <!-- Active Sessions Section -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-(--color-text) ml-1">{{ t("settingsPage.loginSecurity.deviceManagement.title") }}</h3>
            <SessionManagementCard class="border border-(--color-border) bg-(--color-surface) p-6 rounded-2xl shadow-xs" />
          </div>

        </div>

        <!-- Security Guide Sidebar (Right Side) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft)/40 p-7 space-y-6">
            <div>
              <h3 class="font-extrabold text-lg text-(--color-text)">{{ t("settingsPage.loginSecurity.sidebar.tipsTitle") }}</h3>
              <p class="text-xs text-(--color-muted) mt-2 leading-relaxed font-semibold">
                {{ t("settingsPage.loginSecurity.sidebar.tipsDescription") }}
              </p>
            </div>

            <div class="my-4 border-t border-(--color-border)/60"></div>

            <div>
              <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("settingsPage.loginSecurity.sidebar.sessionActivityTitle") }}</h3>
              <p class="text-xs text-(--color-muted) mt-2 leading-relaxed font-semibold">
                {{ t("settingsPage.loginSecurity.sidebar.sessionActivityDescription") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter v-if="!isDashboardRole" />
  </div>
</template>
