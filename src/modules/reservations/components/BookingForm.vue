<script setup>
import { ref, computed } from "vue";
import AppButton from "@/shared/components/AppButton.vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  room: { type: Object, default: null },
  checkInDate: { type: String, default: "" },
  checkOutDate: { type: String, default: "" },
  guestCount: { type: Number, default: 2 },
  isSubmitting: { type: Boolean, default: false },
  calculatedTotal: { type: Number, default: 0 },
});

const emit = defineEmits([
  "submit",
  "update:checkInDate",
  "update:checkOutDate",
]);

const currentStep = ref(1);
const formErrors = ref({});

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  notes: "",
  selectedAddons: [],
});

const steps = [
  { id: 1, label: "Guest Info" },
  { id: 2, label: "Payment" },
];

const validateStep1 = () => {
  const errors = {};
  if (!form.value.firstName.trim())
    errors.firstName = "First name is required.";
  if (!form.value.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.value.email.trim()) errors.email = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.value.email))
    errors.email = "Invalid email format.";
  if (!props.checkInDate) errors.checkIn = "Check-in date is required.";
  if (!props.checkOutDate) errors.checkOut = "Check-out date is required.";
  if (
    props.checkInDate &&
    props.checkOutDate &&
    props.checkInDate >= props.checkOutDate
  )
    errors.checkOut = "Check-out must be after check-in.";
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};
const goToStep2 = () => {
  if (validateStep1()) currentStep.value = 2;
};

const handleSubmit = () => {
  emit("submit", {
    ...form.value,
    special_request: form.value.notes || "",
  });
};
</script>
<template>
  <div class="space-y-6">
    <!-- Step Indicator -->
    <div class="flex items-center gap-0">
      <template v-for="(step, i) in steps" :key="step.id">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
            :class="
              currentStep >= step.id
                ? 'bg-(--color-primary) text-white shadow-lg'
                : 'bg-(--color-surface-soft) text-(--color-muted) border border-(--color-border)'
            "
          >
            <span v-if="currentStep > step.id">✓</span>
            <span v-else>{{ step.id }}</span>
          </div>
          <span
            class="text-xs font-bold hidden sm:block transition-all"
            :class="
              currentStep >= step.id
                ? 'text-(--color-text)'
                : 'text-(--color-muted)'
            "
          >
            {{ step.label }}
          </span>
        </div>
        <div
          v-if="i < steps.length - 1"
          class="flex-1 h-px mx-3 transition-all duration-500"
          :class="
            currentStep > step.id
              ? 'bg-(--color-primary)'
              : 'bg-(--color-border)'
          "
        />
      </template>
    </div>

    <!-- Step 1: Guest Info -->
    <Transition name="slide-fade" mode="out-in">
      <div
        v-if="currentStep === 1"
        key="step1"
        class="bg-(--color-surface) border border-(--color-border) rounded-3xl p-8 shadow-sm"
      >
        <div class="mb-6">
          <h2 class="text-lg font-black text-(--color-text)">
            Guest Information
          </h2>
          <p class="text-xs text-(--color-muted) mt-0.5">
            Enter the primary guest details for this reservation.
          </p>
        </div>

        <div class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label
                class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
                >First Name</label
              >
              <input
                v-model="form.firstName"
                type="text"
                placeholder="John"
                class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-semibold text-(--color-text) transition-all"
                :class="formErrors.firstName ? 'border-rose-400' : ''"
              />
              <span
                v-if="formErrors.firstName"
                class="text-xs text-rose-500 font-medium"
                >{{ formErrors.firstName }}</span
              >
            </div>
            <div class="space-y-1.5">
              <label
                class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
                >Last Name</label
              >
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Doe"
                class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-semibold text-(--color-text) transition-all"
                :class="formErrors.lastName ? 'border-rose-400' : ''"
              />
              <span
                v-if="formErrors.lastName"
                class="text-xs text-rose-500 font-medium"
                >{{ formErrors.lastName }}</span
              >
            </div>
          </div>

          <div class="space-y-1.5">
            <label
              class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
              >Email Address</label
            >
            <input
              v-model="form.email"
              type="email"
              placeholder="john@example.com"
              class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-semibold text-(--color-text) transition-all"
              :class="formErrors.email ? 'border-rose-400' : ''"
            />
            <span
              v-if="formErrors.email"
              class="text-xs text-rose-500 font-medium"
              >{{ formErrors.email }}</span
            >
          </div>

          <div class="space-y-1.5">
            <label
              class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
            >
              Special Requests
              <span class="normal-case text-(--color-muted) font-normal"
                >(optional)</span
              >
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Any special requests or preferences..."
              class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-semibold text-(--color-text) transition-all resize-none"
            />
          </div>

          <div
            v-if="formErrors.checkIn || formErrors.checkOut"
            class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 space-y-1"
          >
            <p v-if="formErrors.checkIn">⚠ {{ formErrors.checkIn }}</p>
            <p v-if="formErrors.checkOut">⚠ {{ formErrors.checkOut }}</p>
          </div>
        </div>

        <AppButton
          variant="primary"
          size="lg"
          class="mt-8 w-full"
          @click="goToStep2"
        >
          Continue to Payment →
        </AppButton>
      </div>
    </Transition>

    <!-- Step 2: Payment -->
    <Transition name="slide-fade" mode="out-in">
      <div
        v-if="currentStep === 2"
        key="step2"
        class="bg-(--color-surface) border border-(--color-border) rounded-3xl p-8 shadow-sm"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-black text-(--color-text)">
              Payment Details
            </h2>
            <p class="text-xs text-(--color-muted) mt-0.5">
              Your transaction is secured with SSL encryption.
            </p>
          </div>
          <span
            class="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full tracking-wider"
          >
            🔒 Secure
          </span>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label
              class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
              >Cardholder Name</label
            >
            <input
              type="text"
              placeholder="JOHN DOE"
              class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-bold text-(--color-text) uppercase tracking-wide transition-all"
            />
          </div>
          <div class="space-y-1.5">
            <label
              class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
              >Card Number</label
            >
            <div class="relative">
              <input
                type="text"
                placeholder="•••• •••• •••• ••••"
                class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-bold text-(--color-text) tracking-widest transition-all"
              />
              <span
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-(--color-muted)"
                >VISA</span
              >
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label
                class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
                >Expiry</label
              >
              <input
                type="text"
                placeholder="MM / YY"
                class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-bold text-(--color-text) text-center tracking-widest transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="block text-[11px] font-bold text-(--color-muted) uppercase tracking-wider"
                >CVV</label
              >
              <input
                type="password"
                placeholder="•••"
                class="w-full border border-(--color-border) bg-(--color-surface-soft) focus:border-(--color-primary) rounded-xl px-4 py-3 text-sm outline-none font-bold text-(--color-text) text-center tracking-widest transition-all"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <AppButton
            variant="secondary"
            size="lg"
            class="w-1/3"
            @click="currentStep = 1"
          >
            <ArrowLeftIcon class="w-4 h-4" /> Back
          </AppButton>
          <AppButton
            variant="primary"
            size="lg"
            class="w-2/3"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            Pay ${{ calculatedTotal }}
          </AppButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
