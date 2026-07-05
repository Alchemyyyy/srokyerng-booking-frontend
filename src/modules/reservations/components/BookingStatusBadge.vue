<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  pulse: {
    type: Boolean,
    default: true,
  },
});

const statusStyleConfig = {
  pending: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-100/80",
    animate: true,
  },
  confirmed: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
    animate: true,
  },
  completed: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
    animate: false,
  },
  cancelled: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-100/80",
    animate: false,
  },
};

const sizeClasses = {
  sm: "text-[9px] px-2 py-0.5",
  md: "text-[10px] px-3 py-1.5",
  lg: "text-xs px-4 py-2",
};

const dotSizeClasses = {
  sm: "w-1 h-1",
  md: "w-1.5 h-1.5",
  lg: "w-2 h-2",
};

const config = computed(() => {
  const key = String(props.status).toLowerCase();
  const style = statusStyleConfig[key] || {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    animate: false,
  };
  return { ...style, label: statusLabel(props.status) };
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-xl border font-black uppercase tracking-widest shadow-sm',
      sizeClasses[size],
      config.badge,
    ]"
  >
    <span
      :class="[
        'rounded-full flex-shrink-0',
        dotSizeClasses[size],
        config.dot,
        config.animate && pulse ? 'animate-pulse' : '',
      ]"
    />
    {{ config.label }}
  </span>
</template>