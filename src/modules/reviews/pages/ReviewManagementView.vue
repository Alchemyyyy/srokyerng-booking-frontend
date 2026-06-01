<template>
  <div class="reviews-page">

    <!-- ═══════════════ NAVBAR ═══════════════ -->
    <nav class="navbar">
      <div class="nav-inner">
        <div class="nav-logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span class="logo-text">SrokYerng</span>
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link">Home</a>
          <a href="#" class="nav-link">Stays</a>
          <a href="#" class="nav-link">Experiences</a>
          <a href="#" class="nav-link">Deals</a>
          <a href="#" class="nav-link">Destinations</a>
        </div>
        <div class="nav-actions">
          <button class="nav-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="nav-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div class="nav-user">
            <img src="https://i.pravatar.cc/32?img=47" alt="User" class="user-avatar" />
            <span class="user-name">Hi, Sotheara</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
    </nav>

    <!-- ═══════════════ HERO ═══════════════ -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <img
        class="hero-bg"
        src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&h=700&fit=crop&q=80"
        alt="Grand Palace Hotel"
      />
      <div class="hero-content">
        <nav class="breadcrumb">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Stays</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Grand Palace Hotel</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="breadcrumb-active">Reviews</span>
        </nav>

        <h1>Guest Reviews &amp;<br/>Experience</h1>
        <p class="hero-desc">Real stories from real guests who have stayed and loved their experience.</p>

        <div class="hero-actions">
          <div class="hero-rating-badge">
            <span class="star-gold">★</span>
            <span class="badge-score">4.9</span>
            <span class="badge-label">Exceptional</span>
            <span class="badge-sep">·</span>
            <span class="badge-count">1,284 reviews</span>
          </div>
          <router-link to="reservations/new/review" class="write-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Write a Review
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══════════════ FILTER TABS ═══════════════ -->
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
        <div class="sort-wrap">
          <select v-model="sortBy" class="sort-select">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ═══════════════ STATS ═══════════════ -->
    <div class="stats-section">

      <!-- Overall + Breakdown combined -->
      <div class="stats-combined-card">

        <!-- Overall Rating -->
        <div class="overall-block">
          <p class="block-title">Overall Rating</p>
          <div class="big-score">4.9<span>/5</span></div>
          <div class="stars-display">
            <span v-for="i in 4" :key="i" class="star-blue">★</span>
            <span class="star-blue star-half-el">★</span>
          </div>
          <p class="score-label">Exceptional</p>
          <p class="based-on">Based on 1,284 reviews</p>
        </div>

        <div class="stats-divider"></div>

        <!-- Breakdown -->
        <div class="breakdown-block">
          <p class="block-title">Rating Breakdown</p>
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

      </div>

      <!-- What guests loved most -->
      <div class="loved-card">
        <p class="block-title">What guests loved most</p>
        <div class="loved-list">
          <div class="loved-row" v-for="item in lovedItems" :key="item.label">
            <span class="loved-icon" v-html="item.icon"></span>
            <span class="loved-name">{{ item.label }}</span>
            <span class="loved-score">{{ item.score }}</span>
          </div>
        </div>
        <a href="#" class="see-all-link">See all categories →</a>
      </div>

    </div>

    <!-- ═══════════════ MAIN CONTENT ═══════════════ -->
    <div class="main-content">

      <!-- LEFT: Reviews -->
      <div class="reviews-col">

        <!-- Search + Filters -->
        <div class="search-filter-row">
          <div class="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search reviews..." />
          </div>

          <div class="filter-dropdown">
            <select v-model="filterRating">
              <option value="">All Ratings</option>
              <option v-for="r in [5,4,3,2,1]" :key="r" :value="r">{{ r }} Stars</option>
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div class="filter-dropdown">
            <select v-model="filterTraveler">
              <option value="">All Travelers</option>
              <option>Solo Traveler</option>
              <option>Couple</option>
              <option>Family</option>
              <option>Business</option>
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div class="filter-dropdown">
            <select v-model="filterLang">
              <option value="">All Languages</option>
              <option>English</option>
              <option>French</option>
              <option>Korean</option>
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <button class="filter-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </button>
        </div>

        <!-- Review list -->
        <div class="review-list">
          <ReviewCard
            v-for="review in filteredReviews"
            :key="review.id"
            :review="review"
          />
          <div v-if="loading" class="list-state">
            <div class="spinner"></div>
            <span>Loading reviews…</span>
          </div>
          <div v-if="!loading && filteredReviews.length === 0" class="list-state">
            No reviews match your filters.
          </div>
        </div>

        <!-- Load More -->
        <div class="load-more-wrap">
          <button class="load-more-btn" @click="loadMore">
            Load More Reviews
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

      </div>

      <!-- RIGHT: Sidebar -->
      <div class="sidebar">

        <!-- Share -->
        <div class="sidebar-card share-card">
          <div class="share-icon-wrap">
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

        <!-- Help -->
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

    <!-- ═══════════════ CTA BANNER ═══════════════ -->
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

    <!-- ═══════════════ FOOTER ═══════════════ -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span class="logo-text">SrokYerng</span>
          </div>
          <p class="brand-desc">Discover luxury stays across Cambodia. Comfort, elegance, and unforgettable experiences.</p>
          <div class="social-links">
            <a href="#" class="social-btn">f</a>
            <a href="#" class="social-btn">in</a>
            <a href="#" class="social-btn">▶</a>
            <a href="#" class="social-btn">♪</a>
          </div>
        </div>

        <div class="footer-col">
          <h5>Explore</h5>
          <a href="#">Stays</a>
          <a href="#">Experiences</a>
          <a href="#">Destinations</a>
          <a href="#">Deals</a>
        </div>
        <div class="footer-col">
          <h5>Company</h5>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Blog</a>
        </div>
        <div class="footer-col">
          <h5>Support</h5>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div class="footer-col">
          <h5>Contact</h5>
          <p class="contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            +855 12 345 678
          </p>
          <p class="contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            support@srokyerng.com
          </p>
          <p class="contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Mon - Sun: 24/7
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2024 SrokYerng. All rights reserved.</p>
        <div class="payment-icons">
          <span class="pay-badge visa">VISA</span>
          <span class="pay-badge master">MC</span>
          <span class="pay-badge aba">ABA PAY</span>
          <span class="pay-badge paypal">PayPal</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ReviewCard from "../components/ReviewCard.vue";
