<script setup>
defineProps({
    modelValue: {
        type: Number,
        default: 6,
    },
    visibleMonthlySeries: {
        type: Array,
        default: () => [],
    },
    profitPoints: {
        type: Array,
        default: () => [],
    },
    profitLinePath: {
        type: String,
        default: '',
    },
    profitAreaPath: {
        type: String,
        default: '',
    },
    activityFeed: {
        type: Array,
        default: () => [],
    },
    segmentBreakdown: {
        type: Array,
        default: () => [],
    },
    maxRevenueValue: {
        type: Number,
        default: 1,
    },
    maxExpenseValue: {
        type: Number,
        default: 1,
    },
    barHeightStyle: {
        type: Function,
        required: true,
    },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <section class="dashboard-grid dashboard-grid--revenue">
        <article class="card card-full">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Profit Trend</h2>
                    <p class="card-sub">Net profit over time</p>
                </div>

                <label class="range-wrap">
                    <span class="badge badge-blue">Net Profit</span>
                    <span>{{ modelValue }}mo</span>
                    <input :value="modelValue" type="range" min="4" max="12" step="1"
                        @input="emit('update:modelValue', Number($event.target.value))" />
                </label>
            </div>

            <div class="chart-shell">
                <svg viewBox="0 0 640 220" class="chart-svg" role="img" aria-label="Profit trend chart">
                    <defs>
                        <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgba(29, 158, 117, 0.32)" />
                            <stop offset="100%" stop-color="rgba(29, 158, 117, 0.04)" />
                        </linearGradient>
                    </defs>
                    <path :d="profitAreaPath" fill="url(#profitFill)"></path>
                    <path :d="profitLinePath" fill="none" stroke="#1D9E75" stroke-width="3" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    <circle v-for="point in profitPoints" :key="`${point.x}-${point.y}`" :cx="point.x" :cy="point.y"
                        r="4" fill="#1D9E75"></circle>
                </svg>

                <div class="chart-axis chart-axis--compact">
                    <span v-for="item in visibleMonthlySeries" :key="item.label">{{ item.label }}</span>
                </div>
            </div>
        </article>

        <article class="card">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Revenue by Segment</h2>
                    <p class="card-sub">Current quarter</p>
                </div>

                <span class="badge badge-teal">Q2 2026</span>
            </div>

            <div class="seg-ring">
                <div v-for="item in segmentBreakdown" :key="item.id" class="seg-ring__slice"
                    :style="{ background: item.color, flex: item.share }"></div>
            </div>

            <div class="seg-labels seg-labels--wide">
                <div v-for="item in segmentBreakdown" :key="item.id" class="seg-row">
                    <span class="seg-name">
                        <i class="swatch" :style="{ background: item.color }"></i>
                        {{ item.name }}
                    </span>
                    <div class="progress-outer">
                        <div class="progress-inner" :style="{ width: `${item.share}%`, background: item.color }"></div>
                    </div>
                    <strong class="seg-pct">{{ item.share }}%</strong>
                </div>
            </div>
        </article>

        <article class="card">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Recent Activity</h2>
                    <p class="card-sub">Last 24 hours</p>
                </div>

                <span class="badge badge-amber">Live</span>
            </div>

            <div class="activity-list">
                <div v-for="item in activityFeed" :key="`${item.title}-${item.time}`" class="act-row">
                    <div class="act-icon" :style="{ background: item.bg }">
                        <component :is="item.icon" class="h-5 w-5" />
                    </div>
                    <div class="act-body">
                        <p class="act-title">{{ item.title }}</p>
                        <p class="act-time">{{ item.time }}</p>
                    </div>
                    <strong class="act-amt" :class="`act-amt--${item.tone}`">{{ item.amount }}</strong>
                </div>
            </div>
        </article>

        <article class="card card-full">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Revenue vs Expenses</h2>
                    <p class="card-sub">Monthly breakdown</p>
                </div>

                <label class="range-wrap">
                    <span>{{ modelValue }}mo</span>
                    <input :value="modelValue" type="range" min="4" max="12" step="1"
                        @input="emit('update:modelValue', Number($event.target.value))" />
                </label>
            </div>

            <div class="bar-chart bar-chart--paired">
                <div v-for="item in visibleMonthlySeries" :key="item.label" class="bar-group bar-group--paired">
                    <div class="paired-bars">
                        <div class="paired-bar paired-bar--revenue"
                            :style="barHeightStyle(item.revenue, maxRevenueValue)"></div>
                        <div class="paired-bar paired-bar--expense"
                            :style="barHeightStyle(item.expenses, maxExpenseValue)"></div>
                    </div>
                    <span class="bar-label">{{ item.label }}</span>
                </div>
            </div>
        </article>
    </section>
</template>

<style scoped>
.dashboard-grid {
    display: grid;
    gap: 1rem;
}

.dashboard-grid--revenue {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card {
    border: 1px solid var(--color-border);
    border-radius: 22px;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    padding: 1.15rem;
}

.card-full {
    grid-column: 1 / -1;
}

.card-hdr {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
}

.card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
}

.card-sub {
    margin: 0.2rem 0 0;
    color: var(--color-muted);
    font-size: 0.9rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
}

.badge-blue {
    background: var(--color-primary-soft);
    color: var(--color-primary);
}

.badge-teal {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.badge-amber {
    background: var(--color-warning-soft);
    color: var(--color-warning);
}

.chart-shell {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.chart-svg {
    width: 100%;
    height: auto;
}

.chart-axis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
    gap: 0.35rem;
    color: var(--color-muted);
    font-size: 0.78rem;
}

.chart-axis--compact {
    margin-top: -0.25rem;
}

.range-wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-muted);
    white-space: nowrap;
}

.range-wrap input[type='range'] {
    accent-color: var(--color-primary);
}

.seg-ring {
    width: min(100%, 15rem);
    aspect-ratio: 1;
    margin: 0 auto 1rem;
    display: flex;
    border-radius: 50%;
    overflow: hidden;
}

.seg-ring__slice {
    min-width: 0;
}

.seg-labels {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.seg-labels--wide {
    margin-top: 0.25rem;
}

.seg-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.seg-name {
    width: 6rem;
    color: var(--color-muted);
    font-size: 0.85rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
}

.swatch {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 3px;
    display: inline-block;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}

.seg-pct {
    min-width: 3rem;
    text-align: right;
    font-weight: 700;
}

.progress-outer {
    flex: 1;
    height: 0.38rem;
    border-radius: 999px;
    background: var(--color-surface-soft);
    overflow: hidden;
}

.progress-inner {
    height: 100%;
    border-radius: inherit;
}

.activity-list {
    display: flex;
    flex-direction: column;
}

.act-row {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--color-border);
}

.act-row:last-child {
    border-bottom: 0;
}

.act-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.8rem;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}

