<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import { getBankName, getBankLogo } from "@/modules/payments/utils/bankBranding";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  room: { type: Object, default: null },
  checkInDate: { type: String, default: "" },
  checkOutDate: { type: String, default: "" },
  guestCount: { type: Number, default: 2 },
  isSubmitting: { type: Boolean, default: false },
  calculatedTotal: { type: Number, default: 0 },
  paymentAccounts: { type: Array, default: () => [] },
  loadingAccounts: { type: Boolean, default: false },
  selectedAccountId: { type: [Number, String, null], default: null },
});

const emit = defineEmits([
  "submit",
  "update:checkInDate",
  "update:checkOutDate",
  "update:selectedAccountId",
  "date-errors",
]);

const formErrors = ref({});
const paymentAccountError = ref("");

const selectAccount = (accountId) => {
  emit("update:selectedAccountId", accountId);
  paymentAccountError.value = "";
};

// Logos are hotlinked to third-party sites (same source used on the owner
// side), so track any that fail to load and fall back to plain initials
// instead of a broken-image icon.
const failedLogoIds = ref(new Set());
const handleLogoError = (methodId) => {
  failedLogoIds.value = new Set(failedLogoIds.value).add(methodId);
};
const bankInitials = (methodName) => (methodName || "?").slice(0, 2).toUpperCase();

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  notes: "",
  floorPreference: "",
});

const floorPreferenceLabels = computed(() => ({
  ground: t("components.bookingForm.groundFloor"),
  low: t("components.bookingForm.lowerFloor"),
  high: t("components.bookingForm.higherFloor"),
}));

