<script setup>
defineProps({
    weeklySessions: {
        type: Array,
        default: () => [],
    },
    maxWeeklySessions: {
        type: Number,
        default: 1,
    },
    maxWeeklyConversions: {
        type: Number,
        default: 1,
    },
    weeklyConversionRates: {
        type: Array,
        default: () => [],
    },
    activeReservations: {
        type: Array,
        default: () => [],
    },
    propertyBreakdown: {
        type: Array,
        default: () => [],
    },
    segmentBreakdown: {
        type: Array,
        default: () => [],
    },
    formatDate: {
        type: Function,
        required: true,
    },
    formatMoney: {
        type: Function,
        required: true,
    },
    barHeightStyle: {
        type: Function,
        required: true,
    },
});
</script>

<template>
    <section class="dashboard-grid dashboard-grid--overview">
        <article class="card card-full">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Weekly Sessions &amp; Conversions</h2>
                    <p class="card-sub">Mon – Sun</p>
                </div>

                <div class="legend-inline">
                    <span><i class="swatch swatch--sessions"></i> Sessions</span>
                    <span><i class="swatch swatch--conversions"></i> Conversions</span>
                </div>
            </div>

            <div class="bar-chart bar-chart--dual">
                <div v-for="day in weeklySessions" :key="day.day" class="bar-group">
                    <div class="bar-stack">
                        <div class="bar bar--sessions" :style="barHeightStyle(day.sessions, maxWeeklySessions)"></div>
                        <div class="bar bar--conversions"
                            :style="barHeightStyle(day.conversions, maxWeeklyConversions)"></div>
                    </div>
                    <span class="bar-label">{{ day.day }}</span>
                </div>
            </div>
        </article>

        <article class="card card-full card-wide-split">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Daily Conversion Rate</h2>
                    <p class="card-sub">This week</p>
                </div>

                <span class="badge badge-blue">This week</span>
            </div>

            <div class="rate-list">
                <div v-for="item in weeklyConversionRates" :key="item.day" class="rate-row">
                    <span class="rate-day">{{ item.day }}</span>
                    <div class="rate-track">
                        <div class="rate-fill" :style="{ width: `${item.rate}%` }"></div>
                    </div>
                    <strong class="rate-value">{{ item.rate }}%</strong>
                </div>
            </div>
        </article>

        <article class="card">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Recent Reservations</h2>
                    <p class="card-sub">Latest bookings from your properties</p>
                </div>

                <span class="badge badge-teal">{{ activeReservations.length }} items</span>
            </div>

            <div class="activity-list">
                <div v-for="reservation in activeReservations" :key="reservation.id" class="act-row act-row--compact">
                    <div class="act-body">
                        <p class="act-title">{{ reservation.guestName }}</p>
                        <p class="act-time">{{ reservation.propertyName }} · {{ formatDate(reservation.checkIn) }} to {{
                            formatDate(reservation.checkOut) }}</p>
                    </div>
                    <div class="act-side">
                        <span :class="['badge', `status-${reservation.statusTone}`]">{{ reservation.status }}</span>
                        <strong>{{ formatMoney(reservation.amount || 0) }}</strong>
                    </div>
                </div>
            </div>
        </article>

        <article class="card">
            <div class="card-hdr">
                <div>
                    <h2 class="card-title">Property Mix</h2>
                    <p class="card-sub">Revenue by segment</p>
                </div>

                <span class="badge badge-coral">by %</span>
            </div>

            <div class="seg-bar" aria-hidden="true">
                <div v-for="item in propertyBreakdown" :key="item.id" class="seg"
                    :style="{ flex: item.share, background: item.color }"></div>
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
    </section>
</template>

<style scoped>
.dashboard-grid {
    display: grid;
    gap: 1rem;
}

.dashboard-grid--overview {
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

.card-wide-split {
    min-height: 17rem;
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

.badge-coral {
    background: var(--color-danger-soft);
    color: var(--color-danger);
}

.legend-inline {
    display: flex;
    gap: 1rem;
    color: var(--color-muted);
    font-size: 0.85rem;
}

.legend-inline span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.swatch {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 3px;
    display: inline-block;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}

.swatch--sessions {
    background: var(--color-secondary);
}

.swatch--conversions {
    background: var(--color-primary);
}

.bar-chart {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 0.85rem;
    align-items: end;
    width: 100%;
}

.bar-chart--dual {
    height: 320px;
}

.bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    gap: 0.75rem;
}

.bar-stack {
    width: 100%;
    height: 260px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.6rem;
}

.bar {
    width: 38%;
    border-radius: 0.5rem 0.5rem 0 0;
    min-height: 12px;
    transition: all 0.3s ease;
}

.bar:hover {
    opacity: 0.85;
    transform: translateY(-2px);
}

.bar--sessions {
    background: var(--color-secondary);
}

.bar--conversions {
    background: var(--color-primary);
}

.bar-label {
    color: var(--color-muted);
    font-size: 0.82rem;
    font-weight: 600;
}

.rate-list,
.activity-list {
    display: flex;
    flex-direction: column;
}

.rate-row,
.act-row {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--color-border);
}

.rate-row:last-child,
.act-row:last-child {
    border-bottom: 0;
}

.rate-day {
    width: 2.5rem;
    font-weight: 700;
    flex-shrink: 0;
}

.rate-track {
    flex: 1;
    height: 0.35rem;
    background: var(--color-surface-soft);
    border-radius: 999px;
    overflow: hidden;
}

.rate-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--color-primary);
}

.rate-value {
    width: 3.5rem;
    text-align: right;
}

.act-row--compact {
    padding: 0.85rem 0;
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

.act-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;
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

.seg-bar {
    display: flex;
    height: 0.75rem;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color-surface-soft);
    gap: 2px;
    margin-bottom: 0.75rem;
}

.seg {
    border-radius: 999px;
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

.seg-pct {
    min-width: 3rem;
    text-align: right;
    font-weight: 700;
}

@media (max-width: 1100px) {
    .dashboard-grid--overview {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 760px) {
    .dashboard-grid--overview {
        grid-template-columns: 1fr;
    }

    .rate-row,
    .act-row,
    .seg-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .rate-value,
    .act-side,
    .seg-pct {
        width: auto;
        min-width: 0;
        text-align: left;
        align-items: flex-start;
    }

    .bar-chart {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>