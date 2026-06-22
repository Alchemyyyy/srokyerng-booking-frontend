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
  panelClass: {
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
        class="flex flex-col w-full rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-text) shadow-(--shadow-panel)"
        :class="panelClass || 'max-w-lg'"
        style="max-height: 90vh"
      >
        <!-- Header — always visible -->
        <header
          class="flex-shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4"
        >
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

        <!-- Body — scrollable -->
        <div class="flex-1 overflow-y-auto px-6 pb-2">
          <slot></slot>
        </div>

        <!-- Footer — always visible -->
        <footer
          v-if="$slots.footer"
          class="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-(--color-border)"
        >
          <slot name="footer"></slot>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
