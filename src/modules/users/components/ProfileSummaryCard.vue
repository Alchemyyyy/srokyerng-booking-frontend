<script setup>
import { computed, ref } from "vue";
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
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

defineEmits(["select-image", "save-image", "cancel-image", "edit-image"]);

const resolvedAvatarSrc = computed(() => resolveAssetUrl(props.avatarSrc));
const canPreviewAvatar = computed(() => Boolean(resolvedAvatarSrc.value));
</script>

<template>
  <section class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
    <div class="flex flex-col items-center text-center">
      <div class="relative">
        <button
          type="button"
          class="rounded-full outline-none transition hover:scale-[1.02] focus:ring-4 focus:ring-(--color-focus-ring)"
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
          class="absolute bottom-1 right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-(--color-surface) bg-(--color-primary) text-white shadow-(--shadow-card) transition hover:bg-(--color-primary-strong)"
          :title="uploadingImage ? t('profile.summary.uploading') : t('profile.summary.uploadImage')"
        >
          <CameraIcon class="h-5 w-5" />
          <input
            type="file"
            class="sr-only"
            accept="image/jpeg,image/png,image/webp"
            :disabled="uploadingImage"
            @change="$emit('select-image', $event)"
          />
        </label>
      </div>

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

      <p class="mt-4 text-xs text-(--color-muted)">
        {{ uploadingImage ? t("profile.summary.uploading") : t("profile.summary.uploadImage") }}
      </p>

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
            variant="secondary"
            size="sm"
            class="!rounded-lg"
            :disabled="uploadingImage"
            @click="$emit('edit-image')"
          >
            {{ t("profile.summary.cropImage") }}
          </AppButton>
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
        </div>
        <div class="mt-2">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            class="w-full !rounded-lg"
            :disabled="uploadingImage"
            @click="$emit('cancel-image')"
          >
            {{ t("common.cancel") }}
          </AppButton>
        </div>
      </div>
    </div>

    <AppModal
      :open="imagePreviewOpen"
      :title="t('profile.summary.viewImage')"
      panel-class="max-w-3xl"
      @close="imagePreviewOpen = false"
    >
      <div class="overflow-hidden rounded-lg bg-black">
        <img
          :src="resolvedAvatarSrc"
          :alt="userLabel"
          class="max-h-[70vh] w-full object-contain"
        />
      </div>
    </AppModal>
  </section>
</template>
