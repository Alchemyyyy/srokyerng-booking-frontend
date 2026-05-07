<script setup>
import { RouterLink } from "vue-router";
import BrandLogo from "@/shared/components/BrandLogo.vue";

const trustMetrics = [
  { value: "Local-first", label: "Brand direction" },
  { value: "Light UI", label: "Color system" },
  { value: "Clear flow", label: "Booking experience" },
];

const storyCards = [
  {
    title: "Our mission",
    description:
      "Make accommodation discovery feel calm, trustworthy, and easy to understand for both travelers and property owners.",
  },
  {
    title: "Our vision",
    description:
      "Build a booking platform that feels unmistakably Cambodian while still looking clean, modern, and ready for scale.",
  },
];

const pillars = [
  {
    step: "01",
    title: "Stay local",
    description:
      "SrokYerng Booking is meant to highlight places that feel rooted in Cambodia, not anonymous listings.",
  },
  {
    step: "02",
    title: "Book with confidence",
    description:
      "The product should help users understand options quickly, trust what they see, and move through booking without friction.",
  },
  {
    step: "03",
    title: "Support every role",
    description:
      "The same visual system needs to work for public browsing, owner workflows, and admin review screens.",
  },
];

const experienceLanes = [
  {
    title: "For travelers",
    points: [
      "Discover properties inside a calm, welcoming interface.",
      "Scan availability, price, and trust signals quickly.",
      "Feel the local identity of Cambodia throughout the experience.",
    ],
  },
  {
    title: "For owners",
    points: [
      "Present listings in a cleaner and more professional way.",
      "Manage reservations with a UI that feels organized and dependable.",
      "Benefit from a brand that feels credible from the first impression.",
    ],
  },
  {
    title: "For the platform",
    points: [
      "Use light surfaces and blue hierarchy to reduce visual stress.",
      "Keep status colors separate from brand colors for clarity.",
      "Create one recognizable visual language across the full product.",
    ],
  },
];

const paletteNotes = [
  { name: "Page", value: "#F3F6FB" },
  { name: "Primary", value: "#1E88E5" },
  { name: "Strong", value: "#0D47A1" },
  { name: "Muted", value: "#607D8B" },
];
</script>