import { getPropertyReviews } from "../services/reviewService.js";

const activeTab      = ref("all");
const sortBy         = ref("recent");
const searchQuery    = ref("");
const filterRating   = ref("");
const filterTraveler = ref("");
const filterLang     = ref("");
const reviews        = ref([]);
const loading        = ref(false);

const tabs = [
  { key: "all",      label: "All Reviews (1,284)" },
  { key: "photos",   label: "Photos (356)" },
  { key: "comments", label: "With Comments (982)" },
  { key: "families", label: "Families (420)" },
  { key: "couples",  label: "Couples (612)" },
  { key: "solo",     label: "Solo Travelers (252)" },
];

const ratingBars = [
  { label: "5 Stars", pct: 89 },
  { label: "4 Stars", pct: 8  },
  { label: "3 Stars", pct: 2  },
  { label: "2 Stars", pct: 1  },
  { label: "1 Star",  pct: 0  },
];

const lovedItems = [
  { label: "Cleanliness",     score: "4.9", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
  { label: "Service",         score: "4.9", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
  { label: "Location",        score: "4.8", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` },
  { label: "Value for money", score: "4.7", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>` },
  { label: "Comfort",         score: "4.8", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
];

const guidelines = [
  { title: "Be honest and respectful", desc: "Share your genuine experience",                               icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>` },
  { title: "Focus on your stay",        desc: "Comment on the property, service, and amenities",            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` },
  { title: "Avoid personal details",    desc: "Do not share personal information about yourself or others", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { title: "Photos are welcome",        desc: "Add photos to help others see what to expect",               icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` },
];

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
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
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
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
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
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
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
  if (filterRating.value)   list = list.filter(r => Math.floor(r.rating) === Number(filterRating.value));
  if (filterTraveler.value) list = list.filter(r => r.travelerType === filterTraveler.value);
  if (sortBy.value === "highest") list = [...list].sort((a, b) => b.rating - a.rating);
  if (sortBy.value === "lowest")  list = [...list].sort((a, b) => a.rating - b.rating);
  return list;
});

const loadMore = () => {};

onMounted(async () => {
  try {
    loading.value = true;
    // const data = await getPropertyReviews(propertyId);
    // reviews.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.reviews-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* ── NAVBAR ────────────────────────────────── */
.navbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 100;
}
.nav-inner {
  max-width: 1280px;
  margin: auto;
  padding: 0 40px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 40px;
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon {
  width: 36px; height: 36px;
  background: #1a56db;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.logo-text { font-size: 18px; font-weight: 800; color: white; }
.nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; }
.nav-link {
  padding: 8px 14px;
  font-size: 14px;
  color: rgba(255,255,255,0.88);
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
  font-weight: 500;
}
.nav-link:hover { background: rgba(255,255,255,0.12); }
.nav-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.nav-icon-btn {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.12);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.nav-icon-btn:hover { background: rgba(255,255,255,0.22); }
.nav-user {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.12);
  border-radius: 30px;
  padding: 4px 12px 4px 4px;
  cursor: pointer;
  color: white;
  font-size: 13px;
  font-weight: 600;
}
.user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }

/* ── HERO ──────────────────────────────────── */
.hero {
  position: relative;
  height: 480px;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 40%;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(90deg,
    rgba(5,15,50,0.92) 0%,
    rgba(5,15,50,0.72) 40%,
    rgba(5,15,50,0.2) 100%);
  z-index: 1;
}
.hero-content {
  position: absolute;
  z-index: 2;
  top: 50%; left: 80px;
  transform: translateY(-50%);
  max-width: 580px;
  color: white;
  padding-top: 40px;
}
.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 20px;
}
.breadcrumb-active { color: white; font-weight: 600; }
.hero-content h1 {
  font-size: 54px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}
.hero-desc {
  font-size: 16px;
  color: rgba(255,255,255,0.82);
  line-height: 1.7;
  margin-bottom: 28px;
  max-width: 420px;
}
.hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.hero-rating-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 30px;
  padding: 10px 20px;
}
.star-gold { color: #f59e0b; font-size: 18px; }
.badge-score { font-size: 18px; font-weight: 800; }
.badge-label { font-size: 14px; font-weight: 600; }
.badge-sep { color: rgba(255,255,255,0.4); }
.badge-count { font-size: 13px; color: rgba(255,255,255,0.72); }
.write-btn {
  display: inline-flex; align-items: center; gap: 10px;
  height: 52px; padding: 0 24px;
  background: #1a56db;
  color: white;
  border-radius: 12px;
  font-size: 14px; font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(26,86,219,0.4);
}
.write-btn:hover { background: #1447c0; transform: translateY(-1px); }

/* ── FILTER BAR ────────────────────────────── */
.filter-bar-wrap {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky; top: 0; z-index: 50;
}
.filter-bar {
  max-width: 1280px; margin: auto;
  padding: 0 40px;
  display: flex; align-items: center; justify-content: space-between;
}
.tabs-scroll {
  display: flex; overflow-x: auto; scrollbar-width: none;
}
.tabs-scroll::-webkit-scrollbar { display: none; }
.tab-btn {
  padding: 18px 16px;
  background: none; border: none;
  font-size: 14px; font-weight: 500;
  color: #6b7280;
  cursor: pointer; white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab-btn:hover { color: #1a56db; }
.tab-btn.active { color: #1a56db; font-weight: 700; border-bottom-color: #1a56db; }
.sort-wrap { flex-shrink: 0; }
.sort-select {
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  padding: 8px 12px; font-size: 13px;
  color: #374151; outline: none; cursor: pointer; background: white;
}

/* ── STATS ─────────────────────────────────── */
.stats-section {
  max-width: 1280px; margin: 32px auto 0;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}
.stats-combined-card {
  background: white;
  border-radius: 16px;
  padding: 28px 32px;
  display: flex; align-items: stretch;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
}
.overall-block { min-width: 180px; padding-right: 32px; }
.stats-divider { width: 1px; background: #e5e7eb; margin: 0 32px 0 0; flex-shrink: 0; }
.breakdown-block { flex: 1; }
.block-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 20px; }
.big-score { font-size: 52px; font-weight: 800; color: #111827; line-height: 1; margin-bottom: 10px; }
.big-score span { font-size: 20px; color: #9ca3af; font-weight: 400; }
.stars-display { display: flex; gap: 3px; margin-bottom: 8px; }
.star-blue { font-size: 22px; color: #1a56db; }
.star-half-el { opacity: 0.5; }
.score-label { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
.based-on { font-size: 12px; color: #9ca3af; }
.breakdown-list { display: flex; flex-direction: column; gap: 12px; }
.breakdown-row { display: flex; align-items: center; gap: 12px; }
.bar-label { font-size: 13px; color: #374151; min-width: 52px; }
.bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.bar-fill { height: 100%; background: #1a56db; border-radius: 99px; }
.bar-pct { font-size: 12px; color: #6b7280; min-width: 34px; text-align: right; }
.loved-card {
  background: white; border-radius: 16px; padding: 28px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
  display: flex; flex-direction: column;
}
.loved-list { display: flex; flex-direction: column; gap: 13px; margin-bottom: 16px; }
.loved-row { display: flex; align-items: center; gap: 10px; }
.loved-icon {
  width: 28px; height: 28px;
  background: #eff6ff; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.loved-name { font-size: 13px; color: #374151; flex: 1; }
.loved-score { font-size: 14px; font-weight: 700; color: #111827; }
.see-all-link { font-size: 13px; color: #1a56db; font-weight: 600; text-decoration: none; margin-top: auto; }
.see-all-link:hover { text-decoration: underline; }

/* ── MAIN CONTENT ──────────────────────────── */
.main-content {
  max-width: 1280px; margin: 32px auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
}

/* Search + filter */
.search-filter-row {
  display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
}
.search-box {
  flex: 1; min-width: 200px; height: 44px;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  padding: 0 16px; background: white;
  display: flex; align-items: center; gap: 10px;
}
.search-box input {
  flex: 1; border: none; outline: none;
  font-size: 13px; color: #374151;
}
.filter-dropdown {
  position: relative;
  display: flex; align-items: center;
}
.filter-dropdown select {
  height: 44px; padding: 0 32px 0 12px;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-size: 13px; color: #374151;
  outline: none; background: white; cursor: pointer;
  appearance: none;
}
.filter-dropdown > svg {
  position: absolute; right: 10px;
  pointer-events: none;
}
.filter-btn {
  height: 44px; padding: 0 16px;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  background: white; color: #374151;
  font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s; white-space: nowrap;
}
.filter-btn:hover { border-color: #1a56db; color: #1a56db; }

/* Review list */
.review-list {
  background: white; border-radius: 16px; padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
}
.list-state {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 48px 0;
  font-size: 14px; color: #9ca3af;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid #e5e7eb; border-top-color: #1a56db;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.load-more-wrap { display: flex; justify-content: center; margin-top: 20px; }
.load-more-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px;
  border: 1.5px solid #e5e7eb; border-radius: 30px;
  background: white; font-size: 14px; font-weight: 600;
  color: #374151; cursor: pointer; transition: all 0.2s;
}
.load-more-btn:hover { border-color: #1a56db; color: #1a56db; }

/* ── SIDEBAR ────────────────────────────────── */
.sidebar { display: flex; flex-direction: column; gap: 20px; }
.sidebar-card {
  background: white; border-radius: 16px; padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
}
.sidebar-card h4 { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 10px; }
.sidebar-card p  { font-size: 13px; color: #6b7280; margin: 0 0 16px; line-height: 1.6; }
.share-icon-wrap {
  width: 44px; height: 44px;
  background: #eff6ff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.write-btn-sidebar {
  display: flex; align-items: center; justify-content: center;
  height: 44px; background: #1a56db;
  color: white; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  text-decoration: none; transition: background 0.2s;
}
.write-btn-sidebar:hover { background: #1447c0; }
.guide-list { list-style: none; padding: 0; margin: 0 0 12px; display: flex; flex-direction: column; gap: 14px; }
.guide-list li { display: flex; gap: 10px; align-items: flex-start; }
.guide-dot {
  width: 30px; height: 30px;
  background: #eff6ff; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.guide-list strong { display: block; font-size: 13px; font-weight: 600; color: #111827; }
.guide-list p { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
.learn-more { font-size: 13px; color: #1a56db; font-weight: 600; text-decoration: none; }
.learn-more:hover { text-decoration: underline; }
.help-card { display: flex; gap: 14px; align-items: flex-start; }
.help-icon {
  width: 48px; height: 48px;
  background: #eff6ff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.help-card strong { display: block; font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px; }
.help-card p { font-size: 13px; color: #6b7280; margin: 0 0 8px; }
.contact-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 600; color: #1a56db; text-decoration: none;
}
.contact-link:hover { text-decoration: underline; }

/* ── CTA BANNER ─────────────────────────────── */
.cta-banner {
  background: linear-gradient(135deg, #0a1f5c 0%, #1a56db 100%);
  padding: 48px 80px;
  display: flex; align-items: center; gap: 24px;
  margin-top: 40px;
}
.cta-icon {
  width: 72px; height: 72px;
  background: rgba(255,255,255,0.1);
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cta-text { flex: 1; color: white; }
.cta-text h3 { font-size: 22px; font-weight: 800; margin: 0 0 6px; }
.cta-text p  { font-size: 14px; color: rgba(255,255,255,0.78); margin: 0; }
.cta-btn {
  flex-shrink: 0; height: 52px; padding: 0 32px;
  background: white; color: #1a56db;
  border-radius: 30px; font-size: 15px; font-weight: 700;
  text-decoration: none;
  display: flex; align-items: center;
  transition: all 0.2s; white-space: nowrap;
}
.cta-btn:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.25); transform: translateY(-1px); }

/* ── FOOTER ─────────────────────────────────── */
.footer { background: #0f172a; color: white; padding: 56px 0 0; }
.footer-inner {
  max-width: 1280px; margin: auto;
  padding: 0 80px 40px;
  display: grid;
  grid-template-columns: 280px 1fr 1fr 1fr 1fr;
  gap: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.footer-brand .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.brand-desc { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 20px; }
.social-links { display: flex; gap: 8px; }
.social-btn {
  width: 34px; height: 34px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700;
  text-decoration: none; transition: background 0.2s;
}
.social-btn:hover { background: rgba(255,255,255,0.15); }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col h5 { font-size: 14px; font-weight: 700; color: white; margin-bottom: 4px; }
.footer-col a {
  font-size: 13px; color: rgba(255,255,255,0.55);
  text-decoration: none; transition: color 0.2s;
}
.footer-col a:hover { color: white; }
.contact-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: rgba(255,255,255,0.55);
}
.footer-bottom {
  max-width: 1280px; margin: auto;
  padding: 20px 80px;
  display: flex; align-items: center; justify-content: space-between;
}
.footer-bottom p { font-size: 13px; color: rgba(255,255,255,0.4); }
.payment-icons { display: flex; gap: 8px; }
.pay-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px; font-weight: 700;
  border: 1px solid rgba(255,255,255,0.15);
}
.visa   { color: #fff; background: #1a1f71; }
.master { color: #fff; background: #eb001b; }
.aba    { color: #fff; background: #0066cc; }
.paypal { color: #fff; background: #003087; }

/* ── RESPONSIVE ──────────────────────────────── */
@media (max-width: 1100px) {
  .stats-section,
  .main-content { grid-template-columns: 1fr; padding: 0 24px; }
  .stats-combined-card { flex-direction: column; gap: 24px; }
  .stats-divider { width: 100%; height: 1px; margin: 0; }
  .overall-block { padding-right: 0; }
  .hero-content { left: 40px; }
  .footer-inner { grid-template-columns: 1fr 1fr; gap: 28px; }
  .cta-banner { padding: 40px 40px; }
}
@media (max-width: 640px) {
  .hero-content h1 { font-size: 36px; }
  .nav-links { display: none; }
  .cta-banner { flex-direction: column; text-align: center; }
  .footer-inner { grid-template-columns: 1fr; padding: 0 24px 32px; }
  .footer-bottom { flex-direction: column; gap: 16px; text-align: center; padding: 20px 24px; }
}
</style>