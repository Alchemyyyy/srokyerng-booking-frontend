<template>
  <div class="reviews-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <img
        class="hero-bg"
        src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2070&auto=format&fit=crop"
        alt="Hotel"
      />
      <div class="hero-content">
        <nav class="breadcrumb">
          <span>Home</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Stays</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Grand Palace Hotel</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="breadcrumb-active">Reviews</span>
        </nav>

        <h1>Guest Reviews &amp;<br />Experience</h1>
        <p class="hero-desc">Real stories from real guests who have stayed and loved their experience.</p>

        <div class="hero-actions">
          <div class="hero-rating">
            <span class="star-gold">★</span>
            <span class="big-rating">4.9</span>
            <span class="rating-label">Exceptional</span>
            <span class="dot">·</span>
            <span class="review-count">1,284 reviews</span>
          </div>
          <router-link to="reservations/new/review" class="write-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Write a Review
          </router-link>
        </div>
      </div>
    </section>

    <!-- FILTER TABS -->
    <div class="filter-bar-wrap">
      <div class="filter-bar">
        <div class="tabs-scroll">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>
        <div class="sort-select-wrap">
          <select v-model="sortBy" class="sort-select">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-content">

      <!-- LEFT: Stats + Reviews -->
      <div class="reviews-col">

        <!-- Stats Row -->
        <div class="stats-row">

          <!-- Overall Rating -->
          <div class="stat-card overall-card">
            <p class="stat-label">Overall Rating</p>
            <div class="big-score">4.9<span>/5</span></div>
            <div class="stars-display">
              <span v-for="i in 5" :key="i" class="star-display" :class="{ half: i === 5 }">★</span>
            </div>
            <p class="score-label">Exceptional</p>
            <p class="based-on">Based on 1,284 reviews</p>
          </div>

          <!-- Rating Breakdown -->
          <div class="stat-card breakdown-card">
            <p class="stat-label">Rating Breakdown</p>
            <div class="breakdown-list">
              <div class="breakdown-row" v-for="bar in ratingBars" :key="bar.label">
                <span class="bar-label">{{ bar.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: bar.pct + '%' }"></div>
                </div>
                <span class="bar-pct">{{ bar.pct }}%</span>
              </div>
            </div>
          </div>

          <!-- What Guests Loved -->
          <div class="stat-card loved-card">
            <p class="stat-label">What guests loved most</p>
            <div class="loved-list">
              <div class="loved-row" v-for="item in lovedItems" :key="item.label">
                <span class="loved-icon" v-html="item.icon"></span>
                <span class="loved-name">{{ item.label }}</span>
                <span class="loved-score">{{ item.score }}</span>
              </div>
            </div>
            <a href="#" class="see-all">See all categories →</a>
          </div>

        </div>

        <!-- Search + Filters -->
        <div class="search-filter-row">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search reviews..." />
          </div>
          <select v-model="filterRating" class="filter-select">
            <option value="">All Ratings</option>
            <option v-for="r in [5,4,3,2,1]" :key="r" :value="r">{{ r }} Stars</option>
          </select>
          <select v-model="filterTraveler" class="filter-select">
            <option value="">All Travelers</option>
            <option>Solo Traveler</option>
            <option>Couple</option>
            <option>Family</option>
            <option>Business</option>
          </select>
          <select v-model="filterLang" class="filter-select">
            <option value="">All Languages</option>
            <option>English</option>
            <option>French</option>
            <option>Korean</option>
          </select>
          <button class="filter-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </button>
        </div>

        <!-- Review List -->
        <div class="review-list">
          <ReviewCard
            v-for="review in filteredReviews"
            :key="review.id"
            :review="review"
          />
        </div>

        <!-- Load More -->
        <div class="load-more-wrap">
          <button class="load-more-btn" @click="loadMore">
            Load More Reviews
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

      </div>

      <!-- RIGHT: Sidebar -->
      <div class="sidebar">

        <!-- Share CTA -->
        <div class="sidebar-card share-card">
          <div class="share-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <h4>Share Your Experience</h4>
          <p>Have you stayed at Grand Palace Hotel? We'd love to hear about your experience and help other travelers.</p>
          <router-link to="reservations/new/review" class="write-btn-sidebar">Write a Review</router-link>
        </div>

        <!-- Guidelines -->
        <div class="sidebar-card">
          <h4>Review Guidelines</h4>
          <ul class="guide-list">
            <li v-for="g in guidelines" :key="g.title">
              <div class="guide-dot" v-html="g.icon"></div>
              <div>
                <strong>{{ g.title }}</strong>
                <p>{{ g.desc }}</p>
              </div>
            </li>
          </ul>
          <a href="#" class="learn-more">Learn more →</a>
        </div>

        <!-- Need Help -->
        <div class="sidebar-card help-card">
          <div class="help-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <strong>Need Help?</strong>
            <p>Our guest support team is here to assist you 24/7</p>
            <a href="#" class="contact-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Contact Support
            </a>
          </div>
        </div>

      </div>

    </div>

    <!-- BOTTOM CTA BANNER -->
    <div class="cta-banner">
      <div class="cta-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div class="cta-text">
        <h3>Join thousands of happy travelers</h3>
        <p>Book your next stay and create your own memorable experience.</p>
      </div>
      <a href="#" class="cta-btn">Explore Stays</a>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ReviewCard from "../components/ReviewCard.vue";
import { getPropertyReviews } from "../services/reviewService.js";

const activeTab = ref("all");
const sortBy = ref("recent");
const searchQuery = ref("");
const filterRating = ref("");
const filterTraveler = ref("");
const filterLang = ref("");
const reviews = ref([]);
const loading = ref(false);

const tabs = [
  { key: "all", label: "All Reviews (1,284)" },
  { key: "photos", label: "Photos (356)" },
  { key: "comments", label: "With Comments (982)" },
  { key: "families", label: "Families (420)" },
  { key: "couples", label: "Couples (612)" },
  { key: "solo", label: "Solo Travelers (252)" },
];

const ratingBars = [
  { label: "5 Stars", pct: 89 },
  { label: "4 Stars", pct: 8 },
  { label: "3 Stars", pct: 2 },
  { label: "2 Stars", pct: 1 },
  { label: "1 Star", pct: 0 },
];

const lovedItems = [
  { label: "Cleanliness", score: "4.9", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
  { label: "Service", score: "4.9", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
  { label: "Location", score: "4.8", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` },
  { label: "Value for money", score: "4.7", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>` },
  { label: "Comfort", score: "4.8", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
];

const guidelines = [
  {
    title: "Be honest and respectful",
    desc: "Share your genuine experience",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`,
  },
  {
    title: "Focus on your stay",
    desc: "Comment on the property, service, and amenities",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  },
  {
    title: "Avoid personal details",
    desc: "Do not share personal information about yourself or others",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
  {
    title: "Photos are welcome",
    desc: "Add photos to help others see what to expect",
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  },
];

// Sample data (will be replaced by API)
const sampleReviews = [
  {
    id: 1,
    user: { name: "Jessica Parker" },
    country: "United States",
    travelerType: "Couple",
    stayInfo: "2 nights · May 2024",
    rating: 5.0,
    title: "Absolutely unforgettable experience!",
    comment: "From the moment we arrived, everything was perfect. The staff went above and beyond to make our stay special. The room was clean, spacious, and the view was breathtaking.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Cleanliness", "Service", "Location", "Comfort", "Value"],
    photo: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=150&fit=crop",
    photoCount: 4,
  },
  {
    id: 2,
    user: { name: "Daniel Kim" },
    country: "South Korea",
    travelerType: "Family",
    stayInfo: "3 nights · May 2024",
    rating: 5.0,
    title: "Perfect for family vacation",
    comment: "Our kids loved the pool and the breakfast buffet was amazing. Great location and very convenient. We will come back for sure!",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Cleanliness", "Family Friendly", "Service", "Location"],
    photo: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=150&fit=crop",
    photoCount: 6,
  },
  {
    id: 3,
    user: { name: "Sophie Martin" },
    country: "France",
    travelerType: "Solo Traveler",
    stayInfo: "1 night · April 2024",
    rating: 4.8,
    title: "Beautiful hotel with great atmosphere",
    comment: "The design and ambiance are stunning. My room was incredibly comfortable and the service was top-notch.",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Cleanliness", "Service", "Comfort", "Design"],
    photo: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=150&fit=crop",
    photoCount: 3,
  },
];

const filteredReviews = computed(() => {
  let list = reviews.value.length ? reviews.value : sampleReviews;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(r =>
      r.comment?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q)
    );
  }
  if (filterRating.value) {
    list = list.filter(r => Math.floor(r.rating) === Number(filterRating.value));
  }
  if (filterTraveler.value) {
    list = list.filter(r => r.travelerType === filterTraveler.value);
  }
  return list;
});

const loadMore = () => {
  // Fetch more reviews from API
};

onMounted(async () => {
  try {
    // const data = await getPropertyReviews(propertyId);
    // reviews.value = data;
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
* { box-sizing: border-box; }

.reviews-page {
  min-height: 100vh;
  background: #f9fafb;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* HERO */
.hero {
  position: relative;
  height: 380px;
  overflow: hidden;
}

.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(8,25,65,0.45) 0%, rgba(8,25,65,0.88) 100%);
  z-index: 1;
}

.hero-content {
  position: absolute;
  z-index: 2;
  left: 80px;
  bottom: 48px;
  color: white;
  max-width: 640px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.65);
  margin-bottom: 18px;
}

.breadcrumb-active { color: white; font-weight: 600; }

.hero-content h1 {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 12px;
  line-height: 1.1;
}

.hero-desc {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 24px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 30px;
}

.star-gold { color: #f59e0b; font-size: 22px; }
.big-rating { font-size: 22px; font-weight: 800; }
.rating-label { font-size: 14px; font-weight: 500; }
.dot { color: rgba(255,255,255,0.4); }
.review-count { font-size: 13px; color: rgba(255,255,255,0.75); }

.write-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  background: #1a56db;
  color: white;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.write-btn:hover {
  background: #1447c0;
  box-shadow: 0 4px 16px rgba(26,86,219,0.4);
}

/* FILTER BAR */
.filter-bar-wrap {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-bar {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tabs-scroll {
  display: flex;
  overflow-x: auto;
  gap: 0;
}

.tab-btn {
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover { color: #1a56db; }
.tab-btn.active { color: #1a56db; font-weight: 700; border-bottom-color: #1a56db; }

.sort-select-wrap { flex-shrink: 0; }

.sort-select {
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #374151;
  outline: none;
  cursor: pointer;
}

/* MAIN CONTENT */
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 80px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}

/* STATS ROW */
.stats-row {
  display: grid;
  grid-template-columns: 200px 1fr 240px;
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.04);
}

.stat-label {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
}

/* Overall */
.big-score {
  font-size: 56px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  margin-bottom: 10px;
}

.big-score span { font-size: 24px; color: #6b7280; font-weight: 400; }

.stars-display {
  display: flex;
  gap: 2px;
  margin-bottom: 6px;
}

.star-display {
  font-size: 20px;
  color: #f59e0b;
}

.score-label {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.based-on {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* Breakdown */
.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-size: 13px;
  color: #374151;
  min-width: 55px;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #1a56db;
  border-radius: 99px;
  transition: width 0.8s ease;
}

.bar-pct {
  font-size: 12px;
  color: #6b7280;
  min-width: 32px;
  text-align: right;
}

/* Loved */
.loved-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.loved-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loved-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 6px;
  flex-shrink: 0;
}

.loved-name {
  font-size: 13px;
  color: #374151;
  flex: 1;
}

.loved-score {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.see-all {
  font-size: 13px;
  color: #1a56db;
  font-weight: 600;
  text-decoration: none;
}

.see-all:hover { text-decoration: underline; }

/* SEARCH FILTERS */
.search-filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  background: white;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  flex: 1;
}

.filter-select {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  color: #374151;
  outline: none;
  background: white;
  cursor: pointer;
}

.filter-btn {
  height: 42px;
  padding: 0 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #1a56db;
  color: #1a56db;
}

/* Review list */
.review-list {
  background: white;
  border-radius: 16px;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.04);
}

/* Load more */
.load-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: 1.5px solid #e5e7eb;
  border-radius: 30px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  border-color: #1a56db;
  color: #1a56db;
}

/* SIDEBAR */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.04);
}

.sidebar-card h4 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px;
}

.sidebar-card p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px;
  line-height: 1.6;
}

.share-card .share-icon {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.write-btn-sidebar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
  background: #1a56db;
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.write-btn-sidebar:hover {
  background: #1447c0;
}

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guide-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.guide-dot {
  width: 30px;
  height: 30px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-list strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.guide-list p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.learn-more {
  font-size: 13px;
  color: #1a56db;
  font-weight: 600;
  text-decoration: none;
}

.learn-more:hover { text-decoration: underline; }

.help-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.help-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-card strong {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.help-card p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 10px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #1a56db;
  text-decoration: none;
}

.contact-link:hover { text-decoration: underline; }

/* CTA BANNER */
.cta-banner {
  background: linear-gradient(135deg, #0f2d6b 0%, #1a56db 100%);
  margin: 0;
  padding: 48px 80px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.cta-icon {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cta-text { flex: 1; color: white; }

.cta-text h3 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 6px;
}

.cta-text p {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  margin: 0;
}

.cta-btn {
  flex-shrink: 0;
  height: 48px;
  padding: 0 28px;
  background: white;
  color: #1a56db;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.cta-btn:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transform: translateY(-1px);
}

@media (max-width: 1100px) {
  .main-content, .filter-bar, .cta-banner {
    padding-left: 24px;
    padding-right: 24px;
  }
  .hero-content { left: 24px; }
  .main-content { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 700px) {
  .stats-row { grid-template-columns: 1fr; }
  .hero-content h1 { font-size: 32px; }
}
</style>