<template>
  <main class="about-page">
    <section class="hero-section">
      <div class="hero-copy">
        <BrandLogo show-tagline subtitle="Stay local, experience Cambodia" />

        <p class="eyebrow">About SrokYerng Booking</p>
        <h1>
          Designed with the light color system for a calmer booking experience.
        </h1>
        <p class="hero-text">
          This About page now follows the light palette directly: airy page
          backgrounds, white surfaces, deep blue hierarchy, and softer
          supporting tones that make the brand feel trusted, local, and easy to
          navigate.
        </p>

        <div class="hero-actions">
          <RouterLink
            :to="{ name: 'public.properties' }"
            class="button button-primary"
          >
            Explore properties
          </RouterLink>
         
        </div>

        <div class="metric-row">
          <article
            v-for="metric in trustMetrics"
            :key="metric.label"
            class="metric-card"
          >
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </article>
        </div>
      </div>

      <aside class="hero-preview">
        <div class="preview-card">
          <div class="preview-card__top">
            <p>Light mode preview</p>
            <span>Brand-ready</span>
          </div>

          <div class="preview-visual">
            <div class="preview-visual__temple"></div>
            <div class="preview-visual__roof"></div>
            <div class="preview-visual__wave"></div>
          </div>

          <div class="search-mock">
            <label>
              Destination
              <input type="text" value="Siem Reap" />
            </label>
            <button type="button">Search stays</button>
          </div>

          <div class="preview-note">
            <strong>Why this works</strong>
            <p>
              The light system keeps booking actions clear while the softer
              surfaces make the whole page feel more open and welcoming.
            </p>
          </div>

          <div class="palette-row">
            <article
              v-for="color in paletteNotes"
              :key="color.name"
              class="palette-chip"
              :style="{ '--swatch': color.value }"
            >
              <span class="palette-chip__swatch"></span>
              <span>{{ color.name }}</span>
            </article>
          </div>
        </div>
      </aside>
    </section>

    <section class="story-grid">
      <article v-for="card in storyCards" :key="card.title" class="story-card">
        <p class="eyebrow">Brand story</p>
        <h2>{{ card.title }}</h2>
        <p>{{ card.description }}</p>
      </article>
    </section>

    <section class="pillars-section">
      <div class="section-heading">
        <p class="eyebrow">Core pillars</p>
        <h2>What the brand should communicate on every public page.</h2>
      </div>

      <div class="pillars-grid">
        <article
          v-for="pillar in pillars"
          :key="pillar.step"
          class="pillar-card"
        >
          <span class="pillar-step">{{ pillar.step }}</span>
          <h3>{{ pillar.title }}</h3>
          <p>{{ pillar.description }}</p>
        </article>
      </div>
    </section>

    <section class="experience-panel">
      <div class="section-heading">
        <p class="eyebrow">Experience design</p>
        <h2>One light system, shaped for three different audiences.</h2>
      </div>

      <div class="lane-grid">
        <article
          v-for="lane in experienceLanes"
          :key="lane.title"
          class="lane-card"
        >
          <h3>{{ lane.title }}</h3>
          <ul>
            <li v-for="point in lane.points" :key="point">{{ point }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="cta-panel">
      <div>
        <p class="eyebrow eyebrow-inverse">Next step</p>
        <h2>
          Use this same light system across the rest of the public experience.
        </h2>
        <p>
          The About page now aligns with the shared light palette. The next
          useful step would be applying the same treatment to the home page,
          contact page, and shared brand components.
        </p>
      </div>

      <div class="cta-actions">
        <RouterLink
          :to="{ name: 'public.contact' }"
          class="button button-white"
        >
          Continue to contact
        </RouterLink>
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="button button-outline"
        >
          Browse stays
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700;800&display=swap");

.about-page {
  --about-page: #f3f6fb;
  --about-surface: #ffffff;
  --about-surface-soft: #edf5ff;
  --about-text: #0d2f63;
  --about-muted: #607d8b;
  --about-border: #d8e3ef;
  --about-primary: #1e88e5;
  --about-primary-strong: #0d47a1;
  --about-primary-soft: #e3f2fd;
  --about-shadow-panel: 0 18px 45px rgba(13, 71, 161, 0.1);
  --about-shadow-card: 0 10px 28px rgba(13, 71, 161, 0.08);

  min-height: 100%;
  padding: 32px 0 72px;
  background:
    radial-gradient(
      circle at top left,
      rgba(30, 136, 229, 0.16),
      transparent 24%
    ),
    radial-gradient(circle at 88% 10%, rgba(13, 71, 161, 0.1), transparent 24%),
    linear-gradient(180deg, #f9fbff 0%, var(--about-page) 52%, #eef5fd 100%);
  color: var(--about-text);
  font-family: "Kantumruy Pro", sans-serif;
}

.hero-section,
.story-grid,
.pillars-section,
.experience-panel,
.cta-panel {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(320px, 0.96fr);
  gap: 24px;
  align-items: center;
  padding: clamp(24px, 4vw, 40px);
  border: 1px solid rgba(216, 227, 239, 0.85);
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--about-shadow-panel);
  backdrop-filter: blur(12px);
}

.eyebrow,
.eyebrow-inverse {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--about-primary);
}

.eyebrow-inverse {
  color: rgba(255, 255, 255, 0.76);
}

.hero-copy h1,
.story-card h2,
.section-heading h2,
.pillar-card h3,
.lane-card h3,
.cta-panel h2 {
  margin: 0;
  color: var(--about-text);
  letter-spacing: -0.05em;
}

.hero-copy h1 {
  max-width: 720px;
  margin-top: 18px;
  font-size: clamp(2.6rem, 6vw, 4.9rem);
  line-height: 0.96;
}

.hero-text,
.story-card p,
.section-heading p,
.pillar-card p,
.lane-card li,
.preview-note p,
.cta-panel p {
  color: var(--about-muted);
  line-height: 1.75;
}

.hero-text {
  max-width: 640px;
  margin: 18px 0 0;
  font-size: 1.02rem;
}

.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 24px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 18px;
  font-weight: 700;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background: linear-gradient(
    135deg,
    var(--about-primary),
    var(--about-primary-strong)
  );
  color: #fff;
  box-shadow: 0 16px 32px rgba(30, 136, 229, 0.24);
}

.button-primary:hover {
  color: #fff;
}

.button-secondary {
  border: 1px solid var(--about-border);
  background: var(--about-surface);
  color: var(--about-text);
}

.button-white {
  background: #fff;
  color: var(--about-primary-strong);
}

.button-outline {
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 26px;
}

.metric-card,
.story-card,
.pillar-card,
.lane-card,
.preview-card {
  border: 1px solid var(--about-border);
  background: var(--about-surface);
  box-shadow: var(--about-shadow-card);
}

.metric-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.88);
}

.metric-card strong {
  display: block;
  color: var(--about-primary-strong);
  font-size: 1.1rem;
}

.metric-card span {
  display: block;
  margin-top: 8px;
  color: var(--about-muted);
  font-size: 0.88rem;
}

.hero-preview {
  display: flex;
}

