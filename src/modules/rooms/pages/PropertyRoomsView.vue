<template>
  <div class="min-h-screen bg-[#061224] text-gray-200 font-sans antialiased">
    <nav
      class="border-b border-slate-800 bg-[#061224]/90 backdrop-blur sticky top-0 z-50"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5">
            <span class="text-amber-500 font-bold text-xl">SrokYerng</span>
            <span
              class="bg-amber-500 text-[#061224] text-[10px] font-extrabold px-1 rounded uppercase tracking-wider"
              >Booking</span
            >
          </div>
          <div
            class="hidden md:flex items-center gap-6 ml-10 text-sm font-medium text-gray-400"
          >
            <a href="#" class="hover:text-white transition">Home</a>
            <a href="#" class="text-white border-b-2 border-blue-500 pb-5 mt-5"
              >Properties</a
            >
            <a href="#" class="hover:text-white transition">About Us</a>
            <a href="#" class="hover:text-white transition">Contact</a>
          </div>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <button
            class="flex items-center gap-1 text-gray-300 hover:text-white"
          >
            <span>🌐 EN</span>
            <span class="text-xs">▼</span>
          </button>
          <button class="text-gray-300 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </button>
          <button class="text-gray-300 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav class="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <a href="#" class="hover:underline">Home</a>
        <span>&gt;</span>
        <a href="#" class="hover:underline">Properties</a>
        <span>&gt;</span>
        <span class="text-gray-200">Ocean View Resort</span>
      </nav>

      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl overflow-hidden mb-8"
      >
        <div
          class="md:col-span-2 relative aspect-[4/3] md:aspect-[16/10] bg-slate-800"
        >
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
            alt="Resort Main"
            class="w-full h-full object-cover"
          />
          <span
            class="absolute top-4 left-4 bg-amber-500/90 text-[#061224] text-[11px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1"
          >
            ⭐ Featured
          </span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-1 gap-3">
          <div class="aspect-[4/3] bg-slate-800 rounded-sm overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"
              alt="Room 1"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="aspect-[4/3] bg-slate-800 rounded-sm overflow-hidden relative"
          >
            <img
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80"
              alt="Restaurant"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="hidden md:block aspect-[4/3] bg-slate-800 rounded-sm overflow-hidden relative"
          >
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
              alt="Pool View"
              class="w-full h-full object-cover filter brightness-50"
            />
            <div
              class="absolute inset-0 flex items-center justify-center font-semibold text-lg text-white"
            >
              +18
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-10">
          <div>
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h1 class="text-3xl font-bold text-white tracking-tight">
                    Ocean View Resort
                  </h1>
                  <span
                    class="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/20"
                  >
                    ✓ Verified
                  </span>
                </div>
                <div
                  class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-2"
                >
                  <span
                    class="text-amber-400 font-medium flex items-center gap-1"
                    >★ 4.7
                    <span class="text-gray-400">(236 reviews)</span></span
                  >
                  <span>|</span>
                  <span class="flex items-center gap-1"
                    >🕒 250+ bookings this month</span
                  >
                </div>
                <div class="flex items-center gap-1 text-sm text-gray-400 mt-2">
                  📍
                  <span class="hover:text-white transition"
                    >Victory Beach, Sihanoukville, Cambodia</span
                  >
                  <a href="#" class="text-blue-400 text-xs ml-2 hover:underline"
                    >🗺️ View on map</a
                  >
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium px-4 py-2 rounded-lg transition text-white"
                >
                  📤 Share
                </button>
                <button
                  class="flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium px-4 py-2 rounded-lg transition text-white"
                >
                  ♡ Save
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-800/80 pt-6">
            <h2 class="text-lg font-semibold text-white mb-3">
              About this property
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-1 text-xs leading-relaxed text-gray-400">
                <p>
                  Ocean View Resort is a luxury beachfront resort offering
                  breathtaking sea views, modern amenities, and exceptional
                  service. Perfect for couples, families, and business travelers
                  looking for a relaxing and unforgettable stay.
                </p>
                <button
                  class="text-blue-400 mt-2 inline-flex items-center gap-0.5 hover:underline"
                >
                  Read more ▾
                </button>
              </div>

              <div
                class="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl"
              >
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">🏖️</span>
                  <div>
                    <h4 class="text-xs font-semibold text-white">Beachfront</h4>
                    <p class="text-[10px] text-gray-500">On the beach</p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">📶</span>
                  <div>
                    <h4 class="text-xs font-semibold text-white">Free Wi-Fi</h4>
                    <p class="text-[10px] text-gray-500">High speed</p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">🏊</span>
                  <div>
                    <h4 class="text-xs font-semibold text-white">
                      Swimming Pool
                    </h4>
                    <p class="text-[10px] text-gray-500">Outdoor pool</p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">🛩️</span>
                  <div>
                    <h4 class="text-xs font-semibold text-white">
                      Airport Shuttle
                    </h4>
                    <p class="text-[10px] text-gray-500">Additional charge</p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">🍽️</span>
                  <div>
                    <h4 class="text-xs font-semibold text-white">Restaurant</h4>
                    <p class="text-[10px] text-gray-500">On-site dining</p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">💪</span>
                  <div>
                    <h4 class="text-xs font-semibold text-white">
                      Fitness Center
                    </h4>
                    <p class="text-[10px] text-gray-500">Stay active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-white">Available Rooms</h2>

            <div class="space-y-3">
              <div
                v-for="room in rooms"
                :key="room.id"
                class="flex flex-col sm:flex-row bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700/60 transition"
              >
                <div
                  class="sm:w-48 h-32 sm:h-auto bg-slate-800 relative flex-shrink-0"
                >
                  <img
                    :src="room.image"
                    :alt="room.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div class="flex justify-between items-start gap-2">
                      <h3 class="font-semibold text-white text-sm sm:text-base">
                        {{ room.name }}
                      </h3>
                      <div class="text-right">
                        <span class="text-base sm:text-lg font-bold text-white"
                          >${{ room.price }}</span
                        >
                        <span class="text-[10px] text-gray-400 block"
                          >/ night</span
                        >
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-400"
                    >
                      <div class="flex items-center gap-1">
                        👥 {{ room.guests }} Guests
                      </div>
                      <div class="flex items-center gap-1">
                        🛏️ {{ room.beds }}
                      </div>
                      <div class="flex items-center gap-1">
                        📐 {{ room.size }}
                      </div>
                      <div class="flex items-center gap-1 text-emerald-400">
                        🛡️ {{ room.view }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex justify-between items-center pt-2 border-t border-slate-800/40"
                  >
                    <span
                      class="text-[11px] text-emerald-400 flex items-center gap-1"
                      >✓ {{ room.cancellation }}</span
                    >
                    <button
                      class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition shadow-sm"
                    >
                      View Room
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center pt-2">
              <button
                class="border border-slate-800 hover:border-slate-700 text-xs font-medium px-6 py-2 rounded-lg text-blue-400 transition"
              >
                View All Rooms (12)
              </button>
            </div>
          </div>

          <div class="border-t border-slate-800/80 pt-8 space-y-4">
            <h2 class="text-lg font-semibold text-white">Guest Reviews</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div
                class="bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl flex items-center md:flex-col justify-between md:justify-center gap-4 text-center"
              >
                <div>
                  <div class="text-4xl font-extrabold text-white">4.7</div>
                  <p class="text-xs text-gray-400 font-medium mt-1">
                    Excellent
                  </p>
                  <div class="text-amber-400 text-xs tracking-wider mt-1.5">
                    ★★★★★
                  </div>
                  <p class="text-[10px] text-gray-500 mt-1">
                    Based on 236 reviews
                  </p>
                </div>
                <div
                  class="flex-1 md:w-full space-y-1 text-[10px] text-gray-400"
                >
                  <div
                    v-for="(bar, index) in ratingsProgress"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <span class="w-2">{{ bar.stars }}</span>
                    <div
                      class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden"
                    >
                      <div
                        class="h-full bg-amber-500 rounded-full"
                        :style="{ width: bar.percentage + '%' }"
                      ></div>
                    </div>
                    <span class="w-6 text-right">{{ bar.percentage }}%</span>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="review in reviews"
                  :key="review.id"
                  class="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-between min-h-[140px]"
                >
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-2.5">
                      <div class="flex items-center gap-2">
                        <div
                          class="w-7 h-7 rounded-full bg-slate-700 overflow-hidden"
                        >
                          <img
                            :src="review.avatar"
                            alt="Avatar"
                            class="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 class="text-xs font-semibold text-white">
                            {{ review.author }}
                          </h4>
                          <p class="text-[9px] text-gray-500">
                            {{ review.date }}
                          </p>
                        </div>
                      </div>
                      <span
                        class="bg-emerald-500/10 text-emerald-400 font-bold text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20"
                      >
                        {{ review.score.toFixed(1) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed italic">
                      "{{ review.text }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <a
                href="#"
                class="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                >View all reviews ➔</a
              >
            </div>
          </div>
        </div>

        <div class="space-y-4 lg:sticky lg:top-20">
          <div
            class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-5"
          >
            <h3 class="text-lg font-bold text-white tracking-tight">
              Book your stay
            </h3>

            <div
              class="bg-blue-600/10 border border-blue-500/20 p-3 rounded-xl flex items-start gap-3"
            >
              <span class="text-blue-400 text-lg">🛡️</span>
              <div>
                <h4 class="text-xs font-semibold text-blue-400">
                  Best Price Guarantee
                </h4>
                <p class="text-[10px] text-gray-400 mt-0.5">
                  Found a lower price? We'll match it.
                </p>
              </div>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-gray-400 font-medium mb-1.5"
                  >Check-in</label
                >
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-500">📅</span>
                  <input
                    type="text"
                    value="May 20, 2025"
                    class="w-full bg-[#061224] border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-400 font-medium mb-1.5"
                  >Check-out</label
                >
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-500">📅</span>
                  <input
                    type="text"
                    value="May 22, 2025"
                    class="w-full bg-[#061224] border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-400 font-medium mb-1.5"
                  >Guests</label
                >
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-500">👥</span>
                  <select
                    class="w-full bg-[#061224] border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-gray-200 appearance-none focus:outline-none focus:border-blue-500 transition"
                  >
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                  </select>
                  <span
                    class="absolute right-3 top-3.5 text-[9px] text-gray-500"
                    >▼</span
                  >
                </div>
              </div>
            </div>

            <button
              class="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-xl transition shadow-md shadow-blue-600/10"
            >
              Check Availability
            </button>

            <div
              class="space-y-2.5 border-t border-slate-800/60 pt-4 text-xs text-gray-400"
            >
              <div class="flex items-start gap-2.5">
                <span class="text-sm">🕒</span>
                <div>
                  <h5 class="font-medium text-gray-300">Free cancellation</h5>
                  <p class="text-[10px] text-gray-500">
                    Up to 24 hours before check-in.
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="text-sm">🚫</span>
                <div>
                  <h5 class="font-medium text-gray-300">No hidden fees</h5>
                  <p class="text-[10px] text-gray-500">
                    What you see is what you pay
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="text-sm">🔒</span>
                <div>
                  <h5 class="font-medium text-gray-300">Secure payment</h5>
                  <p class="text-[10px] text-gray-500">
                    Your data is safe with us.
                  </p>
                </div>
              </div>
            </div>

            <div
              class="relative h-24 bg-slate-800 rounded-xl overflow-hidden border border-slate-800/80 mt-2 flex items-center justify-center group"
            >
              <div
                class="absolute inset-0 bg-cover bg-center filter opacity-40 blur-[1px]"
                style="
                  background-image: url(&quot;https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80&quot;);
                "
              ></div>
              <div class="relative text-center p-2 z-10">
                <p class="text-[10px] font-semibold text-white drop-shadow">
                  📍 Ocean View Resort
                </p>
                <button
                  class="mt-1.5 bg-[#061224]/90 backdrop-blur border border-slate-700 text-[9px] px-2 py-1 rounded text-blue-400 font-medium group-hover:bg-[#061224] transition"
                >
                  View on map
                </button>
              </div>
            </div>
          </div>

          <div
            class="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 space-y-3"
          >
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">
              Need help?
            </h4>
            <p class="text-[11px] text-gray-400">
              Our support team is here for you 24/7.
            </p>
            <div class="space-y-2 text-xs text-gray-300">
              <div class="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+85512345678" class="hover:underline text-gray-400"
                  >+855 12 345 678</a
                >
              </div>
              <div class="flex items-center gap-2">
                <span>✉️</span>
                <a
                  href="mailto:support@srokyerng.com"
                  class="hover:underline text-gray-400"
                  >support@srokyerng.com</a
                >
              </div>
              <div class="flex items-center gap-2">
                <span>💬</span>
                <button class="hover:underline text-gray-400 text-left">
                  Live chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer
      class="border-t border-slate-800/80 bg-[#061224] mt-20 text-xs text-gray-400"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-8"
      >
        <div class="col-span-2 space-y-3">
          <div class="flex items-center gap-1.5">
            <span class="text-amber-500 font-bold text-lg">SrokYerng</span>
            <span
              class="bg-amber-500 text-[#061224] text-[9px] font-extrabold px-1 rounded uppercase tracking-wider"
              >Booking</span
            >
          </div>
          <p class="text-[11px] text-gray-500 max-w-xs">
            Find and book the best places to stay in Cambodia.
          </p>
          <div class="flex items-center gap-3 pt-1 text-gray-500">
            <a href="#" class="hover:text-white text-sm">facebook</a>
            <a href="#" class="hover:text-white text-sm">instagram</a>
            <a href="#" class="hover:text-white text-sm">tiktok</a>
            <a href="#" class="hover:text-white text-sm">youtube</a>
          </div>
        </div>
        <div class="space-y-2">
          <h4
            class="font-semibold text-white uppercase text-[10px] tracking-wider mb-3"
          >
            Company
          </h4>
          <p><a href="#" class="hover:text-white transition">About Us</a></p>
          <p><a href="#" class="hover:text-white transition">Careers</a></p>
          <p><a href="#" class="hover:text-white transition">Press</a></p>
          <p><a href="#" class="hover:text-white transition">Contact Us</a></p>
        </div>
        <div class="space-y-2">
          <h4
            class="font-semibold text-white uppercase text-[10px] tracking-wider mb-3"
          >
            Support
          </h4>
          <p><a href="#" class="hover:text-white transition">Help Center</a></p>
          <p>
            <a href="#" class="hover:text-white transition"
              >Terms & Conditions</a
            >
          </p>
          <p>
            <a href="#" class="hover:text-white transition">Privacy Policy</a>
          </p>
          <p><a href="#" class="hover:text-white transition">FAQ</a></p>
        </div>
        <div class="space-y-2">
          <h4
            class="font-semibold text-white uppercase text-[10px] tracking-wider mb-3"
          >
            For Hosts
          </h4>
          <p>
            <a href="#" class="hover:text-white transition"
              >List Your Property</a
            >
          </p>
          <p><a href="#" class="hover:text-white transition">Host Guide</a></p>
          <p><a href="#" class="hover:text-white transition">Resources</a></p>
        </div>
      </div>

      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div class="w-full md:w-auto space-y-1">
          <h5 class="text-white font-medium">Subscribe to our newsletter</h5>
          <p class="text-[11px] text-gray-500">
            Get the best deals and travel tips straight to your inbox.
          </p>
          <div class="flex items-center gap-2 mt-2 max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              class="bg-[#050e1a] border border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full focus:outline-none focus:border-blue-500 text-gray-200"
            />
            <button
              class="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded-lg transition whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
        <div
          class="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/40"
        >
          <span
            class="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-gray-400 font-extrabold tracking-tight"
            >VISA</span
          >
          <span
            class="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-orange-400 font-extrabold tracking-tight"
            >MC</span
          >
          <span
            class="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-blue-400 font-extrabold tracking-tight"
            >ABA PAY</span
          >
          <span
            class="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-amber-500 font-extrabold tracking-tight"
            >KHQR</span
          >
        </div>
      </div>

      <div
        class="bg-[#040c17] text-center py-4 text-[10px] text-gray-600 border-t border-slate-900"
      >
        © 2026 SrokYerng Booking. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Mock Data matching your dynamic structural blocks
const rooms = ref([
  {
    id: 1,
    name: "Deluxe Sea View Room",
    guests: 2,
    beds: "1 King Bed",
    size: "32 m²",
    view: "Sea view",
    price: 85,
    cancellation: "Free cancellation",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Premier Ocean Suite",
    guests: 2,
    beds: "1 King Bed",
    size: "52 m²",
    view: "Ocean view",
    price: 120,
    cancellation: "Free cancellation",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Family Pool Villa",
    guests: 4,
    beds: "2 King Beds",
    size: "85 m²",
    view: "Pool view",
    price: 180,
    cancellation: "Free cancellation",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
  },
]);

const reviews = ref([
  {
    id: 1,
    author: "Sokchea P.",
    date: "May 20, 2025",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    score: 5.0,
    text: "Amazing stay! The view is incredible and the staff were very friendly.",
  },
  {
    id: 2,
    author: "Dara M.",
    date: "May 18, 2025",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    score: 5.0,
    text: "Perfect location and excellent service. Will definitely come back again!",
  },
]);

const ratingsProgress = ref([
  { stars: 5, percentage: 78 },
  { stars: 4, percentage: 15 },
  { stars: 3, percentage: 5 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
]);
</script>
