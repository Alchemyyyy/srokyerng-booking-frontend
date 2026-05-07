<template>
  <main class="color-system-page">
    <section class="hero-panel">
      <div class="hero-toolbar">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <p class="eyebrow">Design tokens</p>
      <h1>SrokYerng light and dark color system</h1>
      <p class="muted">
        The frontend uses logo-blue design tokens with both light and dark modes. Components
        should use CSS variables, not hardcoded colors, so they adapt automatically.
      </p>
    </section>

    <section class="theme-grid">
      <article class="theme-preview light-preview">
        <div class="preview-header">
          <p class="eyebrow">Light mode</p>
          <h2>Clean marketplace</h2>
          <p>
            Best for public pages, search, property cards, forms, and general booking flow.
          </p>
        </div>
        <div class="preview-search">
          <label>
            Destination
            <input type="text" value="Siem Reap" />
          </label>
          <button type="button">Search stays</button>
        </div>
        <div class="preview-card">
          <span class="status-badge status-approved">Approved</span>
          <h3>Angkor Garden Hotel</h3>
          <p>Siem Reap · 4.8 rating · Breakfast included</p>
          <strong>$48/night</strong>
        </div>
      </article>

      <article class="theme-preview dark-preview">
        <div class="preview-header">
          <p class="eyebrow">Dark mode</p>
          <h2>Night marketplace</h2>
          <p>
            Best for optional dark theme, dashboards, low-light browsing, and modern admin UI.
          </p>
        </div>
        <div class="preview-search">
          <label>
            Destination
            <input type="text" value="Kampot" />
          </label>
          <button type="button">Search stays</button>
        </div>
        <div class="preview-card">
          <span class="status-badge status-paid">Paid</span>
          <h3>Riverside Boutique Stay</h3>
          <p>Phnom Penh · 4.6 rating · Airport shuttle</p>
          <strong>$62/night</strong>
        </div>
      </article>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <p class="eyebrow">Light palette</p>
        <h2>Default tokens</h2>
      </div>
      <div class="color-grid">
        <article
          v-for="color in lightColors"
          :key="color.token"
          class="color-card"
          :style="{ '--swatch-color': color.value }"
        >
          <div class="color-swatch"></div>
          <div>
            <h3>{{ color.name }}</h3>
            <p>{{ color.token }}</p>
            <strong>{{ color.value }}</strong>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block dark-token-section">
      <div class="section-heading">
        <p class="eyebrow">Dark palette</p>
        <h2><code>[data-theme="dark"]</code> tokens</h2>
      </div>
      <div class="color-grid">
        <article
          v-for="color in darkColors"
          :key="color.token"
          class="color-card"
          :style="{ '--swatch-color': color.value }"
        >
          <div class="color-swatch"></div>
          <div>
            <h3>{{ color.name }}</h3>
            <p>{{ color.token }}</p>
            <strong>{{ color.value }}</strong>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <p class="eyebrow">Status colors</p>
        <h2>Reusable status badges</h2>
      </div>
      <div class="status-list">
        <span class="status-badge status-pending">Pending</span>
        <span class="status-badge status-confirmed">Confirmed</span>
        <span class="status-badge status-paid">Paid</span>
        <span class="status-badge status-approved">Approved</span>
        <span class="status-badge status-cancelled">Cancelled</span>
        <span class="status-badge status-failed">Failed</span>
        <span class="status-badge status-rejected">Rejected</span>
        <span class="status-badge status-refunded">Refunded</span>
      </div>
    </section>

    <section class="section-block usage-notes">
      <p class="eyebrow">Rules</p>
      <h2>How teammates should use this</h2>
      <ul>
        <li>Use variables like <code>var(--color-primary)</code>, not hardcoded hex colors.</li>
        <li>Use <code>data-theme="dark"</code> on the app root when adding a manual theme toggle.</li>
        <li>Use <code>data-theme="light"</code> to force light mode even when the OS is dark.</li>
        <li>Use status classes like <code>.status-paid</code> and <code>.status-rejected</code> for badges.</li>
        <li>Keep the logo blues as the main identity across public, owner, and admin screens.</li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";

const lightColors = [
  { name: "Page", token: "--color-page", value: "#f3f6fb" },
  { name: "Surface", token: "--color-surface", value: "#ffffff" },
  { name: "Text", token: "--color-text", value: "#0d2f63" },
  { name: "Muted", token: "--color-muted", value: "#607d8b" },
  { name: "Border", token: "--color-border", value: "#d8e3ef" },
  { name: "Primary", token: "--color-primary", value: "#1e88e5" },
  { name: "Primary strong", token: "--color-primary-strong", value: "#0d47a1" },
  { name: "Primary soft", token: "--color-primary-soft", value: "#e3f2fd" },
  { name: "Secondary", token: "--color-secondary", value: "#1565c0" },
  { name: "Info", token: "--color-info", value: "#607d8b" },
];

