<template>
  <div class="review-management">

    <!-- ── HERO ── -->
    <section class="hero">
      
      <div class="hero-overlay" />
      <div class="container">
        <nav class="breadcrumb">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="breadcrumb-link" @click="router.back()">Stays</span>
          <span class="sep">›</span>
          <span>Grand Palace Hotel</span>
          <span class="sep">›</span>
          <span class="active-crumb">Reviews</span>
        </nav>

        <h1 class="hero-title">Guest Reviews &amp; Experience</h1>
        <p class="hero-sub">Real stories from real guests who have stayed and loved their experience.</p>

        <div class="hero-badge-row">
          <!-- Glassmorphism rating card -->
          <div class="glass-card">
            <div class="glass-star">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span class="glass-score">4.9</span>
            <span class="glass-label">Exceptional</span>
            <span class="glass-count">1,284 reviews</span>
          </div>

          <button class="btn-write-review" @click="goToWriteReview">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Write a Review
          </button>
        </div>
      </div>
    </section>

    <!-- ── FILTER TABS ── -->
    <div class="tabs-bar">
      <div class="container tabs-inner">
        <div class="tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <select v-model="sortBy" class="sort-select">
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>
    </div>

    <!-- ── MAIN CONTENT ── -->
    <div class="container main-layout">

      <!-- LEFT: Reviews -->
      <div class="reviews-col">

        <!-- Stats Row (below tabs on mobile) -->
        <div class="stats-row mobile-stats">
          <StatsPanel
            :breakdown="breakdown"
            :lovedCategories="lovedCategories"
            :overall="4.9"
            :totalReviews="1284"
            @write-review="goToWriteReview"
          />
        </div>

        <!-- Search + Filters -->
        <div class="filter-bar">
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search reviews..."
              class="search-input"
            />
          </div>

          <select v-model="filterRating" class="filter-select">
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>

          <select v-model="filterType" class="filter-select">
            <option value="">All Travelers</option>
            <option value="Couple">Couple</option>
            <option value="Family">Family</option>
            <option value="Solo Traveler">Solo Traveler</option>
            <option value="Business">Business</option>
          </select>

          <select v-model="filterLang" class="filter-select">
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>

          <button class="btn-filter">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="10" y1="18" x2="14" y2="18"/>
            </svg>
            Filter
          </button>
        </div>

        <!-- Review Cards -->
        <template v-if="filteredReviews.length > 0">
          <ReviewCard
            v-for="review in filteredReviews"
            :key="review.id"
            :review="review"
          />
        </template>
        <div v-else class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>No reviews match your search.</p>
        </div>

        <!-- Load More -->
        <button class="btn-load-more" @click="loadMore">
          Load More Reviews
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <!-- RIGHT: Sidebar -->
      <aside class="sidebar-col">
        <StatsPanel
          :breakdown="breakdown"
          :lovedCategories="lovedCategories"
          :overall="4.9"
          :totalReviews="1284"
          @write-review="goToWriteReview"
        />
      </aside>
    </div>

    <!-- ── CTA FOOTER BANNER ── -->
    <section class="cta-banner">
      <div class="container cta-inner">
        <div class="cta-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="cta-text">
          <h3>Join thousands of happy travelers</h3>
          <p>Book your next stay and create your own memorable experience.</p>
        </div>
        <button class="btn-cta">Explore Stays</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import ReviewCard from '../components/ReviewCard.vue'
import RatingStars from '../components/RatingStars.vue'
import reviewService from '../services/reviewService.js'