.preview-card {
  width: 100%;
  padding: 20px;
  border-radius: 30px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96),
    rgba(243, 248, 255, 0.96)
  );
}

.preview-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-card__top p,
.preview-card__top span {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
}

.preview-card__top p {
  color: var(--about-muted);
}

.preview-card__top span {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--about-primary-soft);
  color: var(--about-primary-strong);
}

.preview-visual {
  position: relative;
  min-height: 190px;
  margin-top: 18px;
  border-radius: 26px;
  background:
    radial-gradient(
      circle at top center,
      rgba(255, 255, 255, 0.22),
      transparent 26%
    ),
    linear-gradient(135deg, var(--about-primary), var(--about-primary-strong));
  overflow: hidden;
}

.preview-visual::after {
  content: "";
  position: absolute;
  right: -28px;
  top: 20px;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.preview-visual__temple,
.preview-visual__roof,
.preview-visual__wave {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.preview-visual__temple {
  top: 40px;
  width: 120px;
  height: 56px;
  border-radius: 18px 18px 10px 10px;
  background: rgba(255, 255, 255, 0.18);
}

.preview-visual__roof {
  top: 22px;
  width: 170px;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  clip-path: polygon(50% 0, 100% 70%, 82% 70%, 50% 28%, 18% 70%, 0 70%);
}

.preview-visual__wave {
  bottom: 28px;
  width: 210px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
}

.search-mock {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
  margin-top: 18px;
}

.search-mock label {
  display: grid;
  gap: 8px;
  color: var(--about-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.search-mock input {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--about-border);
  border-radius: 14px;
  background: #fff;
  color: var(--about-text);
}

.search-mock button {
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--about-primary);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.preview-note {
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  background: var(--about-surface-soft);
}

.preview-note strong {
  display: block;
  color: var(--about-primary-strong);
}

.preview-note p {
  margin: 8px 0 0;
}

.palette-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.palette-chip {
  display: grid;
  gap: 10px;
  justify-items: center;
  padding: 14px 10px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  text-align: center;
  color: var(--about-text);
  font-size: 0.78rem;
  font-weight: 700;
}

.palette-chip__swatch {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: var(--swatch);
  box-shadow: inset 0 0 0 1px rgba(13, 47, 99, 0.08);
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.story-card,
.pillar-card,
.lane-card {
  padding: 24px;
  border-radius: 28px;
}

.story-card h2,
.section-heading h2,
.cta-panel h2 {
  margin-top: 12px;
  font-size: clamp(1.95rem, 4vw, 3rem);
  line-height: 1;
}

.story-card p:last-child {
  margin-top: 14px;
}

.pillars-section,
.experience-panel {
  margin-top: 24px;
  padding: clamp(24px, 4vw, 34px);
  border: 1px solid rgba(216, 227, 239, 0.82);
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: var(--about-shadow-panel);
}

.section-heading p {
  max-width: 720px;
  margin: 14px 0 0;
}

.pillars-grid,
.lane-grid {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.pillars-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pillar-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--about-primary-soft);
  color: var(--about-primary-strong);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.pillar-card h3,
.lane-card h3 {
  margin-top: 16px;
  font-size: 1.38rem;
}

.pillar-card p {
  margin-top: 10px;
}

.lane-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.lane-card ul {
  display: grid;
  gap: 12px;
  margin: 16px 0 0;
  padding-left: 18px;
}

.cta-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) auto;
  gap: 24px;
  align-items: center;
  margin-top: 24px;
  padding: clamp(24px, 4vw, 34px);
  border-radius: 36px;
  background:
    radial-gradient(
      circle at top right,
      rgba(255, 255, 255, 0.12),
      transparent 32%
    ),
    linear-gradient(135deg, var(--about-primary-strong), var(--about-primary));
  box-shadow: 0 24px 56px rgba(13, 71, 161, 0.2);
}

.cta-panel h2,
.cta-panel p {
  color: #fff;
}

.cta-panel p {
  max-width: 680px;
  margin: 14px 0 0;
}

@media (max-width: 1080px) {
  .hero-section,
  .story-grid,
  .pillars-grid,
  .lane-grid,
  .cta-panel {
    grid-template-columns: 1fr;
  }

  .metric-row,
  .palette-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .about-page {
    padding: 20px 0 56px;
  }

  .hero-section,
  .story-grid,
  .pillars-section,
  .experience-panel,
  .cta-panel {
    width: min(100%, calc(100% - 20px));
  }

  .hero-section,
  .pillars-section,
  .experience-panel,
  .cta-panel {
    border-radius: 28px;
  }

  .hero-actions,
  .cta-actions,
  .search-mock {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .metric-row,
  .palette-row {
    grid-template-columns: 1fr;
  }
}
</style>
