<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { ChevronRightIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import { userApi } from "../api/user.api";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();

const user = computed(() => authStore.user);
const rolePrefix = computed(() => {
  const role = authStore.user?.role;
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "customer";
});
const isDashboardRole = computed(() => ["owner", "admin"].includes(authStore.user?.role));

// Edit state tracking (stores name of the field currently in edit mode)
const activeEditField = ref(""); 
const loadingField = ref("");

// Forms reactive states
const forms = reactive({
  full_name: user.value?.full_name || "",
  phone: user.value?.phone || "",
  address: user.value?.address || "",
  gender: user.value?.gender || "",
  date_of_birth: user.value?.date_of_birth ? user.value.date_of_birth.split("T")[0] : "",
});

const toggleEdit = (field) => {
  if (activeEditField.value === field) {
    activeEditField.value = "";
  } else {
    // Reset values to store
    forms.full_name = user.value?.full_name || "";
    forms.phone = user.value?.phone || "";
    forms.address = user.value?.address || "";
    forms.gender = user.value?.gender || "";
    forms.date_of_birth = user.value?.date_of_birth ? user.value.date_of_birth.split("T")[0] : "";
    activeEditField.value = field;
  }
};

const handleSave = async (field) => {
  loadingField.value = field;
  try {
    let payload = {};
    if (field === "full_name") payload.full_name = forms.full_name.trim();
    if (field === "phone") payload.phone = forms.phone.trim() || null;
    if (field === "address") payload.address = forms.address.trim() || null;
    if (field === "gender") payload.gender = forms.gender || null;
    if (field === "date_of_birth") payload.date_of_birth = forms.date_of_birth || null;

    const response = await userApi.updateMe(payload);
    const updatedUser = response.data || response;
    
    // Update Pinia store
    authStore.user = { ...authStore.user, ...updatedUser };
    
    toastStore.success(
      t("settingsPage.personalInfo.toasts.updateSuccess", { field: formatLabel(field) })
    );
    activeEditField.value = "";
  } catch (err) {
    toastStore.danger(
      err.message ||
        t("settingsPage.personalInfo.toasts.updateError", { field: formatLabel(field) })
    );
  } finally {
    loadingField.value = "";
  }
};

const formatLabel = (field) => {
  if (field === "full_name") return t("settingsPage.personalInfo.fields.fullName.label");
  if (field === "phone") return t("settingsPage.personalInfo.fields.phone.label");
  if (field === "address") return t("settingsPage.personalInfo.fields.address.label");
  if (field === "gender") return t("settingsPage.personalInfo.fields.gender.label");
  if (field === "date_of_birth") return t("settingsPage.personalInfo.fields.dateOfBirth.label");
  return field;
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
      <!-- Breadcrumbs navigation -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          {{ t("settingsPage.personalInfo.breadcrumbs.account") }}
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">{{ t("settingsPage.personalInfo.breadcrumbs.current") }}</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        {{ t("settingsPage.personalInfo.title") }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Edit Form List (Left Panel) -->
        <div class="lg:col-span-2 divide-y divide-(--color-border)">
          
          <!-- Legal Name Row -->
          <div class="py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.personalInfo.fields.fullName.label") }}</h3>

                <!-- Display Mode -->
                <p v-if="activeEditField !== 'full_name'" class="text-sm text-(--color-muted) mt-1 font-medium">
                  {{ user?.full_name || t("settingsPage.personalInfo.notProvided") }}
                </p>

                <!-- Edit Mode -->
                <div v-else class="mt-4 space-y-4 max-w-md animate-fadeIn">
                  <p class="text-xs text-(--color-muted) leading-relaxed">
                    {{ t("settingsPage.personalInfo.fields.fullName.hint") }}
                  </p>
                  <div>
                    <input
                      v-model="forms.full_name"
                      type="text"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                      :placeholder="t('settingsPage.personalInfo.fields.fullName.placeholder')"
                    />
                  </div>
                  <div class="flex gap-3">
                    <button
                      type="button"
                      @click="handleSave('full_name')"
                      :disabled="loadingField === 'full_name' || !forms.full_name.trim()"
                      class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <span v-if="loadingField === 'full_name'">{{ t("settingsPage.personalInfo.saving") }}</span>
                      <span v-else>{{ t("settingsPage.personalInfo.save") }}</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleEdit('full_name')"
                      class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                    >
                      {{ t("settingsPage.personalInfo.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="toggleEdit('full_name')"
                class="text-sm font-extrabold text-(--color-text) underline hover:text-(--color-primary) cursor-pointer"
              >
                {{ activeEditField === 'full_name' ? t("settingsPage.personalInfo.cancel") : t("settingsPage.personalInfo.edit") }}
              </button>
            </div>
          </div>

          <!-- Email Address Row (Read Only Badge for Security) -->
          <div class="py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.personalInfo.fields.email.label") }}</h3>
                <p class="text-sm text-(--color-muted) mt-1 font-medium">
                  {{ user?.email }}
                </p>
                <p class="text-[10px] text-(--color-muted) font-semibold mt-1">
                  {{ t("settingsPage.personalInfo.fields.email.hint") }}
                </p>
              </div>
              <span class="text-xs font-bold text-(--color-success) bg-(--color-success-soft) px-2.5 py-1 rounded-full border border-(--color-success)/10">
                {{ statusLabel("verified") }}
              </span>
            </div>
          </div>

          <!-- Phone Number Row -->
          <div class="py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.personalInfo.fields.phone.label") }}</h3>

                <!-- Display Mode -->
                <p v-if="activeEditField !== 'phone'" class="text-sm text-(--color-muted) mt-1 font-medium">
                  {{ user?.phone || t("settingsPage.personalInfo.notProvided") }}
                </p>

                <!-- Edit Mode -->
                <div v-else class="mt-4 space-y-4 max-w-md animate-fadeIn">
                  <p class="text-xs text-(--color-muted) leading-relaxed">
                    {{ t("settingsPage.personalInfo.fields.phone.hint") }}
                  </p>
                  <div>
                    <input
                      v-model="forms.phone"
                      type="text"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                      :placeholder="t('settingsPage.personalInfo.fields.phone.placeholder')"
                    />
                  </div>
                  <div class="flex gap-3">
                    <button
                      type="button"
                      @click="handleSave('phone')"
                      :disabled="loadingField === 'phone'"
                      class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <span v-if="loadingField === 'phone'">{{ t("settingsPage.personalInfo.saving") }}</span>
                      <span v-else>{{ t("settingsPage.personalInfo.save") }}</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleEdit('phone')"
                      class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                    >
                      {{ t("settingsPage.personalInfo.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="toggleEdit('phone')"
                class="text-sm font-extrabold text-(--color-text) underline hover:text-(--color-primary) cursor-pointer"
              >
                {{ activeEditField === 'phone' ? t("settingsPage.personalInfo.cancel") : t("settingsPage.personalInfo.edit") }}
              </button>
            </div>
          </div>

          <!-- Gender Row -->
          <div class="py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.personalInfo.fields.gender.label") }}</h3>

                <!-- Display Mode -->
                <p v-if="activeEditField !== 'gender'" class="text-sm text-(--color-muted) mt-1 font-medium capitalize">
                  {{ user?.gender || t("settingsPage.personalInfo.notProvided") }}
                </p>

                <!-- Edit Mode -->
                <div v-else class="mt-4 space-y-4 max-w-md animate-fadeIn">
                  <div>
                    <select
                      v-model="forms.gender"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                    >
                      <option value="">{{ t("settingsPage.personalInfo.fields.gender.options.select") }}</option>
                      <option value="male">{{ t("settingsPage.personalInfo.fields.gender.options.male") }}</option>
                      <option value="female">{{ t("settingsPage.personalInfo.fields.gender.options.female") }}</option>
                      <option value="other">{{ t("settingsPage.personalInfo.fields.gender.options.other") }}</option>
                    </select>
                  </div>
                  <div class="flex gap-3">
                    <button
                      type="button"
                      @click="handleSave('gender')"
                      :disabled="loadingField === 'gender'"
                      class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <span v-if="loadingField === 'gender'">{{ t("settingsPage.personalInfo.saving") }}</span>
                      <span v-else>{{ t("settingsPage.personalInfo.save") }}</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleEdit('gender')"
                      class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                    >
                      {{ t("settingsPage.personalInfo.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="toggleEdit('gender')"
                class="text-sm font-extrabold text-(--color-text) underline hover:text-(--color-primary) cursor-pointer"
              >
                {{ activeEditField === 'gender' ? t("settingsPage.personalInfo.cancel") : t("settingsPage.personalInfo.edit") }}
              </button>
            </div>
          </div>

          <!-- Date of Birth Row -->
          <div class="py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.personalInfo.fields.dateOfBirth.label") }}</h3>

                <!-- Display Mode -->
                <p v-if="activeEditField !== 'date_of_birth'" class="text-sm text-(--color-muted) mt-1 font-medium">
                  {{ user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : t("settingsPage.personalInfo.notProvided") }}
                </p>

                <!-- Edit Mode -->
                <div v-else class="mt-4 space-y-4 max-w-md animate-fadeIn">
                  <div>
                    <input
                      v-model="forms.date_of_birth"
                      type="date"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold"
                    />
                  </div>
                  <div class="flex gap-3">
                    <button
                      type="button"
                      @click="handleSave('date_of_birth')"
                      :disabled="loadingField === 'date_of_birth'"
                      class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <span v-if="loadingField === 'date_of_birth'">{{ t("settingsPage.personalInfo.saving") }}</span>
                      <span v-else>{{ t("settingsPage.personalInfo.save") }}</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleEdit('date_of_birth')"
                      class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                    >
                      {{ t("settingsPage.personalInfo.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="toggleEdit('date_of_birth')"
                class="text-sm font-extrabold text-(--color-text) underline hover:text-(--color-primary) cursor-pointer"
              >
                {{ activeEditField === 'date_of_birth' ? t("settingsPage.personalInfo.cancel") : t("settingsPage.personalInfo.edit") }}
              </button>
            </div>
          </div>

          <!-- Address Row -->
          <div class="py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.personalInfo.fields.address.label") }}</h3>

                <!-- Display Mode -->
                <p v-if="activeEditField !== 'address'" class="text-sm text-(--color-muted) mt-1 font-medium">
                  {{ user?.address || t("settingsPage.personalInfo.notProvided") }}
                </p>

                <!-- Edit Mode -->
                <div v-else class="mt-4 space-y-4 max-w-md animate-fadeIn">
                  <div>
                    <textarea
                      v-model="forms.address"
                      rows="2"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold resize-none"
                      :placeholder="t('settingsPage.personalInfo.fields.address.placeholder')"
                    ></textarea>
                  </div>
                  <div class="flex gap-3">
                    <button
                      type="button"
                      @click="handleSave('address')"
                      :disabled="loadingField === 'address'"
                      class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <span v-if="loadingField === 'address'">{{ t("settingsPage.personalInfo.saving") }}</span>
                      <span v-else>{{ t("settingsPage.personalInfo.save") }}</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleEdit('address')"
                      class="px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-bold text-xs hover:bg-(--color-surface-soft) active:scale-95 transition cursor-pointer"
                    >
                      {{ t("settingsPage.personalInfo.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="toggleEdit('address')"
                class="text-sm font-extrabold text-(--color-text) underline hover:text-(--color-primary) cursor-pointer"
              >
                {{ activeEditField === 'address' ? t("settingsPage.personalInfo.cancel") : t("settingsPage.personalInfo.edit") }}
              </button>
            </div>
          </div>

        </div>

        <!-- Sidebar Info Panel (Right Panel) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft)/40 p-7 space-y-6">
            <div>
              <h3 class="font-extrabold text-lg text-(--color-text)">{{ t("settingsPage.personalInfo.sidebar.whyEdit.title") }}</h3>
              <p class="text-xs text-(--color-muted) mt-2 leading-relaxed font-semibold">
                {{ t("settingsPage.personalInfo.sidebar.whyEdit.description") }}
              </p>
            </div>

            <div class="my-4 border-t border-(--color-border)/60"></div>

            <div>
              <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("settingsPage.personalInfo.sidebar.dataSafety.title") }}</h3>
              <p class="text-xs text-(--color-muted) mt-2 leading-relaxed font-semibold">
                {{ t("settingsPage.personalInfo.sidebar.dataSafety.description") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter v-if="!isDashboardRole" />
  </div>
</template>