const darkColors = [
  { name: "Page", token: "--color-page", value: "#071526" },
  { name: "Surface", token: "--color-surface", value: "#0d2238" },
  { name: "Surface soft", token: "--color-surface-soft", value: "#102b47" },
  { name: "Text", token: "--color-text", value: "#f3f6fb" },
  { name: "Muted", token: "--color-muted", value: "#9fb5c7" },
  { name: "Border", token: "--color-border", value: "#1f3f5d" },
  { name: "Primary", token: "--color-primary", value: "#1e88e5" },
  { name: "Primary strong", token: "--color-primary-strong", value: "#64b5f6" },
  { name: "Secondary", token: "--color-secondary", value: "#38bdf8" },
  { name: "Danger", token: "--color-danger", value: "#fb7185" },
];
</script>

<style scoped>
.color-system-page {
  width: min(1160px, calc(100% - var(--space-xl)));
  margin: 0 auto;
  padding: 56px 0;
}

.hero-panel,
.section-block,
.theme-preview {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.hero-panel {
  padding: clamp(28px, 5vw, 56px);
}

.hero-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.hero-panel h1,
.section-heading h2,
.preview-header h2,
.usage-notes h2 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(2rem, 5vw, 4.2rem);
  letter-spacing: -0.06em;
  line-height: 1;
}

.hero-panel .muted {
  max-width: 720px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-lg);
}

.theme-preview {
  display: grid;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.light-preview {
  --preview-page: #f3f6fb;
  --preview-surface: #ffffff;
  --preview-input: #ffffff;
  --preview-text: #0d2f63;
  --preview-muted: #607d8b;
  --preview-border: #d8e3ef;
  --preview-primary: #1e88e5;
  --preview-primary-strong: #0d47a1;
  --preview-primary-soft: #e3f2fd;
  background: var(--preview-page);
}

.dark-preview {
  --preview-page: #071526;
  --preview-surface: #0d2238;
  --preview-input: #071526;
  --preview-text: #f3f6fb;
  --preview-muted: #9fb5c7;
  --preview-border: #1f3f5d;
  --preview-primary: #1e88e5;
  --preview-primary-strong: #64b5f6;
  --preview-primary-soft: rgba(30, 136, 229, 0.18);
  background: var(--preview-page);
}

.preview-header h2,
.preview-card h3 {
  color: var(--preview-text);
}

.preview-header p,
.preview-card p,
.preview-search label {
  color: var(--preview-muted);
}

.preview-search,
.preview-card {
  border: 1px solid var(--preview-border);
  border-radius: var(--radius-lg);
  background: var(--preview-surface);
  padding: var(--space-lg);
}

.preview-search {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-md);
  align-items: end;
}

.preview-search label {
  display: grid;
  gap: var(--space-sm);
  font-weight: 700;
}

.preview-search input {
  width: 100%;
  border: 1px solid var(--preview-border);
  border-radius: var(--radius-sm);
  background: var(--preview-input);
  color: var(--preview-text);
  font: inherit;
  padding: 12px 14px;
}

.preview-search button {
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--preview-primary);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  padding: 13px 18px;
}

.preview-card h3 {
  margin: var(--space-md) 0 var(--space-xs);
  font-size: 1.35rem;
}

.preview-card strong {
  display: block;
  margin-top: var(--space-md);
  color: var(--preview-primary-strong);
  font-size: 1.5rem;
}

.section-block {
  margin-top: var(--space-lg);
  padding: clamp(22px, 4vw, var(--space-xl));
}

.section-heading {
  margin-bottom: var(--space-lg);
}

.section-heading h2,
.usage-notes h2 {
  font-size: clamp(1.7rem, 4vw, 2.6rem);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
}

.color-card {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: 14px;
}

.dark-token-section {
  background: #071526;
  color: #f3f6fb;
}

.dark-token-section .section-heading h2,
.dark-token-section .color-card h3 {
  color: #f3f6fb;
}

.dark-token-section .color-card {
  border-color: #1f3f5d;
  background: #0d2238;
}

.color-swatch {
  width: 64px;
  height: 64px;
  border: 1px solid rgba(13, 47, 99, 0.14);
  border-radius: var(--radius-md);
  background: var(--swatch-color);
}

.color-card h3 {
  margin: 0 0 var(--space-xs);
  color: var(--color-text);
  font-size: 1rem;
}

.color-card p {
  margin: 0 0 6px;
  color: var(--color-muted);
}

.color-card strong {
  color: var(--color-primary);
  font-weight: 600;
}

.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 6px 10px;
}

.usage-notes ul {
  display: grid;
  gap: 10px;
  margin: 18px 0 0;
  padding-left: 20px;
  color: var(--color-muted);
  line-height: 1.7;
}

code {
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  padding: 2px 5px;
}

@media (max-width: 820px) {
  .theme-grid,
  .preview-search {
    grid-template-columns: 1fr;
  }
}
</style>
