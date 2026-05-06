<template>
  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container text-center">
      <h1 class="display-4 fw-bold mb-4">
        អំពី <span class="text-purple">ពួកយើង</span>
      </h1>
      <p class="lead text-muted mx-auto" style="max-width: 800px">
        យើងគឺជាក្រុមនិស្សិតដែលស្រលាញ់បច្ចេកវិទ្យា
        និងមានគោលបំណងចង់បង្កើតដំណោះស្រាយឌីជីថល
        ដើម្បីជួយសម្រួលដល់ការរស់នៅប្រចាំថ្ងៃនៅក្នុងសហគមន៍របស់យើង។
      </p>
    </div>
  </section>

  <!-- Mission & Vision Section -->
  <section class="py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6 mb-4 mb-lg-0">
          <div class="pe-lg-5">
            <h2 class="fw-bold mb-4 border-start border-4 border-purple ps-3">
              បេសកកម្មរបស់យើង
            </h2>
            <p class="text-secondary mb-5">
              ផ្តល់នូវបច្ចេកវិទ្យាដែលមានគុណភាពខ្ពស់ និងងាយស្រួលប្រើប្រាស់។
              យើងជឿជាក់ថាការរចនាដ៏ល្អ រួមផ្សំជាមួយកូដដែលមានប្រសិទ្ធភាព
              នឹងបង្កើតឱ្យមានការផ្លាស់ប្តូរជាវិជ្ជមាន។
            </p>
            <h2 class="fw-bold mb-4 border-start border-4 border-purple ps-3">
              ចក្ខុវិស័យ
            </h2>
            <p class="text-secondary">
              ក្លាយជាក្រុមការងារឈានមុខគេក្នុងការបង្កើតគម្រោងដែលមានប្រយោជន៍
              ដែលជាមោទនភាពរបស់កូនខ្មែរក្នុងយុគសម័យឌីជីថល។
            </p>
          </div>
        </div>
        <div class="col-lg-6">
          <div
            class="bg-light rounded-5 d-flex align-items-center justify-center text-center"
            style="height: 400px; border: 2px dashed #dee2e6"
          >
            <p class="text-muted m-auto italic">
              [រូបភាពក្រុមការងារ ឬ រូបភាពតំណាង]
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Team/Roles Section -->
  <section class="bg-light py-5">
    <div class="container">
      <h2 class="text-center fw-bold mb-5">តួនាទីក្នុងក្រុមការងារ</h2>
      <div class="row g-4">
        <!-- Role 1 -->
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm p-4">
            <div class="mb-3 text-purple">
              <i class="bi bi-code-slash fs-1"></i>
              <!-- Use Bootstrap Icons -->
            </div>
            <h4 class="fw-bold">អ្នកអភិវឌ្ឍន៍ (Dev)</h4>
            <p class="text-muted small mb-3">Core Development</p>
            <p>
              ទទួលបន្ទុកលើការសរសេរកូដ និងបង្កើតមុខងារកម្មវិធីដោយប្រើប្រាស់
              Vue.js និង Node.js។
            </p>
          </div>
        </div>

        <!-- Role 2: Your Role (Highlighted) -->
        <div class="col-md-4">
          <div class="card h-100 border-purple shadow p-4 border-2">
            <div class="mb-3 text-purple text-center">
              <i class="bi bi-patch-check-fill fs-1"></i>
            </div>
            <h4 class="fw-bold text-center">អ្នកត្រួតពិនិត្យគុណភាព (QA)</h4>
            <p class="text-purple small mb-3 text-center">Quality Assurance</p>
            <p>
              ធានាថាគ្រប់មុខងារទាំងអស់ដំណើរការបានយ៉ាងរលូន គ្មានកំហុស
              និងផ្តល់បទពិសោធន៍ល្អដល់អ្នកប្រើប្រាស់។
            </p>
          </div>
        </div>

        <!-- Role 3 -->
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm p-4">
            <div class="mb-3 text-purple">
              <i class="bi bi-database-fill fs-1"></i>
            </div>
            <h4 class="fw-bold">អ្នកគ្រប់គ្រងទិន្នន័យ</h4>
            <p class="text-muted small mb-3">Database & Infrastructure</p>
            <p>
              រៀបចំរចនាសម្ព័ន្ធទិន្នន័យ PostgreSQL និងគ្រប់គ្រងការបង្ហោះលើ AWS
              Cloud។
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mt-5">
        <a href="#" class="btn btn-purple shadow-sm">ទាក់ទងមកយើង</a>
      </div>
    </div>
  </section>
</template>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;700&display=swap");

body {
  font-family: "Kantumruy Pro", sans-serif;
  line-height: 1.8; /* Critical for Khmer characters */
}

.text-purple {
  color: #6f42c1;
}
.bg-purple {
  background-color: #6f42c1;
}
.btn-purple {
  background-color: #6f42c1;
  color: white;
  border-radius: 8px;
  padding: 10px 25px;
}
.btn-purple:hover {
  background-color: #59359a;
  color: white;
}
.hero-section {
  background-color: #f8f4ff;
  padding: 100px 0;
}
</style>
