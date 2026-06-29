<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  StarIcon,
  ChatBubbleLeftEllipsisIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  ClockIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarSolid } from "@heroicons/vue/24/solid";

const props = defineProps({
  review: { type: Object, required: true },
});
const { t } = useI18n({ useScope: 'global' })
const emit = defineEmits(["reply", "delete-reply"]);

const isReplying = ref(false);
const isEditing = ref(false);
const replyText = ref("");
const submitting = ref(false);

const hasReply = computed(() => !!props.review.ownerReply);
const ratingInt = computed(() => Math.round(props.review.rating));

const ratingMeta = computed(() => {
  const map = {
    5: { label: t("owner.reviews.card.ratings.excellent"), color: "#16a34a" },
    4: { label: t("owner.reviews.card.ratings.veryGood"), color: "#65a30d" },
    3: { label: t("owner.reviews.card.ratings.good"), color: "#ca8a04" },
    2: { label: t("owner.reviews.card.ratings.fair"), color: "#ea580c" },
    1: { label: t("owner.reviews.card.ratings.poor"), color: "#dc2626" },
  };
  return map[ratingInt.value] || { label: "", color: "#64748b" };
});

const gradients = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#30cfd0,#330867)",
];
const avatarBg = computed(() => {
  const n = props.review.guestName || "";
  return gradients[n.charCodeAt(0) % gradients.length];
});
const initials = computed(() => {
  const words = (props.review.guestName || "?")
    .trim()
    .split(" ")
    .filter(Boolean);
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();
});

const openReply = () => {
  replyText.value = "";
  isReplying.value = true;
  isEditing.value = false;
};
const openEdit = () => {
  replyText.value = props.review.ownerReply || "";
  isEditing.value = true;
  isReplying.value = false;
};
const cancel = () => {
  isReplying.value = false;
  isEditing.value = false;
  replyText.value = "";
};

const submit = async () => {
  const text = replyText.value.trim();
  if (!text || submitting.value) return;
  submitting.value = true;
  try {
    await emit("reply", { reviewId: props.review.id, reply: text });
    cancel();
  } finally {
    submitting.value = false;
  }
};

const deleteReply = () => {
  if (confirm(t("owner.reviews.card.confirmRemove")))
    emit("delete-reply", props.review.id);
};
</script>

<template>
  <div class="orc">
    <!-- Header: guest info + rating -->
    <div class="orc-head">
      <div class="guest-row">
        <div class="avatar" :style="review.guestAvatar ? {} : { background: avatarBg }">
          <img
            v-if="review.guestAvatar"
            :src="review.guestAvatar"
            :alt="review.guestName"
            class="avatar-img"
            @error="e => e.target.style.display = 'none'"
          />
          <span v-else>{{ initials }}</span>
        </div>
        <div>
          <p class="guest-name">{{ review.guestName }}</p>
          <div class="stay-meta">
            <BuildingOffice2Icon class="w-3.5 h-3.5 flex-shrink-0" />
            <span>{{ review.propertyName }}</span>
            <span class="dot">·</span>
            <span>{{ review.roomName }}</span>
            <template v-if="review.checkIn">
              <span class="dot">·</span>
              <span>{{ review.checkIn }} – {{ review.checkOut }}</span>
            </template>
          </div>
        </div>
      </div>
      <div
        class="rating-pill"
        :style="{
          background: ratingMeta.color + '18',
          color: ratingMeta.color,
          borderColor: ratingMeta.color + '40',
        }"
      >
        <StarSolid class="w-3.5 h-3.5" />
        <span class="font-extrabold text-sm">{{
          review.rating.toFixed(1)
        }}</span>
        <span class="text-xs font-semibold">{{ ratingMeta.label }}</span>
      </div>
    </div>

    <!-- Stars + date -->
    <div class="stars-row">
      <template v-for="i in 5">
        <StarSolid
          v-if="i <= ratingInt"
          :key="`solid-${i}`"
          class="w-4 h-4 text-amber-400"
        />
        <StarIcon v-else :key="`empty-${i}`" class="w-4 h-4 text-slate-200" />
      </template>
      <span class="review-date">{{ review.date }}</span>
    </div>

    <!-- Review text -->
    <p v-if="review.title" class="review-title">{{ review.title }}</p>
    <p class="review-body">{{ review.content }}</p>

    <div class="divider" />

    <!-- Existing reply (not editing) -->
    <div v-if="hasReply && !isEditing" class="reply-block">
      <div class="reply-block-head">
        <span class="reply-tag">
          <ChatBubbleLeftEllipsisIcon class="w-3.5 h-3.5" />
          {{ t("owner.reviews.card.yourReply") }}
        </span>
        <span class="reply-date">{{ review.repliedAt }}</span>
      </div>
      <p class="reply-text">{{ review.ownerReply }}</p>
      <div class="reply-btns">
        <button class="btn-edit" @click="openEdit">
          <PencilSquareIcon class="w-3.5 h-3.5" />{{ t("owner.reviews.card.edit") }}
        </button>
        <button class="btn-del" @click="deleteReply">
          <TrashIcon class="w-3.5 h-3.5" />{{ t("owner.reviews.card.remove") }}
        </button>
      </div>
    </div>

    <!-- Compose / Edit area -->
    <div v-if="isReplying || isEditing" class="compose">
      <p class="compose-label">
        {{ isEditing ? t("owner.reviews.card.editReply") : t("owner.reviews.card.replyToThis") }}
      </p>
      <textarea
        v-model="replyText"
        class="compose-ta"
        rows="4"
        :placeholder="
          isEditing
            ? 'Update your reply…'
            : 'Thank the guest, address their comments…'
        "
        autofocus
      />
      <div class="compose-actions">
        <button class="btn-cancel" @click="cancel">
          <XMarkIcon class="w-3.5 h-3.5" /> Cancel
        </button>
        <button
          class="btn-post"
          :disabled="!replyText.trim() || submitting"
          @click="submit"
        >
          <CheckIcon class="w-3.5 h-3.5" />
          {{
            submitting ? t("owner.reviews.card.posting") : isEditing ? t("owner.reviews.card.saveChanges") : t("owner.reviews.card.postReply")
          }}
        </button>
      </div>
    </div>

    <!-- {{ t("owner.reviews.card.noReplyYet") }} row -->
    <div v-if="!hasReply && !isReplying" class="no-reply-row">
      <span class="no-reply-hint"
        ><ClockIcon class="w-3.5 h-3.5 inline mr-1" />{{ t("owner.reviews.card.noReplyYet") }}</span
      >
      <button class="btn-reply" @click="openReply">
        <ChatBubbleLeftEllipsisIcon class="w-4 h-4" />
        {{ t("owner.reviews.card.replyToGuest") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.orc {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 18px;
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.orc:hover {
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.07);
  transform: translateY(-1px);
}

/* Head */
.orc-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.guest-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.guest-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text, #0f172a);
  margin: 0 0 4px;
}
.stay-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--color-muted, #64748b);
  flex-wrap: wrap;
}
.dot {
  opacity: 0.4;
}
.rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 99px;
  border: 1px solid;
  flex-shrink: 0;
}

