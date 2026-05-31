<script setup>
import { ref, computed } from "vue";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import { useI18n } from "vue-i18n";

// Checkout UI Flow Management Step Variable state tracker
const currentStep = ref(1);

// Competition Specification Core Form Submission Binding Object
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  notes: "",
  selectedAddons: [],
});

// Selected Room Configuration Properties Context Object mock values
const room = ref({
  name: "Deluxe Premium Suite",
  price: 40,
  nights: 3,
  selectedCheckIn: "Jun 12, 2026",
  selectedCheckOut: "Jun 15, 2026",
});

// Curated Elite Premium Upgrades Dataset Allocation System array matrix
const availableAddons = ref([
  {
    id: "airport",
    name: "Private Luxury Airport Chauffeur",
    description: "Direct terminal pickup via Mercedes-Benz S-Class",
    price: 45,
  },
  {
    id: "lounge",
    name: "VIP Horizon Executive Lounge Pass",
    description: "All-day fine dining access and open bar privileges",
    price: 60,
  },
  {
    id: "spa",
    name: "Traditional Khmer Wellness Spa Massage",
    description: "90-minute aromatherapy deep tissue suite reservation",
    price: 35,
  },
]);

// Helper Methods tracking internal structural evaluation variables values
const toggleAddon = (addon) => {
  const index = form.value.selectedAddons.indexOf(addon.id);
  if (index === -1) {
    form.value.selectedAddons.push(addon.id);
  } else {
    form.value.selectedAddons.splice(index, 1);
  }
};

const getAddonName = (id) =>
  availableAddons.value.find((a) => a.id === id)?.name || "";
const getAddonPrice = (id) =>
  availableAddons.value.find((a) => a.id === id)?.price || 0;

// Dynamic computed loop calculating real-time gross invoice financial aggregates
const calculatedTotal = computed(() => {
  const roomCost = room.value.price * room.value.nights;
  const addonsCost = form.value.selectedAddons.reduce(
    (acc, id) => acc + getAddonPrice(id),
    0,
  );
  return roomCost + addonsCost;
});

