<template>
  <div class="about-view bg-white text-gray-900">
    <!-- Hero Section -->
    <section
      class="relative bg-[#2b7fff]/8 py-20 lg:py-32 px-6 overflow-hidden"
    >
      <div class="max-w-7xl mx-auto text-center relative z-10">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-[1.4]">
          អំពី <span class="text-[#2b7fff]">ពួកយើង</span>
        </h1>
        <p
          class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
        >
          យើងគឺជាក្រុមនិស្សិតដែលស្រលាញ់បច្ចេកវិទ្យា
          និងមានគោលបំណងចង់បង្កើតដំណោះស្រាយឌីជីថល
          ដើម្បីជួយសម្រួលដល់ការរស់នៅប្រចាំថ្ងៃនៅក្នុងសហគមន៍របស់យើង។
        </p>
      </div>
      <!-- Abstract Decoration -->
      <div
        class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#2b7fff]/20 rounded-full blur-3xl opacity-30"
      ></div>
    </section>

    <!-- Mission & Vision Section -->
    <section class="py-20 px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div class="order-2 lg:order-1">
          <div class="space-y-12">
            <div>
              <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
                <span class="w-2 h-10 bg-[#2b7fff] rounded-full"></span>
                បេសកកម្មរបស់យើង
              </h2>
              <p class="text-gray-600 leading-loose text-lg">
                ផ្តល់នូវបច្ចេកវិទ្យាដែលមានគុណភាពខ្ពស់ និងងាយស្រួលប្រើប្រាស់។
                យើងជឿជាក់ថាការរចនាដ៏ល្អ រួមផ្សំជាមួយកូដដែលមានប្រសិទ្ធភាព
                នឹងបង្កើតឱ្យមានការផ្លាស់ប្តូរជាវិជ្ជមាន។
              </p>
            </div>
            <div>
              <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
                <span class="w-2 h-10 bg-[#2b7fff] rounded-full"></span>
                ចក្ខុវិស័យ
              </h2>
              <p class="text-gray-600 leading-loose text-lg">
                ក្លាយជាក្រុមការងារឈានមុខគេក្នុងការបង្កើតគម្រោងដែលមានប្រយោជន៍
                ដែលជាមោទនភាពរបស់កូនខ្មែរក្នុងយុគសម័យឌីជីថល។
              </p>
            </div>
          </div>
        </div>
        <div class="order-1 lg:order-2">
          <div
            class="aspect-square bg-[#2b7fff]/10 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden"
          >
            <p class="text-[#2b7fff]/55 italic">[រូបភាពក្រុមការងារ]</p>
            <div
              class="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg"
            >
              <p class="text-[#2b7fff] font-bold">Innovation First</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Roles Section -->
    <section class="bg-gray-50 py-20 px-6">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-16">
          តួនាទីក្នុងក្រុមការងារ
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Role 1 -->
          <div
            class="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div
              class="w-14 h-14 bg-[#2b7fff]/10 rounded-2xl flex items-center justify-center text-[#2b7fff] mb-6"
            >
              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Web Developers</h3>
            <p class="text-[#2b7fff]/70 text-sm font-medium mb-4">
              Development
            </p>
            <p class="text-gray-600 leading-relaxed">
              បង្កើត និងអភិវឌ្ឍន៍ប្រព័ន្ធដោយប្រើប្រាស់ Vue.js និង Node.js។
            </p>
          </div>

          <!-- Role 2: QA (Your Role) -->
          <div
            class="bg-[#2b7fff] p-8 rounded-3xl shadow-xl transform lg:-translate-y-4 text-white"
          >
            <div
              class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6"
            >
              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2 text-white">QA Engineer</h3>
            <p class="text-[#dbe9ff] text-sm font-medium mb-4">
              Quality Assurance
            </p>
            <p class="text-[#f3f8ff] leading-relaxed">
              ធានាថាគ្រប់មុខងារទាំងអស់ដំណើរការបានយ៉ាងរលូន គ្មានកំហុស
              និងផ្តល់បទពិសោធន៍ល្អ។
            </p>
          </div>

          <!-- Role 3 -->
          <div
            class="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div
              class="w-14 h-14 bg-[#2b7fff]/10 rounded-2xl flex items-center justify-center text-[#2b7fff] mb-6"
            >
              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">DB Administrator</h3>
            <p class="text-[#2b7fff]/70 text-sm font-medium mb-4">
              Infrastructure
            </p>
            <p class="text-gray-600 leading-relaxed">
              គ្រប់គ្រងទិន្នន័យ PostgreSQL និងការបង្ហោះលើ AWS Cloud
              ឱ្យមានសុវត្ថិភាព។
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-20 text-center">
      <button
        class="bg-[#2b7fff] hover:bg-[#1f70ea] text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-lg shadow-[#2b7fff]/25"
      >
        ទាក់ទងមកយើង
      </button>
    </section>
  </div>
</template>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;700&display=swap");

.about-view {
  font-family: "Kantumruy Pro", sans-serif;
}
</style>