// ── Inline StatsPanel sub-component to keep architecture clean ──
const StatsPanel = defineComponent({
  name: 'StatsPanel',
  props: {
    breakdown: Array,
    lovedCategories: Array,
    overall: Number,
    totalReviews: Number
  },
  emits: ['write-review'],
  components: { RatingStars },
  template: `
    <div class="stats-panel">
      <!-- Overall Rating -->
      <div class="stat-card">
        <h4 class="stat-card-title">Overall Rating</h4>
        <div class="big-score">{{ overall }}<span class="score-denom">/5</span></div>
        <RatingStars :model-value="overall" readonly size="md" />
        <div class="exceptional-label">Exceptional</div>
        <div class="based-on">Based on {{ totalReviews.toLocaleString() }} reviews</div>
      </div>

      <!-- Rating Breakdown -->
      <div class="stat-card">
        <h4 class="stat-card-title">Rating Breakdown</h4>
        <div v-for="item in breakdown" :key="item.stars" class="breakdown-row">
          <span class="star-label">{{ item.stars }} Stars</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
          </div>
          <span class="pct-label">{{ item.percent }}%</span>
        </div>
      </div>

      <!-- What guests loved most -->
      <div class="stat-card">
        <h4 class="stat-card-title">What guests loved most</h4>
        <div v-for="cat in lovedCategories" :key="cat.name" class="cat-row">
          <div class="cat-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-score">{{ cat.score }}</span>
        </div>
        <button class="see-all-link">See all categories →</button>
      </div>

      <!-- Share Your Experience -->
      <div class="stat-card share-card">
        <div class="share-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <h4>Share Your Experience</h4>
        <p>Have you stayed at Grand Palace Hotel? We'd love to hear about your experience and help other travelers.</p>
        <button class="btn-share-write" @click="$emit('write-review')">Write a Review</button>
      </div>

      <!-- Review Guidelines -->
      <div class="stat-card guidelines-card">
        <h4 class="stat-card-title">Review Guidelines</h4>
        <div v-for="guide in guidelines" :key="guide.text" class="guide-row">
          <div class="guide-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path :d="guide.icon"/>
            </svg>
          </div>
          <div>
            <div class="guide-label">{{ guide.label }}</div>
            <div class="guide-sub">{{ guide.text }}</div>
          </div>
        </div>
        <a href="#" class="learn-more-link">Learn more →</a>
      </div>

      <!-- Need Help -->
      <div class="stat-card help-card">
        <div class="help-row">
          <div>
            <h5>Need Help?</h5>
            <p>Our guest support team is here to assist you 24/7</p>
          </div>
          <div class="help-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l1.27-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
        </div>
        <a href="#" class="contact-support">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Contact Support
        </a>
      </div>
    </div>
  `,
  setup() {
    const guidelines = [
      { label: 'Be honest and respectful', text: 'Share your genuine experience', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
      { label: 'Focus on your stay', text: 'Comment on the property, service, and amenities', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
      { label: 'Avoid personal details', text: "Do not share personal information about yourself or others", icon: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' },
      { label: 'Photos are welcome', text: 'Add photos to help others see what to expect', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' }
    ]
    return { guidelines }
  }
})

// ── Main component logic ──
const router = useRouter()

const activeTab = ref('all')
const searchQuery = ref('')
const filterRating = ref('')
const filterType = ref('')
const filterLang = ref('')
const sortBy = ref('recent')

const filterTabs = [
  { key: 'all', label: 'All Reviews (1,284)' },
  { key: 'photos', label: 'Photos (356)' },
  { key: 'comments', label: 'With Comments (982)' },
  { key: 'families', label: 'Families (420)' },
  { key: 'couples', label: 'Couples (612)' },
  { key: 'solo', label: 'Solo Travelers (252)' },
]

const reviews = ref([])

const fetchReviews = async () => {
  try {
    const data = await reviewService.getReviews()
    // Enrich mock data to match screenshot
    reviews.value = [
      {
        id: 1,
        user: { name: 'Jessica Parker', country: 'United States', type: 'Couple', avatar: 'JP' },
        rating: 5.0,
        date: '2 days ago',
        nights: '2 nights',
        stayDate: 'May 2024',
        title: 'Absolutely unforgettable experience!',
        content: 'From the moment we arrived, everything was perfect. The staff went above and beyond to make our stay special. The room was clean, spacious, and the view was breathtaking.',
        image: 'https://picsum.photos/300/200?random=1',
        imageCount: 4,
        tags: ['Cleanliness', 'Service', 'Location', 'Comfort', 'Value']
      },
      {
        id: 2,
        user: { name: 'Daniel Kim', country: 'South Korea', type: 'Family', avatar: 'DK' },
        rating: 5.0,
        date: '1 week ago',
        nights: '3 nights',
        stayDate: 'May 2024',
        title: 'Perfect for family vacation',
        content: 'Our kids loved the pool and the breakfast buffet was amazing. Great location and very convenient. The room was spacious with wonderful views. We will come back for sure!',
        image: 'https://picsum.photos/300/200?random=2',
        imageCount: 6,
        tags: ['Family Friendly', 'Service', 'Location']
      },
      {
        id: 3,
        user: { name: 'Sophie Martin', country: 'France', type: 'Solo Traveler', avatar: 'SM' },
        rating: 4.8,
        date: '2 weeks ago',
        nights: '1 night',
        stayDate: 'April 2024',
        title: 'Beautiful hotel with great atmosphere',
        content: 'The design and ambiance are stunning. My room was incredibly comfortable and the service was top-notch. Would definitely recommend to anyone visiting.',
        image: 'https://picsum.photos/300/200?random=3',
        imageCount: 3,
        tags: ['Cleanliness', 'Service', 'Comfort', 'Design']
      }
    ]
  } catch {
    reviews.value = []
  }
}

fetchReviews()

const breakdown = ref([
  { stars: 5, percent: 89 },
  { stars: 4, percent: 8 },
  { stars: 3, percent: 2 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 0 }
])

const lovedCategories = ref([
  { name: 'Cleanliness', score: '4.9' },
  { name: 'Service', score: '4.9' },
  { name: 'Location', score: '4.8' },
  { name: 'Value for money', score: '4.7' },
  { name: 'Comfort', score: '4.8' }
])

const filteredReviews = computed(() => {
  let list = [...reviews.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q) ||
      r.user.name.toLowerCase().includes(q)
    )
  }

  if (filterRating.value) {
    list = list.filter(r => Math.floor(r.rating) === Number(filterRating.value))
  }

  if (filterType.value) {
    list = list.filter(r => r.user.type === filterType.value)
  }

  if (activeTab.value === 'families') list = list.filter(r => r.user.type === 'Family')
  if (activeTab.value === 'couples') list = list.filter(r => r.user.type === 'Couple')
  if (activeTab.value === 'solo') list = list.filter(r => r.user.type === 'Solo Traveler')

  return list
})

const goToWriteReview = () => {
  router.push({ name: 'review-create', params: { reservationId: '0' } })
}

const loadMore = () => {
  // Pagination placeholder
}
</script>

<style scoped>
/* ── CSS Variables ── */
.review-management {
  background: var(--bg-page);
  min-height: 100vh;
  /* font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; */
}

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 340px;
  /* background:
    linear-gradient(to bottom, rgba(10, 15, 30, 0.68) 0%, rgba(10, 15, 30, 0.55) 100%),
    url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80') center/cover no-repeat; */
  display: flex;
  align-items: flex-end;
  padding: 0 0 52px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(10,15,35,0.6) 0%, transparent 70%);
  pointer-events: none;
}

