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
  <section class="rounded-md border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
    <!-- Compact layout: Used inline next to profile details -->
    <div v-if="compact" class="flex flex-col gap-3 items-center sm:items-start">
      <div class="relative group">
        <!-- Ambient radial glow behind the avatar -->
        <div class="absolute -inset-1 rounded-full bg-gradient-to-tr from-(--color-primary) to-(--color-secondary) opacity-20 blur-lg transition duration-500 group-hover:opacity-40"></div>
        <button
          type="button"
          class="relative rounded-full outline-none transition hover:scale-[1.02] focus:ring-4 focus:ring-(--color-focus-ring)"
          :disabled="!canPreviewAvatar"
          :aria-label="t('profile.summary.viewImage')"
          @click="imagePreviewOpen = true"
        >
          <UserAvatar
            :name="userLabel"
            :src="avatarSrc"
            size-class="h-28 w-28 text-3xl ring-4 ring-(--color-primary-soft)"
          />
        </button>

        <label
          class="absolute bottom-1 right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-(--color-surface) bg-(--color-primary) text-white shadow-(--shadow-card) transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-(--color-primary-strong)"
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
        <div class="absolute -inset-1 rounded-full bg-gradient-to-tr from-(--color-primary) to-(--color-secondary) opacity-20 blur-lg transition duration-500 group-hover:opacity-40"></div>
        <button
          type="button"
          class="relative rounded-full outline-none transition hover:scale-[1.02] focus:ring-4 focus:ring-(--color-focus-ring)"
          :disabled="!canPreviewAvatar"
          :aria-label="t('profile.summary.viewImage')"
          @click="imagePreviewOpen = true"
        >
          <UserAvatar
            :name="userLabel"
            :src="avatarSrc"
            size-class="h-28 w-28 text-3xl ring-4 ring-(--color-primary-soft)"
          />
        </button>

        <label
          class="absolute bottom-1 right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-(--color-surface) bg-(--color-primary) text-white shadow-(--shadow-card) transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-(--color-primary-strong)"
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

      <div class="mt-4 flex items-center justify-center gap-1.5">
        <h2 class="text-xl font-bold">
          {{ userLabel }}
        </h2>
        <span
          v-if="emailVerified"
          class="inline-flex items-center text-(--color-success)"
          :title="t('nav.verifiedProfile')"
        >
          <CheckCircleIconSolid class="h-5 w-5" />
        </span>
      </div>
      <p class="mt-1 text-sm leading-6 text-(--color-muted)">
        {{ email }}
      </p>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <span
          class="rounded-sm bg-(--color-primary-soft) px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-(--color-primary)"
        >
          {{ roleLabel }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-bold"
          :class="emailVerificationToneClass"
        >
          <CheckCircleIcon v-if="emailVerified" class="h-3.5 w-3.5" />
          <XCircleIcon v-else class="h-3.5 w-3.5" />
          {{ emailVerificationLabel }}
        </span>
      </div>

      <p class="mt-4 text-xs text-(--color-muted)">
        {{ t("profile.summary.uploadImage") }}
      </p>
    </div>

    <!-- Image Preview Modal -->
    <AppModal
      :open="imagePreviewOpen"
      :title="t('profile.summary.viewImage')"
      panel-class="max-w-3xl"
      @close="imagePreviewOpen = false"
    >
      <div class="overflow-hidden rounded-md bg-black">
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
            class="!rounded-sm flex items-center gap-1.5"
            @click="$emit('remove-image'); imagePreviewOpen = false"
          >
            <TrashIcon class="h-4 w-4" />
            {{ t("profile.summary.removeImage", "Remove image") }}
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            class="!rounded-sm"
            @click="imagePreviewOpen = false"
          >
            {{ t("common.close", "Close") }}
          </AppButton>
        </div>
      </template>
    </AppModal>
  </section>
</template>