/* Stars */
.stars-row {
  display: flex;
  align-items: center;
  gap: 3px;
}
.review-date {
  font-size: 0.78rem;
  color: var(--color-muted, #94a3b8);
  margin-left: auto;
}

/* Text */
.review-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text, #0f172a);
  margin: 0;
}
.review-body {
  font-size: 0.88rem;
  color: var(--color-muted, #475569);
  line-height: 1.65;
  margin: 0;
}
.divider {
  height: 1px;
  background: var(--color-border, #e2e8f0);
}

/* Existing reply */
.reply-block {
  background: var(--color-surface-soft, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-left: 3px solid #2563eb;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reply-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.reply-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 3px 10px;
  border-radius: 99px;
}
.reply-date {
  font-size: 0.75rem;
  color: var(--color-muted, #94a3b8);
}
.reply-text {
  font-size: 0.87rem;
  color: var(--color-text, #334155);
  line-height: 1.6;
  margin: 0;
}
.reply-btns {
  display: flex;
  gap: 10px;
}
.btn-edit,
.btn-del {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-edit {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}
.btn-edit:hover {
  background: #dbeafe;
}
.btn-del {
  color: #dc2626;
  border-color: #fecaca;
  background: #fff5f5;
}
.btn-del:hover {
  background: #fee2e2;
}

/* Compose */
.compose {
  background: var(--color-surface-soft, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.compose-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #0f172a);
  margin: 0;
}
.compose-ta {
  width: 100%;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  font-size: 0.87rem;
  font-family: inherit;
  line-height: 1.6;
  background: var(--color-surface, #fff);
  color: var(--color-text, #0f172a);
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
}
.compose-ta:focus {
  border-color: #2563eb;
}
.compose-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  background: var(--color-surface, #fff);
  color: var(--color-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover {
  background: var(--color-input, #f1f5f9);
}
.btn-post {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 20px;
  font-size: 0.82rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-post:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-post:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* No reply */
.no-reply-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.no-reply-hint {
  font-size: 0.78rem;
  color: var(--color-muted, #94a3b8);
  display: inline-flex;
  align-items: center;
}
.btn-reply {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1.5px solid #2563eb;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-reply:hover {
  background: #2563eb;
  color: #fff;
}

@media (max-width: 640px) {
  .orc {
    padding: 18px;
  }
  .orc-head {
    flex-direction: column;
  }
}
</style>