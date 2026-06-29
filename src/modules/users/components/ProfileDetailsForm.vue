<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";

const { t } = useI18n({ useScope: "global" });

defineProps({
  form: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  hasChanges: {
    type: Boolean,
    default: false,
  },
  userName: {
    type: String,
    required: true,
  },
  avatarSrc: {
    type: String,
    required: true,
  },
  hasCustomAvatar: {
    type: Boolean,
    default: false,
  },
  uploadingImage: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["submit", "file-select", "delete-click"]);

const fileInput = ref(null);
</script>

<template>
  <form
    class="bg-transparent space-y-8 transition-all duration-300"
    @submit.prevent="$emit('submit')"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
      
      <!-- Left Column: Avatar Photo Section -->
      <div class="md:col-span-1 flex flex-col items-center text-center space-y-4">
        <div class="relative group">
          <div class="h-44 w-44 rounded-full overflow-hidden border border-(--color-border) shadow-lg bg-(--color-surface-soft) flex items-center justify-center">
            <UserAvatar
              :name="userName"
              :src="avatarSrc"
              size-class="h-full w-full text-5xl font-bold"
            />
          </div>
          <div v-if="uploadingImage" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">Uploading...</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-[200px] items-center">
          <!-- Hidden File Input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="$emit('file-select', $event)"
          />
          <button
            type="button"
            @click="fileInput.click()"
            :disabled="uploadingImage"
            class="flex items-center justify-center gap-2 w-full py-2.5 bg-(--color-surface) hover:bg-(--color-surface-soft) border border-(--color-border) rounded-full shadow-xs hover:shadow-md transition active:scale-95 font-bold text-xs cursor-pointer text-(--color-text)"
          >
            <svg class="h-4 w-4 text-(--color-text)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Edit photo
          </button>
          
          <button
            v-if="hasCustomAvatar"
            type="button"
            @click="$emit('delete-click')"
            :disabled="uploadingImage"
            class="text-xs font-bold text-rose-500 hover:underline active:scale-95 transition mt-1 cursor-pointer bg-transparent border-none"
          >
            Remove photo
          </button>
        </div>
      </div>

      <!-- Right Column: My Profile Info Section -->
      <div class="md:col-span-2 space-y-8">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-(--color-text)">My profile</h2>
          <p class="mt-2 text-sm leading-relaxed text-(--color-muted) font-medium">
            Hosts and guests can see your profile details to help build trust in our booking community.
          </p>
        </div>

        <!-- Inline Underlined Fields Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          
          <!-- Full Name -->
          <div class="flex items-center gap-3 border-b border-(--color-border)/60 py-3.5 focus-within:border-(--color-primary) transition-colors">
            <svg class="h-5 w-5 text-(--color-muted) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div class="flex-1 min-w-0">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-(--color-muted) mb-0.5">Full name</span>
              <input
                v-model="form.full_name"
                type="text"
                placeholder="Enter full name"
                required
                class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) placeholder-(--color-muted) p-0 focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          <!-- Phone -->
          <div class="flex items-center gap-3 border-b border-(--color-border)/60 py-3.5 focus-within:border-(--color-primary) transition-colors">
            <svg class="h-5 w-5 text-(--color-muted) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div class="flex-1 min-w-0">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-(--color-muted) mb-0.5">Phone number</span>
              <input
                v-model="form.phone"
                type="text"
                placeholder="Enter phone number"
                class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) placeholder-(--color-muted) p-0 focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          <!-- Gender -->
          <div class="flex items-center gap-3 border-b border-(--color-border)/60 py-3.5 focus-within:border-(--color-primary) transition-colors">
            <svg class="h-5 w-5 text-(--color-muted) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <div class="flex-1 min-w-0">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-(--color-muted) mb-0.5">Gender</span>
              <select
                v-model="form.gender"
                class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) placeholder-(--color-muted) p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Date of Birth -->
          <div class="flex items-center gap-3 border-b border-(--color-border)/60 py-3.5 focus-within:border-(--color-primary) transition-colors">
            <svg class="h-5 w-5 text-(--color-muted) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div class="flex-1 min-w-0">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-(--color-muted) mb-0.5">Date of birth</span>
              <input
                v-model="form.date_of_birth"
                type="date"
                class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) placeholder-(--color-muted) p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          <!-- Address -->
          <div class="sm:col-span-2 flex items-center gap-3 border-b border-(--color-border)/60 py-3.5 focus-within:border-(--color-primary) transition-colors">
            <svg class="h-5 w-5 text-(--color-muted) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div class="flex-1 min-w-0">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-(--color-muted) mb-0.5">Address</span>
              <input
                v-model="form.address"
                type="text"
                placeholder="Enter your address"
                class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) placeholder-(--color-muted) p-0 focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

        </div>

        <!-- Unsaved Changes indicator & Save Button -->
        <div class="mt-8 flex flex-col gap-4 border-t border-(--color-border)/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-(--color-muted) font-medium">
            <span v-if="hasChanges" class="font-black text-(--color-warning) flex items-center gap-1.5">
              <span class="flex h-2 w-2 rounded-full bg-(--color-warning) animate-ping"></span>
              Unsaved changes
            </span>
            <span v-else>
              Keep your profile updated.
            </span>
          </p>
          <AppButton
            type="submit"
            class="!rounded-full font-black px-8 py-3.5 shadow-lg shadow-(--color-primary)/20 hover:shadow-xl hover:shadow-(--color-primary)/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            :disabled="saving || !hasChanges"
            :loading="saving"
          >
            Save profile
          </AppButton>
        </div>

      </div>

    </div>
  </form>
</template>

<style scoped>
/* Standard styling options override to secure clean transparent inputs */
input, select {
  box-shadow: none !important;
  border-radius: 0 !important;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input::-webkit-calendar-picker-indicator {
  filter: var(--calendar-filter-invert, none);
  cursor: pointer;
}
select {
  background: transparent !important;
}
select option {
  background-color: var(--color-surface);
  color: var(--color-text);
}
</style>
