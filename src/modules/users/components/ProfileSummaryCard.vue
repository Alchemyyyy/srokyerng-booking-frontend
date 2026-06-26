<script setup>
import { computed, ref } from "vue";
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/vue/24/solid";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

const { t } = useI18n({ useScope: "global" });
const imagePreviewOpen = ref(false);

const props = defineProps({
  userLabel: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  roleLabel: {
    type: String,
    required: true,
  },
  avatarSrc: {
    type: String,
    default: "",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationLabel: {
    type: String,
    required: true,
  },
  emailVerificationToneClass: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["select-image", "remove-image"]);

const resolvedAvatarSrc = computed(() => resolveAssetUrl(props.avatarSrc));
const canPreviewAvatar = computed(() => Boolean(resolvedAvatarSrc.value));
</script>

<template>
  <section class="rounded-3xl border border-(--color-border)/80 bg-(--color-surface)/95 p-7 shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300">
    <!-- Compact layout: Used inline next to profile details -->
    <div v-if="compact" class="flex flex-col gap-3 items-center sm:items-start">
      <div class="relative group">
        <!-- Ambient radial glow behind the avatar -->
        <div class="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-(--color-primary) to-sky-500 opacity-30 blur-xl transition-all duration-500 group-hover:opacity-60 group-hover:scale-105"></div>
        <button
          type="button"
          class="relative rounded-2xl outline-none transition hover:scale-[1.02] focus:ring-4 focus:ring-(--color-primary)/20 block overflow-hidden shadow-lg"
          :disabled="!canPreviewAvatar"
          :aria-label="t('profile.summary.viewImage')"
          @click="imagePreviewOpen = true"
        >
          <UserAvatar
            :name="userLabel"
            :src="avatarSrc"
            size-class="h-32 w-32 text-4xl font-black object-cover"
          />
        </button>

        <label
          class="absolute -bottom-1 -right-1 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border-2 border-(--color-surface) bg-(--color-primary) text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-(--color-primary-strong)"
          :title="t('profile.summary.uploadImage')"
        >
          <CameraIcon class="h-5 w-5" />
          <input
            type="file"
            class="sr-only"
            accept="image/jpeg,image/png,image/webp"
            @change="$emit('select-image', $event)"
          />
        </label>
      </div>
    </div>

    <!-- Full layout: Used in sticky sidebar for hosts/admins -->
    <div v-else class="flex flex-col items-center text-center">
      <div class="relative group">
        <!-- Ambient radial glow behind the avatar -->
        <div class="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-(--color-primary) to-sky-500 opacity-30 blur-xl transition-all duration-500 group-hover:opacity-60 group-hover:scale-105"></div>
        <button
          type="button"
          class="relative rounded-2xl outline-none transition hover:scale-[1.02] focus:ring-4 focus:ring-(--color-primary)/20 block overflow-hidden shadow-lg"
          :disabled="!canPreviewAvatar"
          :aria-label="t('profile.summary.viewImage')"
          @click="imagePreviewOpen = true"
        >
          <UserAvatar
            :name="userLabel"
            :src="avatarSrc"
            size-class="h-36 w-36 text-4xl font-black object-cover"
          />
        </button>

        <label
          class="absolute -bottom-1 -right-1 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border-2 border-(--color-surface) bg-(--color-primary) text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-(--color-primary-strong)"
          :title="t('profile.summary.uploadImage')"
        >
          <CameraIcon class="h-5 w-5" />
          <input
            type="file"
            class="sr-only"
            accept="image/jpeg,image/png,image/webp"
            @change="$emit('select-image', $event)"
          />
        </label>
      </div>

      <div class="mt-6 flex items-center justify-center gap-2">
        <h2 class="text-2xl font-black text-(--color-text)">
          {{ userLabel }}
        </h2>
        <span
          v-if="emailVerified"
          class="inline-flex items-center text-emerald-500"
          :title="t('nav.verifiedProfile')"
        >
          <CheckCircleIconSolid class="h-6 w-6" />
        </span>
      </div>
      <p class="mt-1 text-sm font-bold text-(--color-muted)">
        {{ email }}
      </p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <span
          class="rounded-full bg-(--color-primary-soft) px-3.5 py-1 text-xs font-black uppercase tracking-[0.15em] text-(--color-primary) border border-(--color-primary)/20 shadow-xs"
        >
          {{ roleLabel }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-[0.15em] border shadow-xs"
          :class="emailVerified ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'"
        >
          <CheckCircleIcon v-if="emailVerified" class="h-4 w-4" />
          <XCircleIcon v-else class="h-4 w-4" />
          {{ emailVerificationLabel }}
        </span>
      </div>

      <p class="mt-5 text-xs font-bold text-(--color-muted)">
        {{ t("profile.summary.uploadImage") }}
      </p>
    </div>

    <!-- Image Preview Modal -->
    <AppModal
      :open="imagePreviewOpen"
      :title="t('profile.summary.viewImage')"
      panel-class="max-w-3xl !rounded-3xl border border-(--color-border)/80 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300"
      @close="imagePreviewOpen = false"
    >
      <div class="overflow-hidden rounded-2xl bg-black shadow-inner my-2">
        <img
          :src="resolvedAvatarSrc"
          :alt="userLabel"
          class="max-h-[70vh] w-full object-contain"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <AppButton
            type="button"
            variant="danger"
            class="!rounded-2xl flex items-center gap-2 font-black px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            @click="$emit('remove-image'); imagePreviewOpen = false"
          >
            <TrashIcon class="h-4 w-4" />
            {{ t("profile.summary.removeImage", "Remove image") }}
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            class="!rounded-2xl font-black px-6 py-3 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
            @click="imagePreviewOpen = false"
          >
            {{ t("common.close", "Close") }}
          </AppButton>
        </div>
      </template>
    </AppModal>
  </section>
</template>
