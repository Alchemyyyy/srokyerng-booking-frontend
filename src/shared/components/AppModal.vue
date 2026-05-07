<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

defineEmits(["close"]);

const displayTitle = computed(() => props.title || t("components.modalTitle"));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('close')"
    >
      <section
        class="w-full max-w-lg rounded-lg border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text) shadow-(--shadow-panel)"
      >
        <header class="mb-5 flex items-start justify-between gap-4">
          <h2 class="m-0 text-xl font-semibold">{{ displayTitle }}</h2>
          <button
            type="button"
            class="rounded-sm px-2 py-1 text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)"
            :aria-label="t('common.cancel')"
            @click="$emit('close')"
          >
            ×
          </button>
        </header>
        <slot></slot>
        <footer v-if="$slots.footer" class="mt-6 flex justify-end gap-3">
          <slot name="footer"></slot>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