const submitBooking = () => {
  alert(
    `Reservation authorized and created successfully for a total amount of $${calculatedTotal.value}.00!`,
  );
};
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f2942] antialiased font-sans selection:bg-[#1062b3]/10 selection:text-[#1062b3]"
  >
    <PublicNavbar class="mb-80" />

    <div class="flex-grow max-w-7xl w-full mx-auto px-6 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div class="lg:col-span-7 space-y-8">
          <div
            v-if="currentStep === 1"
            class="space-y-6 bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-100/50"
          >
            <div>
              <h2 class="text-xl font-black text-[#0f2942] tracking-tight">
                Primary Guest Information
              </h2>
              <p class="text-xs text-slate-400 font-medium mt-0.5">
                Please ensure name matches official passport records.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label
                  class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                  >First Name</label
                >
                <input
                  v-model="form.firstName"
                  type="text"
                  placeholder="John"
                  class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-semibold bg-slate-50/40 transition"
                />
              </div>
              <div class="space-y-1.5">
                <label
                  class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                  >Last Name</label
                >
                <input
                  v-model="form.lastName"
                  type="text"
                  placeholder="Doe"
                  class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-semibold bg-slate-50/40 transition"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label
                class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                >Email Address</label
              >
              <input
                v-model="form.email"
                type="email"
                placeholder="johndoe@luxury.com"
                class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-semibold bg-slate-50/40 transition"
              />
            </div>

            <div class="space-y-1.5">
              <label
                class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                >Special Requests / Preferences</label
              >
              <textarea
                v-model="form.notes"
                rows="4"
                placeholder="High floor preferred, dietary restrictions, etc..."
                class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-semibold bg-slate-50/40 transition resize-none"
              ></textarea>
            </div>

            <button
              @click="currentStep = 2"
              class="w-full bg-[#0f2942] hover:bg-[#153452] text-white font-black text-xs py-4 rounded-xl shadow-lg transition tracking-widest uppercase cursor-pointer"
            >
              Continue to Premium Upgrades
            </button>
          </div>

          <div
            v-if="currentStep === 2"
            class="space-y-6 bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-100/50"
          >
            <div>
              <h2 class="text-xl font-black text-[#0f2942] tracking-tight">
                Enhance Your Experience
              </h2>
              <p class="text-xs text-slate-400 font-medium mt-0.5">
                Curated luxury services tailormade for your upcoming stay.
              </p>
            </div>

            <div class="space-y-3">
              <div
                v-for="addon in availableAddons"
                :key="addon.id"
                @click="toggleAddon(addon)"
                :class="[
                  'p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300',
                  form.selectedAddons.includes(addon.id)
                    ? 'border-[#1062b3] bg-blue-50/30'
                    : 'border-slate-200/70 hover:border-slate-300 bg-white',
                ]"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-5 h-5 rounded-md border flex items-center justify-center transition"
                    :class="
                      form.selectedAddons.includes(addon.id)
                        ? 'bg-[#1062b3] border-[#1062b3] text-white'
                        : 'border-slate-300 bg-white'
                    "
                  >
                    <span
                      v-if="form.selectedAddons.includes(addon.id)"
                      class="text-[10px] font-bold"
                      >✓</span
                    >
                  </div>
                  <div>
                    <p class="text-xs font-black text-[#0f2942]">
                      {{ addon.name }}
                    </p>
                    <p class="text-[11px] text-slate-400 font-medium mt-0.5">
                      {{ addon.description }}
                    </p>
                  </div>
                </div>
                <span
                  class="text-xs font-black text-[#1062b3] bg-blue-50 border border-blue-100/60 px-2.5 py-1 rounded-lg"
                >
                  +${{ addon.price }}
                </span>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="currentStep = 1"
                class="w-1/3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-black text-xs py-4 rounded-xl transition tracking-widest uppercase cursor-pointer"
              >
                Back
              </button>
              <button
                @click="currentStep = 3"
                class="w-2/3 bg-[#0f2942] hover:bg-[#153452] text-white font-black text-xs py-4 rounded-xl shadow-lg transition tracking-widest uppercase cursor-pointer"
              >
                Proceed to Payment
              </button>
            </div>
          </div>

          <div
            v-if="currentStep === 3"
            class="space-y-6 bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-100/50"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-black text-[#0f2942] tracking-tight">
                  Payment Verification
                </h2>
                <p class="text-xs text-slate-400 font-medium mt-0.5">
                  Fully encrypted SSL bank transaction token layer.
                </p>
              </div>
              <span
                class="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md tracking-wider"
              >
                🔒 AES-256 Secure
              </span>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label
                  class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                  >Cardholder Name</label
                >
                <input
                  type="text"
                  placeholder="JOHN DOE"
                  class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-bold bg-slate-50/40 transition tracking-wide uppercase"
                />
              </div>

              <div class="space-y-1.5">
                <label
                  class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                  >Credit Card Number</label
                >
                <div class="relative">
                  <input
                    type="text"
                    placeholder="•••• •••• •••• 4921"
                    class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-bold bg-slate-50/40 transition tracking-widest"
                  />
                  <span
                    class="absolute right-4 top-3 text-[10px] font-black text-slate-400"
                    >VISA</span
                  >
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label
                    class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                    >Expiration (MM/YY)</label
                  >
                  <input
                    type="text"
                    placeholder="12/28"
                    class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-bold bg-slate-50/40 transition text-center tracking-widest"
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                    >Security CVV Code</label
                  >
                  <input
                    type="password"
                    placeholder="•••"
                    class="w-full border border-slate-200 focus:border-[#1062b3] rounded-xl px-4 py-3 text-xs outline-none font-bold bg-slate-50/40 transition text-center tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="currentStep = 2"
                class="w-1/3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-black text-xs py-4 rounded-xl transition tracking-widest uppercase cursor-pointer"
              >
                Back
              </button>
              <button
                @click="submitBooking"
                class="w-2/3 bg-gradient-to-r from-[#0b427b] to-[#1062b3] hover:from-[#1062b3] hover:to-blue-500 text-white font-black text-xs py-4 rounded-xl shadow-xl shadow-blue-600/10 transition-all tracking-widest uppercase cursor-pointer"
              >
                Authorize & Pay ${{ calculatedTotal }}
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 lg:sticky lg:top-24">
          <div
            class="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/60 p-6 md:p-8 space-y-6 relative overflow-hidden"
          >
            <div
              class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1062b3] to-blue-500"
            ></div>

            <div>
              <span
                class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-0.5"
                >Your Selected Space</span
              >
              <h3 class="text-lg font-black text-[#0f2942] tracking-tight">
                {{ room.name }}
              </h3>
              <p class="text-xs text-slate-400 font-semibold mt-0.5">
                Angkor Palace Luxury Hotel Resort
              </p>
            </div>

            <div
              class="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-xs font-bold"
            >
              <div>
                <span
                  class="block text-[9px] text-slate-400 uppercase tracking-widest font-black mb-0.5"
                  >Check-In</span
                >
                <span class="text-[#0f2942]">{{ room.selectedCheckIn }}</span>
              </div>
              <div class="border-l border-slate-100 pl-4">
                <span
                  class="block text-[9px] text-slate-400 uppercase tracking-widest font-black mb-0.5"
                  >Check-Out</span
                >
                <span class="text-[#0f2942]">{{ room.selectedCheckOut }}</span>
              </div>
            </div>

            <div class="space-y-3 text-xs font-semibold text-slate-500">
              <div class="flex justify-between items-center">
                <span
                  >Room Tariff Total (${{ room.price }} ×
                  {{ room.nights }} Nights)</span
                >
                <span class="text-[#0f2942] font-black"
                  >${{ room.price * room.nights }}.00</span
                >
              </div>

              <div
                v-if="form.selectedAddons.length > 0"
                class="space-y-2 pt-1 border-t border-slate-50"
              >
                <p
                  class="text-[9px] font-black uppercase text-slate-400 tracking-widest"
                >
                  Selected Add-ons
                </p>
                <div
                  v-for="addonId in form.selectedAddons"
                  :key="addonId"
                  class="flex justify-between items-center text-[11px]"
                >
                  <span class="text-slate-400"
                    >· {{ getAddonName(addonId) }}</span
                  >
                  <span class="text-[#0f2942] font-bold"
                    >+${{ getAddonPrice(addonId) }}.00</span
                  >
                </div>
              </div>

              <div
                class="flex justify-between items-center pt-3 border-t border-slate-100 text-slate-700 font-black"
              >
                <span class="text-xs text-[#0f2942] uppercase tracking-wider"
                  >Gross Aggregate Total</span
                >
                <span class="text-3xl text-[#1062b3] font-black tracking-tight"
                  >${{ calculatedTotal }}.00</span
                >
              </div>
            </div>

            <div
              class="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100 text-[11px] text-slate-400 font-medium leading-normal"
            >
              <span class="text-emerald-500 text-sm">✓</span>
              <p>
                Cancellation is completely free until 48 hours before scheduled
                arrival window execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PublicFooter class="mt-auto" />
  </div>
</template>
