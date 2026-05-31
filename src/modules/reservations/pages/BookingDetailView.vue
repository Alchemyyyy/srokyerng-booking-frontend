<template>
  <div
    class="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased pb-24 font-sans selection:bg-[#1062b3]/10 selection:text-[#1062b3]"
  >
    <!-- 1. Premium Sticky Breadcrumb Track Header -->
    <header
      class="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-40"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs font-semibold"
      >
        <div class="flex items-center gap-2.5 text-slate-400">
          <a href="#" class="hover:text-[#1062b3] transition duration-300"
            >Dashboard</a
          >
          <span class="text-slate-300 text-[10px] font-light">/</span>
          <a href="#" class="hover:text-[#1062b3] transition duration-300"
            >History</a
          >
          <span class="text-slate-300 text-[10px] font-light">/</span>
          <span class="text-[#0f2942] font-bold tracking-tight"
            >RES-{{ booking.id }}</span
          >
        </div>

        <div class="flex items-center gap-3">
          <button
            class="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-bold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-3.5 h-3.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-14.326 0C3.768 7.44 3 8.375 3 9.456V15.75a2.25 2.25 0 0 0 2.25 2.25h1.091"
              />
            </svg>
            Print PDF
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 mt-8">
      <!-- 2. Main Detail Split Concierge Frame Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- LEFT WORKSPACE AREA: Reservation Meta Itinerary Details (7 Columns) -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Master Summary Header Information Panel Block -->
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5"
              >
                <span
                  class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
                ></span>
                {{ booking.status }} & Active
              </span>
              <span class="text-xs text-slate-400 font-bold"
                >Booked on {{ booking.createdAt }}</span
              >
            </div>

            <h1
              class="text-3xl md:text-4xl font-black tracking-tight text-[#0f2942]"
            >
              Your Stay at {{ booking.propertyName }}
            </h1>
            <p
              class="text-xs text-slate-500 font-medium leading-relaxed max-w-xl"
            >
              {{ booking.propertyAddress }}
            </p>
          </div>

          <!-- Chronological Dual Check-In/Out Node Panel Cards Grid -->
          <div
            class="grid grid-cols-2 gap-4 bg-white border border-slate-200/60 p-5 rounded-[24px] shadow-xl shadow-slate-100/50"
          >
            <div class="space-y-1">
              <span
                class="text-[9px] font-black uppercase text-slate-400 tracking-widest block"
                >📅 Scheduled Arrival</span
              >
              <p class="text-sm font-black text-[#0f2942]">
                {{ booking.checkInDate }}
              </p>
              <p class="text-[11px] text-slate-400 font-medium">
                Standard Check-In from 2:00 PM
              </p>
            </div>
            <div class="space-y-1 border-l border-slate-100 pl-5">
              <span
                class="text-[9px] font-black uppercase text-slate-400 tracking-widest block"
                >📅 Scheduled Departure</span
              >
              <p class="text-sm font-black text-[#0f2942]">
                {{ booking.checkOutDate }}
              </p>
              <p class="text-[11px] text-slate-400 font-medium">
                Standard Check-Out by 11:00 AM
              </p>
            </div>
          </div>

          <!-- Selected Accommodation Summary Bento Card Module -->
          <div
            class="bg-white border border-slate-200/60 rounded-[28px] overflow-hidden shadow-xl shadow-slate-100/50 flex flex-col sm:flex-row"
          >
            <div
              class="w-full sm:w-44 h-44 sm:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0"
            >
              <img
                :src="booking.roomImage"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6 flex flex-col justify-between space-y-4">
              <div class="space-y-1">
                <span
                  class="text-[9px] font-black uppercase text-[#1062b3] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md tracking-wider"
                >
                  Assigned Space
                </span>
                <h3 class="text-base font-black text-[#0f2942] pt-1">
                  {{ booking.roomName }}
                </h3>
                <p class="text-xs text-slate-400 font-semibold">
                  {{ booking.roomSpecs }} · {{ booking.nightsCount }} Nights
                  Total Stay
                </p>
              </div>

              <!-- Compact horizontal line configuration list specs -->
              <div
                class="flex items-center gap-4 text-[11px] text-slate-500 font-bold border-t border-slate-50 pt-3"
              >
                <span class="flex items-center gap-1"
                  >👥 {{ booking.guestsCount }} Guests Registered</span
                >
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span class="flex items-center gap-1">🛌 Non-Smoking Zone</span>
              </div>
            </div>
          </div>

          <!-- Ledger Accounting Financial Receipt Breakdown Statement Box -->
          <div class="space-y-3.5">
            <h2
              class="text-xs font-black text-[#0f2942] uppercase tracking-widest border-l-2 border-[#1062b3] pl-3"
            >
              Itemized Financial Summary
            </h2>

            <div
              class="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-100/50 space-y-3.5 text-xs font-semibold text-slate-500"
            >
              <div class="flex justify-between items-center">
                <span
                  >Room Base Tariff Rate (${{ booking.pricePerNight }} ×
                  {{ booking.nightsCount }} nights)</span
                >
                <span class="text-[#0f2942] font-black"
                  >${{ booking.basePrice }}</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span>Localized Hotel Luxury Tourism Tax (10%)</span>
                <span class="text-[#0f2942] font-black"
                  >${{ booking.taxAmount }}</span
                >
              </div>
              <div
                class="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-100 pb-3.5"
              >
                <span>Resort Access & Cleaning Maintenance Fees</span>
                <span
                  class="text-emerald-600 font-black uppercase bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded"
                  >Waived</span
                >
              </div>
              <div
                class="flex justify-between items-center pt-1 text-slate-700 font-black"
              >
                <span class="text-xs text-[#0f2942] uppercase tracking-wider"
                  >Gross Total Amount Invoiced</span
                >
                <span class="text-2xl text-[#1062b3] font-black tracking-tight"
                  >${{ booking.totalPrice }}</span
                >
              </div>

              <div
                class="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between text-[11px] mt-2"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-5 bg-slate-900 rounded flex items-center justify-center text-white text-[8px] font-black"
                  >
                    VISA
                  </div>
                  <div>
                    <p class="text-slate-600 font-bold">
                      Settled via Electronic Transaction
                    </p>
                    <p class="text-slate-400 font-medium">
                      Authorization reference ID: #AUTH-892410
                    </p>
                  </div>
                </div>
                <span
                  class="text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-[10px]"
                  >Paid</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT WORKSPACE AREA: Dynamic Boarding Pass / QR Code Widget Area (5 Columns) -->
        <div class="lg:col-span-5 lg:sticky lg:top-24">
          <!-- Concept Premium Digital Flight/Hotel Pass Styling Framework Container -->
          <div
            class="bg-gradient-to-b from-[#0f2942] to-[#1a3857] text-white rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden relative border border-slate-800"
          >
            <!-- Structural upper pass details panel -->
            <div class="p-6 md:p-8 space-y-6 relative z-10">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-[9px] font-black uppercase text-slate-300 tracking-widest"
                  >
                    Digital Boarding Voucher
                  </p>
                  <p class="text-lg font-black tracking-tight mt-0.5">
                    Angkor Palace Club
                  </p>
                </div>
                <!-- Dynamic Pulsing Live Indicator Node badge -->
                <span
                  class="bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase text-emerald-400"
                >
                  Ready to Check-in
                </span>
              </div>

              <!-- High Contrast Key Ticket Metrics Metadata Matrix Info blocks -->
              <div
                class="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 border-t border-white/10 text-xs font-bold"
              >
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Registered Guest</span
                  >
                  <span class="text-sm font-black tracking-wide">{{
                    booking.guestName
                  }}</span>
                </div>
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Confirmation Ref</span
                  >
                  <span
                    class="text-sm font-black tracking-wide text-[#1062b3] bg-white px-2 py-0.5 rounded-lg inline-block shadow-sm"
                  >
                    {{ booking.id }}
                  </span>
                </div>
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Room Assignment</span
                  >
                  <span class="text-sm font-black tracking-wide text-slate-200"
                    >Room {{ booking.assignedRoomNumber }}</span
                  >
                </div>
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Access Allocation</span
                  >
                  <span class="text-sm font-black tracking-wide text-slate-200"
                    >VIP Club Lounge Access</span
                  >
                </div>
              </div>
            </div>

            <!-- Authentic Stylized Cinema Card Ticket Tear/Dent Divider Line with punchout side holes -->
            <div
              class="relative h-4 bg-transparent flex items-center justify-between px-0 overflow-hidden select-none pointer-events-none"
            >
              <div
                class="w-4 h-8 bg-[#f8fafc] rounded-full transform translate-x-[-8px]"
              ></div>
              <div
                class="w-full border-b-2 border-dashed border-white/10 px-4"
              ></div>
              <div
                class="w-4 h-8 bg-[#f8fafc] rounded-full transform translate-x([8px])"
              ></div>
            </div>

            <!-- Lower Ticket Boarding Pass segment holding Scannable Core Verification QR Block matrix -->
            <div
              class="p-6 md:p-8 bg-white text-slate-800 text-center space-y-4 flex flex-col items-center justify-center"
            >
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >
                Present QR Code to Reception Counter upon Arrival
              </p>

              <!-- Mock QR Code Core Frame Box Segment Wrapper Container Grid Component -->
              <div
                class="w-36 h-36 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl shadow-inner relative group hover:border-[#1062b3] transition duration-300"
              >
                <img
                  :src="booking.qrCodeImage"
                  alt="Digital Reservation Identity Concierge Access QR Vector Token Key"
                  class="w-full h-full object-contain"
                />
              </div>

              <!-- Dynamic Action triggers beneath scannable area block -->
              <div class="w-full pt-2">
                <button
                  class="w-full bg-[#0f2942] hover:bg-[#1a3857] text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-slate-900/10 transition-all uppercase tracking-widest cursor-pointer"
                >
                  Add to Apple Wallet
                </button>
              </div>
            </div>
          </div>

          <!-- Immediate Customer Support Context Help Link Segment Anchor node triggers -->
          <div
            class="mt-4 flex items-center justify-between px-4 text-[11px] font-bold text-slate-400"
          >
            <span
              class="cursor-pointer hover:text-[#1062b3] transition flex items-center gap-1"
            >
              💬 Message Hotel Concierge
            </span>
            <span class="cursor-pointer hover:text-rose-600 transition">
              Request Late Check-In
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Competition-Grade Production Level Mock Dataset Configuration Ref mapping matrix
const booking = ref({
  id: "RES-940218",
  status: "Confirmed",
  createdAt: "May 24, 2026",
  guestName: "Alex Vance",
  propertyName: "Angkor Palace Luxury Hotel Resort",
  propertyAddress:
    "National Road 6, Svay Dangkum, Siem Reap, Kingdom of Cambodia",
  checkInDate: "Jun 12, 2026",
  checkOutDate: "Jun 15, 2026",
  nightsCount: 3,
  roomName: "Deluxe Premium Suite",
  roomSpecs: "California King Bed · 28 m² Cozy Area · High-Speed WiFi",
  roomImage:
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=500&q=80",
  guestsCount: 2,
  assignedRoomNumber: "412 (Floor 4)",
  pricePerNight: 40,
  basePrice: 120,
  taxAmount: 12,
  totalPrice: 132,
  qrCodeImage:
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RES-940218_ALEX_VANCE",
});
</script>