const validateGuestInfo = () => {
  const errors = {};
  if (!form.value.firstName.trim())
    errors.firstName = t("components.bookingForm.errors.firstNameRequired");
  if (!form.value.lastName.trim())
    errors.lastName = t("components.bookingForm.errors.lastNameRequired");
  if (!form.value.email.trim())
    errors.email = t("components.bookingForm.errors.emailRequired");
  else if (!/\S+@\S+\.\S+/.test(form.value.email))
    errors.email = t("components.bookingForm.errors.emailInvalid");
  if (!props.checkInDate)
    errors.checkIn = t("components.bookingForm.errors.checkInRequired");
  if (!props.checkOutDate)
    errors.checkOut = t("components.bookingForm.errors.checkOutRequired");
  if (
    props.checkInDate &&
    props.checkOutDate &&
    props.checkInDate >= props.checkOutDate
  )
    errors.checkOut = t("components.bookingForm.errors.checkOutAfterCheckIn");
  formErrors.value = errors;
  emit("date-errors", {
    checkIn: errors.checkIn || "",
    checkOut: errors.checkOut || "",
  });
  return Object.keys(errors).length === 0;
};
const handleSubmit = () => {
  if (!validateGuestInfo()) return;
  if (props.paymentAccounts.length > 0 && !props.selectedAccountId) {
    paymentAccountError.value = t(
      "components.bookingForm.errors.paymentMethodRequired",
    );
    return;
  }
  const preferenceLabel = floorPreferenceLabels.value[form.value.floorPreference];
  const special_request = [
    preferenceLabel
      ? t("components.bookingForm.floorPreferenceNote", { label: preferenceLabel })
      : "",
    form.value.notes || "",
  ]
    .filter(Boolean)
    .join(" ");

  emit("submit", {
    ...form.value,
    special_request,
  });
};
</script>
<template>
  <div>
    <div class="mb-4">
      <h2 class="text-base font-black text-(--color-text)">
        {{ t("components.bookingForm.heading") }}
      </h2>
      <p class="text-xs text-(--color-muted) mt-0.5">
        {{ t("components.bookingForm.subheading") }}
      </p>
    </div>

    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label
            class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
            >{{ t("components.bookingForm.firstNameLabel") }} <span class="text-rose-500">*</span></label
          >
          <input
            v-model="form.firstName"
            type="text"
            :placeholder="t('components.bookingForm.firstNamePlaceholder')"
            class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-3.5 py-2.5 text-sm outline-none font-semibold text-(--color-text) transition-all"
            :class="formErrors.firstName ? 'border-rose-400' : ''"
          />
          <span
            v-if="formErrors.firstName"
            class="text-xs text-rose-500 font-medium"
            >{{ formErrors.firstName }}</span
          >
        </div>
        <div class="space-y-1">
          <label
            class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
            >{{ t("components.bookingForm.lastNameLabel") }} <span class="text-rose-500">*</span></label
          >
          <input
            v-model="form.lastName"
            type="text"
            :placeholder="t('components.bookingForm.lastNamePlaceholder')"
            class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-3.5 py-2.5 text-sm outline-none font-semibold text-(--color-text) transition-all"
            :class="formErrors.lastName ? 'border-rose-400' : ''"
          />
          <span
            v-if="formErrors.lastName"
            class="text-xs text-rose-500 font-medium"
            >{{ formErrors.lastName }}</span
          >
        </div>
      </div>

      <div class="space-y-1">
        <label
          class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
          >{{ t("components.bookingForm.emailLabel") }} <span class="text-rose-500">*</span></label
        >
        <input
          v-model="form.email"
          type="email"
          :placeholder="t('components.bookingForm.emailPlaceholder')"
          class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-3.5 py-2.5 text-sm outline-none font-semibold text-(--color-text) transition-all"
          :class="formErrors.email ? 'border-rose-400' : ''"
        />
        <span
          v-if="formErrors.email"
          class="text-xs text-rose-500 font-medium"
          >{{ formErrors.email }}</span
        >
      </div>

      <div class="space-y-1">
        <label
          class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
        >
          {{ t("components.bookingForm.floorPreferenceLabel") }}
          <span class="normal-case text-(--color-muted) font-normal"
            >{{ t("components.bookingForm.optionalNotGuaranteed") }}</span
          >
        </label>
        <select
          v-model="form.floorPreference"
          class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-3.5 py-2.5 text-sm outline-none font-semibold text-(--color-text) transition-all"
        >
          <option value="">{{ t("components.bookingForm.noPreference") }}</option>
          <option value="ground">{{ t("components.bookingForm.groundFloor") }}</option>
          <option value="low">{{ t("components.bookingForm.lowerFloor") }}</option>
          <option value="high">{{ t("components.bookingForm.higherFloor") }}</option>
        </select>
      </div>

      <div class="space-y-1">
        <label
          class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
        >
          {{ t("components.bookingForm.specialRequestsLabel") }}
          <span class="normal-case text-(--color-muted) font-normal"
            >{{ t("components.bookingForm.optional") }}</span
          >
        </label>
        <textarea
          v-model="form.notes"
          rows="2"
          :placeholder="t('components.bookingForm.specialRequestsPlaceholder')"
          class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-3.5 py-2.5 text-sm outline-none font-semibold text-(--color-text) transition-all resize-none"
        />
      </div>

      <div class="space-y-1.5">
        <label
          class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
          >{{ t("components.bookingForm.paymentMethodLabel") }} <span class="text-rose-500">*</span></label
        >

        <div v-if="loadingAccounts" class="text-sm text-(--color-muted) py-2">
          {{ t("components.bookingForm.loadingPaymentMethods") }}
        </div>

        <div
          v-else-if="paymentAccounts.length === 0"
          class="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-2.5 text-sm text-(--color-muted)"
        >
          {{ t("components.bookingForm.noPaymentMethods") }}
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            v-for="account in paymentAccounts"
            :key="account.id"
            type="button"
            @click="selectAccount(account.id)"
            class="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all"
            :class="
              selectedAccountId === account.id
                ? 'border-(--color-primary) bg-(--color-primary-soft)'
                : 'border-(--color-border) bg-(--color-surface-soft) hover:border-(--color-primary)/50'
            "
          >
            <div class="flex items-center gap-3 min-w-0">
              <img
                v-if="!failedLogoIds.has(account.payment_method_id)"
                :src="getBankLogo(account.payment_method_id)"
                :alt="getBankName(account.payment_method_id)"
                class="w-9 h-9 rounded-full object-contain bg-white border border-(--color-border) shrink-0"
                @error="handleLogoError(account.payment_method_id)"
              />
              <div
                v-else
                class="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-(--color-muted) shrink-0"
              >
                {{ bankInitials(account.payment_method_name) }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-(--color-text) truncate">
                  {{ account.payment_method_name }}
                </p>
                <p class="text-xs text-(--color-muted) truncate">
                  {{ account.account_name }}
                </p>
              </div>
            </div>
            <div
              class="w-4 h-4 rounded-full border-2 shrink-0"
              :class="
                selectedAccountId === account.id
                  ? 'border-(--color-primary) bg-(--color-primary)'
                  : 'border-(--color-border)'
              "
            ></div>
          </button>
        </div>

        <span v-if="paymentAccountError" class="text-xs text-rose-500 font-medium block">
          {{ paymentAccountError }}
        </span>
      </div>
    </div>

    <AppButton
      variant="primary"
      size="lg"
      class="mt-5 w-full"
      :loading="isSubmitting"
      @click="handleSubmit"
    >
      {{ t("components.bookingForm.confirmBooking") }}
    </AppButton>
  </div>
</template>