.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 28px;
  position: relative;
  width: 100%;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  margin-bottom: 18px;
}

.breadcrumb a,
.breadcrumb-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}

.breadcrumb a:hover,
.breadcrumb-link:hover { color: white; }

.breadcrumb .sep { opacity: 0.5; }

.breadcrumb .active-crumb { color: white; font-weight: 500; }

/* Hero Text */
.hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  margin: 0 0 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  letter-spacing: -0.02em;
}

.hero-sub {
  color: rgba(255,255,255,0.88);
  font-size: 1.05rem;
  max-width: 560px;
  line-height: 1.55;
  margin: 0 0 28px;
}

/* Hero Badge */
.hero-badge-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.glass-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 12px;
  padding: 10px 20px;
}

.glass-star {
  background: #f59e0b;
  border-radius: 8px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-score {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
}

.glass-label {
  color: rgba(255,255,255,0.9);
  font-weight: 600;
  font-size: 0.95rem;
}

.glass-count {
  color: rgba(255,255,255,0.65);
  font-size: 0.85rem;
  padding-left: 4px;
  border-left: 1px solid rgba(255,255,255,0.3);
  margin-left: 4px;
}

.btn-write-review {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 13px 26px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.btn-write-review:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

/* ── TABS BAR ── */
.tabs-bar {
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.tabs-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-inner::-webkit-scrollbar { display: none; }

.tabs {
  display: flex;
  gap: 0;
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 16px 20px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover { color: var(--primary); }

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 700;
}

.sort-select {
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.85rem;
  color: var(--text-body);
  background: white;
  cursor: pointer;
  outline: none;
  min-width: 140px;
}

/* ── MAIN LAYOUT ── */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 36px;
  padding: 40px 28px;
  max-width: var(--max-w);
  margin: 0 auto;
  align-items: start;
}

/* Hide mobile stats on desktop */
.mobile-stats { display: none; }

/* ── FILTER BAR ── */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrap {
  flex: 1;
  min-width: 220px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-faint);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 16px 11px 42px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--text-body);
  background: white;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.filter-select {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 0.88rem;
  color: var(--text-body);
  background: white;
  cursor: pointer;
  outline: none;
  min-width: 130px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border-color 0.2s;
}

.filter-select:focus { border-color: var(--primary); }

.btn-filter {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-body);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: background 0.15s, border-color 0.15s;
}

.btn-filter:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 60px 20px;
  color: var(--text-faint);
  font-size: 0.95rem;
}

/* Load More */
.btn-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-body);
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.btn-load-more:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

/* ── SIDEBAR (StatsPanel deep styles) ── */
.sidebar-col {
  position: sticky;
  top: 65px;
}

/* ── CTA BANNER ── */
.cta-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
  padding: 50px 0;
  margin-top: 60px;
}

