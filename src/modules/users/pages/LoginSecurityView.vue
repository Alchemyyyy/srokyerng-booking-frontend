<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { ChevronRightIcon } from "@heroicons/vue/24/outline";
import { useToastStore } from "@/shared/store/toastStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import { userApi } from "../api/user.api";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import SessionManagementCard from "../components/SessionManagementCard.vue";

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
};

const handleSave = async () => {
  passwordErrors.current_password = "";
  passwordErrors.new_password = "";
  passwordErrors.confirm_password = "";

  if (passwordForm.new_password.length < 6) {
    passwordErrors.new_password = "Password must be at least 6 characters long";
    return;
  }

  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordErrors.confirm_password = "Passwords do not match";
    return;
  }

  savingPassword.value = true;
  try {
    await userApi.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
    
    toastStore.success("Password changed successfully.");
    toggleEdit();
  } catch (err) {
    const errorData = err.response?.data || {};
    const backendErrors = errorData.errors || {};
    
    passwordErrors.current_password = backendErrors.current_password || "";
    passwordErrors.new_password = backendErrors.new_password || "";
    passwordErrors.confirm_password = backendErrors.confirm_password || "";
    
    toastStore.danger(err.message || errorData.message || "Failed to change password");
  } finally {
    savingPassword.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans transition-all duration-300"
    :class="isDashboardRole ? (isSidebarOpen ? 'ml-64' : 'ml-20') : ''"
  >
    <PublicNavbar v-if="!isDashboardRole" />

    <main
      class="flex-1 min-h-screen pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col"
      :class="isDashboardRole ? 'pt-25' : 'pt-32'"
    >
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          Account
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">Login & security</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        Login & security
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Main Form Section (Left Side) -->
        <div class="lg:col-span-2 space-y-8 divide-y divide-(--color-border)">
          
          <!-- Password update section -->
          <div class="py-6 first:pt-0">
            <div class="flex justify-between items-start">
              <div class="flex-grow pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">Password</h3>
                
                <!-- Display state -->
                <p v-if="!activeEdit" class="text-sm text-(--color-muted) mt-1 font-medium">
                  Last updated recently
                </p>
                
                <!-- Edit inline form -->
                <div v-else class="mt-5 space-y-4 max-w-md animate-fadeIn">
                  <!-- Current Password -->
                  <div>
                    <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                      Current password
                    </label>
                    <input
                      v-model="passwordForm.current_password"
                      type="password"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                      placeholder="Enter current password"
                    />
                    <p v-if="passwordErrors.current_password" class="text-xs text-rose-500 font-bold mt-1">
                      {{ passwordErrors.current_password }}
                    </p>
                  </div>

                  <!-- New Password -->
                  <div>
                    <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                      New password
                    </label>
                    <input
                      v-model="passwordForm.new_password"
                      type="password"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                      placeholder="Enter new password"
                    />
                    <p v-if="passwordErrors.new_password" class="text-xs text-rose-500 font-bold mt-1">
                      {{ passwordErrors.new_password }}
                    </p>
                  </div>

                  <!-- Confirm New Password -->
                  <div>
                    <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                      Confirm password
                    </label>
                    <input
                      v-model="passwordForm.confirm_password"
                      type="password"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                      placeholder="Re-enter new password"
                    />
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
                      <span v-if="savingPassword">Updating...</span>
                      <span v-else>Update password</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleEdit"
                      class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                @click="toggleEdit"
                class="text-sm font-extrabold text-(--color-text) underline hover:text-(--color-primary) cursor-pointer"
              >
                {{ activeEdit ? 'Cancel' : 'Update' }}
              </button>
            </div>
          </div>

          <!-- Active Sessions Section -->
          <div class="py-6">
            <h3 class="text-sm font-bold text-(--color-text) mb-4">Device management</h3>
            <SessionManagementCard class="!border-0 !p-0 !shadow-none bg-transparent" />
          </div>

        </div>

        <!-- Security Guide Sidebar (Right Side) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft)/40 p-7 space-y-6">
            <div>
              <h3 class="font-extrabold text-lg text-(--color-text)">Security tips</h3>
              <p class="text-xs text-(--color-muted) mt-2 leading-relaxed font-semibold">
                Use a password that is unique to your Srok-Yerng Booking account. Avoid reusing passwords from other online services.
              </p>
            </div>
            
            <div class="my-4 border-t border-(--color-border)/60"></div>
            
            <div>
              <h3 class="font-extrabold text-sm text-(--color-text)">Session activity</h3>
              <p class="text-xs text-(--color-muted) mt-2 leading-relaxed font-semibold">
                If you notice any suspicious active login or device that you do not recognize, you can revoke its token instantly under Device management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter v-if="!isDashboardRole" />
  </div>
</template>
