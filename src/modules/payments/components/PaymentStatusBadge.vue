<script setup>
/**
 * PaymentStatusBadge
 * Displays a styled badge for a payment status value.
 *
 * Props:
 *   status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'cancelled'
 *   size: 'sm' | 'md' (default 'md')
 */
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) =>
      ["pending", "uploaded", "verified", "rejected", "cancelled"].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md"].includes(v),
  },
});

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    colorClass: "badge--pending",
    dot: true,
  },
  uploaded: {
    label: "Proof Uploaded",
    colorClass: "badge--uploaded",
    dot: true,
  },
  verified: {
    label: "Verified",
    colorClass: "badge--verified",
    dot: false,
  },
  rejected: {
    label: "Rejected",
    colorClass: "badge--rejected",
    dot: false,
  },
  cancelled: {
    label: "Cancelled",
    colorClass: "badge--cancelled",
    dot: false,
  },
};

const config = computed(
  () =>
    STATUS_CONFIG[props.status] ?? {
      label: props.status,
      colorClass: "badge--pending",
      dot: false,
    },
);
</script>

<script>
import { computed } from "vue";
export default { name: "PaymentStatusBadge" };
</script>

<template>
  <span
    class="badge"
    :class="[config.colorClass, `badge--${size}`]"
    :aria-label="`Payment status: ${config.label}`"
  >
    <span v-if="config.dot" class="badge__dot" aria-hidden="true" />
    {{ config.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  border-radius: 999px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border: 1px solid transparent;
}

.badge--sm {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
}

.badge--md {
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
}

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* Pending — amber */
.badge--pending {
  background: rgba(239, 159, 39, 0.12);
  color: #c97c0a;
  border-color: rgba(239, 159, 39, 0.3);
}

/* Uploaded — blue */
.badge--uploaded {
  background: rgba(55, 138, 221, 0.1);
  color: var(--color-primary, #378add);
  border-color: rgba(55, 138, 221, 0.25);
}

/* Verified — green */
.badge--verified {
  background: rgba(29, 158, 117, 0.1);
  color: #1d9e75;
  border-color: rgba(29, 158, 117, 0.25);
}

/* Rejected — red */
.badge--rejected {
  background: rgba(220, 53, 69, 0.1);
  color: var(--color-danger, #dc3545);
  border-color: rgba(220, 53, 69, 0.25);
}

/* Cancelled — muted */
.badge--cancelled {
  background: var(--color-surface, #f8f9fa);
  color: var(--color-muted, #6c757d);
  border-color: var(--color-border, #dee2e6);
}
</style>