.act-body {
    flex: 1;
    min-width: 0;
}

.act-title {
    margin: 0;
    font-weight: 700;
}

.act-time {
    margin: 0.2rem 0 0;
    color: var(--color-muted);
    font-size: 0.88rem;
}

.act-amt {
    font-size: 0.95rem;
}

.act-amt--success {
    color: var(--color-success);
}

.act-amt--warning {
    color: var(--color-warning);
}

.act-amt--info {
    color: var(--color-info);
}

.bar-chart {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 0.85rem;
    align-items: end;
    width: 100%;
}

.bar-chart--paired {
    height: 340px;
}

.bar-group--paired {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    gap: 0.75rem;
}

.paired-bars {
    width: 100%;
    height: 280px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.8rem;
}

.paired-bar {
    width: 40%;
    border-radius: 0.5rem 0.5rem 0 0;
    min-height: 12px;
    transition: all 0.3s ease;
}

.paired-bar:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

.paired-bar--revenue {
    background: var(--color-secondary);
}

.paired-bar--expense {
    background: var(--color-primary);
}

.bar-label {
    color: var(--color-muted);
    font-size: 0.82rem;
    font-weight: 600;
}

@media (max-width: 1100px) {
    .dashboard-grid--revenue {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 760px) {
    .dashboard-grid--revenue {
        grid-template-columns: 1fr;
    }

    .seg-row,
    .act-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .seg-pct {
        width: auto;
        min-width: 0;
        text-align: left;
    }

    .bar-chart {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>