.cta-inner {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.cta-icon {
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cta-text {
  flex: 1;
  min-width: 200px;
}

.cta-text h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 6px;
}

.cta-text p {
  color: rgba(255,255,255,0.7);
  margin: 0;
  font-size: 0.95rem;
}

.btn-cta {
  background: white;
  color: #1d4ed8;
  border: none;
  border-radius: 12px;
  padding: 14px 30px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
}

/* ── TABLET ── */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-col { display: none; }
  .mobile-stats { display: block; margin-bottom: 28px; }
}

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero {
    padding: 80px 0 40px;
    min-height: 280px;
  }

  .hero-title { font-size: 1.8rem; }
  .hero-sub { font-size: 0.95rem; }

  .main-layout { padding: 24px 16px; gap: 20px; }

  .filter-bar { gap: 8px; }
  .filter-select { min-width: 100px; font-size: 0.82rem; }
  .search-input { font-size: 0.85rem; }

  .tab-btn { padding: 14px 12px; font-size: 0.82rem; }
  .tabs-bar { overflow-x: auto; }

  .cta-inner { flex-direction: column; text-align: center; }
  .btn-cta { width: 100%; }

  .glass-card { padding: 8px 14px; }
}

/* ── DARK MODE ── */
@media (prefers-color-scheme: dark) {
  .review-management {
    --bg-page: #0f172a;
    --bg-card: #1e293b;
    --text-heading: #f1f5f9;
    --text-body: #cbd5e1;
    --text-muted: #94a3b8;
    --text-faint: #64748b;
    --border: #334155;
    --border-light: #1e293b;
    --primary-light: rgba(37, 99, 235, 0.1);
  }

  .tabs-bar, .sort-select, .filter-select, .search-input, .btn-filter, .btn-load-more {
    background: #1e293b;
    color: #cbd5e1;
    border-color: #334155;
  }

  .hero { background-image: linear-gradient(to bottom, rgba(5,10,20,0.8), rgba(5,10,20,0.65)), url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80'); }
}
</style>

<!-- Global styles for the inline StatsPanel sub-component (not scoped) -->
<style>
.stats-panel { display: flex; flex-direction: column; gap: 16px; }

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 22px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px;
}

.big-score {
  font-size: 3rem;
  font-weight: 800;
  color: #1d4ed8;
  line-height: 1;
  margin-bottom: 8px;
}

.score-denom {
  font-size: 1.4rem;
  font-weight: 600;
  color: #64748b;
}

.exceptional-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  margin: 8px 0 4px;
}

.based-on {
  font-size: 0.82rem;
  color: #64748b;
}

/* Breakdown */
.breakdown-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.star-label {
  font-size: 0.82rem;
  color: #475569;
  min-width: 52px;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: 99px;
  transition: width 0.8s ease;
}

.pct-label {
  font-size: 0.82rem;
  color: #475569;
  min-width: 32px;
  text-align: right;
}

/* Category rows */
.cat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid #f1f5f9;
}

.cat-row:last-of-type { border-bottom: none; }

.cat-icon {
  width: 24px;
  height: 24px;
  background: #eff6ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #2563eb;
}

.cat-name {
  flex: 1;
  font-size: 0.88rem;
  color: #334155;
}

.cat-score {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.see-all-link {
  display: block;
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 12px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  text-decoration: none;
}

/* Share card */
.share-card .share-icon {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.share-card h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.share-card p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px;
}

.btn-share-write {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-share-write:hover { background: #1d4ed8; }

/* Guidelines */
.guide-row {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  align-items: flex-start;
}

.guide-icon {
  width: 28px;
  height: 28px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #2563eb;
}

.guide-label {
  font-size: 0.87rem;
  font-weight: 600;
  color: #1e293b;
}

.guide-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 2px;
}

.learn-more-link {
  display: block;
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 12px;
  text-decoration: none;
}

/* Help card */
.help-card h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.help-card p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.help-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
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

.contact-support {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

/* Dark mode for stats panel */
@media (prefers-color-scheme: dark) {
  .stat-card {
    background: #1e293b;
    border-color: #334155;
  }

  .stat-card-title, .big-score, .exceptional-label, .cat-score, .guide-label, .share-card h4, .help-card h5 {
    color: #f1f5f9;
  }

  .cat-name, .star-label, .pct-label, .share-card p, .based-on, .help-card p, .guide-sub {
    color: #94a3b8;
  }

  .bar-track { background: #334155; }
  .cat-row { border-color: #334155; }
  .cat-icon, .share-card .share-icon, .guide-icon, .help-icon { background: rgba(37,99,235,0.15); }
}
</style>