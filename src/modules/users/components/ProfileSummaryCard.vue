<script setup>
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";

const { t } = useI18n({ useScope: "global" });

defineProps({
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
  uploadingImage: {
    type: Boolean,
    default: false,
  },
  hasSelectedImage: {
    type: Boolean,
    default: false,
  },
  selectedImageName: {
    type: String,
    default: "",
  },
});

defineEmits(["select-image", "save-image", "cancel-image"]);
</script>

<template>
  <section class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
    <div class="flex flex-col items-center text-center">
      <UserAvatar
        :name="userLabel"
        :src="avatarSrc"
        size-class="h-28 w-28 text-3xl ring-4 ring-(--color-primary-soft)"
      />

      <h2 class="mt-4 text-xl font-bold">{{ userLabel }}</h2>
      <p class="mt-1 text-sm text-(--color-muted)">{{ email }}</p>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <span
          class="rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-(--color-primary)"
        >
          {{ roleLabel }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          :class="emailVerificationToneClass"
        >
          <CheckCircleIcon v-if="emailVerified" class="h-4 w-4" />
          <XCircleIcon v-else class="h-4 w-4" />
          {{ emailVerificationLabel }}
        </span>
      </div>

      <label
        class="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--color-border) px-4 py-2 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
      >
        <CameraIcon class="h-5 w-5" />
        {{ uploadingImage ? t("profile.summary.uploading") : t("profile.summary.uploadImage") }}
        <input
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp"
          :disabled="uploadingImage"
          @change="$emit('select-image', $event)"
        />
      </label>

      <div
        v-if="hasSelectedImage"
        class="mt-4 w-full rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-3 text-left"
      >
        <p class="truncate text-sm font-semibold text-(--color-text)">
          {{ selectedImageName }}
        </p>
        <p class="mt-1 text-xs text-(--color-muted)">
          {{ t("profile.summary.previewSelected") }}
        </p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <AppButton
            type="button"
            size="sm"
            class="!rounded-lg"
            :disabled="uploadingImage"
            :loading="uploadingImage"
            @click="$emit('save-image')"
          >
            {{ t("profile.summary.saveImage") }}
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            class="!rounded-lg"
            :disabled="uploadingImage"
            @click="$emit('cancel-image')"
          >
            {{ t("common.cancel") }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
