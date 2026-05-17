<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import '@/assets/styles/variables.css';
import {
    HomeIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    StarIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/vue/24/outline'

const loading = ref(true);
const error = ref(null);
const activeTab = ref('overview');
const monthWindow = ref(6);

const dashboardData = ref({
    summary: {
        totalProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        avgRating: 0,
        trends: {
            properties: '',
            bookings: '',
            revenue: '',
            rating: '',
        },
    },
    analytics: {
        weeklyTraffic: [],
        monthlyPerformance: [],
        segmentPerformance: [],
    },
    paymentStatus: {
        isComplete: true,
        missingFields: [],
        lastUpdated: null,
    },
    properties: [],
    recentReservations: [],
});

const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'traffic', label: 'Traffic' },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const palette = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-info)', 'var(--color-muted)'];

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat('en-US');

const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

const analyticsData = computed(() => dashboardData.value.analytics || {});

const deriveMonthlyPerformance = () => {
    const summary = dashboardData.value.summary || {};
    const properties = dashboardData.value.properties || [];
    const reservations = dashboardData.value.recentReservations || [];
    const totalRevenue = Number(summary.totalRevenue) || properties.reduce((sum, property) => sum + (Number(property.revenue) || 0), 0);
    const baseRevenue = Math.max(totalRevenue, 6000) / 6;
    const reservationMix = Math.max(reservations.reduce((sum, reservation) => sum + (Number(reservation.amount) || 0), 0), 1);
    const factors = [0.84, 0.91, 0.89, 0.86, 1.02, 1.08];

    return months.slice(0, 6).map((label, index) => {
        const revenue = Math.round(baseRevenue * factors[index] + (reservationMix / 100));
        const expenses = Math.round(revenue * (0.52 + (index * 0.015)));

        return {
            label,
            revenue,
            expenses,
            profit: revenue - expenses,
        };
    });
};

const buildChartPoints = (values, width = 640, height = 220, padding = 24) => {
    const safeValues = values.length ? values : [0];
    const maxValue = Math.max(...safeValues, 1);
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    return safeValues.map((value, index) => {
        const x = padding + (innerWidth * index) / Math.max(safeValues.length - 1, 1);
        const y = padding + innerHeight - (value / maxValue) * innerHeight;

        return { x, y };
    });
};

const buildLinePath = (points) => {
    if (!points.length) return '';

    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
};

const buildAreaPath = (points, height = 220, padding = 24) => {
    if (!points.length) return '';

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    return `${buildLinePath(points)} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
};

const fetchDashboardData = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch('/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        dashboardData.value = await response.json();
    } catch (fetchError) {
        error.value = 'Failed to load dashboard data. Ensure data.json is present.';
        console.error('Dashboard Fetch Error:', fetchError);
    } finally {
        loading.value = false;
    }
};

const summaryCards = computed(() => {
    const summary = dashboardData.value.summary || {};

    return [
        {
            label: 'Total Properties',
            value: integerFormatter.format(summary.totalProperties || 0),
            delta: summary.trends?.properties || '',
            tone: 'blue',
            icon: HomeIcon,
        },
        {
            label: 'Total Bookings',
            value: integerFormatter.format(summary.totalBookings || 0),
            delta: summary.trends?.bookings || '',
            tone: 'teal',
            icon: CalendarDaysIcon,
        },
        {
            label: 'Total Revenue',
            value: formatMoney(summary.totalRevenue || 0),
            delta: summary.trends?.revenue || '',
            tone: 'amber',
            icon: CurrencyDollarIcon,
        },
        {
            label: 'Avg Rating',
            value: `${Number(summary.avgRating || 0).toFixed(1)}★`,
            delta: summary.trends?.rating || '',
            tone: 'coral',
            icon: StarIcon,
        },
    ];
});

const monthlySeries = computed(() => {
    const source = analyticsData.value.monthlyPerformance;

    if (Array.isArray(source) && source.length > 0) {
        return source.map((item) => ({
            label: item.label,
            revenue: Number(item.revenue) || 0,
            expenses: Number(item.expenses) || 0,
            profit: Number(item.profit) || (Number(item.revenue) || 0) - (Number(item.expenses) || 0),
        }));
    }

    return deriveMonthlyPerformance();
});
const visibleMonthlySeries = computed(() => monthlySeries.value.slice(0, monthWindow.value));

const revenuePoints = computed(() => buildChartPoints(visibleMonthlySeries.value.map((item) => item.revenue)));
const revenueLinePath = computed(() => buildLinePath(revenuePoints.value));
const revenueAreaPath = computed(() => buildAreaPath(revenuePoints.value));

const profitPoints = computed(() => buildChartPoints(visibleMonthlySeries.value.map((item) => item.profit)));
const profitLinePath = computed(() => buildLinePath(profitPoints.value));
const profitAreaPath = computed(() => buildAreaPath(profitPoints.value));

const deriveWeeklyTraffic = () => {
    const reservations = dashboardData.value.recentReservations || [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = weekdays.map((day) => ({ day, sessions: 0, conversions: 0 }));

    reservations.forEach((reservation) => {
        const dayIndex = new Date(reservation.checkIn).getDay();
        const bucket = buckets[dayIndex];

        bucket.sessions += 12;
        bucket.conversions += ['paid', 'confirmed'].includes(String(reservation.status).toLowerCase()) ? 8 : 4;
        bucket.sessions += Math.min(Math.round((Number(reservation.amount) || 0) / 60), 18);
        bucket.conversions += Math.min(Math.round((Number(reservation.amount) || 0) / 140), 10);
    });

    return buckets.filter((item) => item.day !== 'Sun' || item.sessions > 0 || item.conversions > 0)
        .slice(1)
        .map((item, index) => ({
            day: weekdays[index + 1],
            sessions: Math.max(item.sessions, 18 + index * 6),
            conversions: Math.max(item.conversions, 8 + index * 4),
        }));
};

const weeklySessions = computed(() => {
    const source = analyticsData.value.weeklyTraffic;

    if (Array.isArray(source) && source.length > 0) {
        return source.map((item) => ({
            day: item.day,
            sessions: Number(item.sessions) || 0,
            conversions: Number(item.conversions) || 0,
        }));
    }

    return deriveWeeklyTraffic();
});

const weeklySessionsPoints = computed(() => ({
    sessions: buildChartPoints(weeklySessions.value.map((item) => item.sessions), 640, 240, 28),
    conversions: buildChartPoints(weeklySessions.value.map((item) => item.conversions), 640, 240, 28),
}));

const weeklyConversionRates = computed(() =>
    weeklySessions.value.map((item) => ({
        day: item.day,
        rate: Math.round((item.conversions / Math.max(item.sessions, 1)) * 100),
    })),
);

const propertyBreakdown = computed(() => {
    const source = analyticsData.value.segmentPerformance;

    if (Array.isArray(source) && source.length > 0) {
        const total = source.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;

        return source.map((item, index) => ({
            id: item.name,
            name: item.name,
            type: item.name,
            revenue: Number(item.value) || 0,
            share: Math.round(((Number(item.value) || 0) / total) * 100),
            color: palette[index % palette.length],
        }));
    }

    const properties = dashboardData.value.properties || [];
    const totalRevenue = properties.reduce((sum, property) => sum + (Number(property.revenue) || 0), 0) || 1;

    return properties
        .slice(0, 4)
        .map((property, index) => ({
            id: property.id,
            name: property.type,
            type: property.location,
            revenue: Number(property.revenue) || 0,
            share: Math.round(((Number(property.revenue) || 0) / totalRevenue) * 100),
            color: palette[index % palette.length],
        }))
        .sort((left, right) => right.revenue - left.revenue);
});

const segmentBreakdown = computed(() => propertyBreakdown.value.slice(0, 4));

const reservationRows = computed(() => (dashboardData.value.recentReservations || []).slice(0, 5));

const activityFeed = computed(() => {
    const feed = [];
    const reservations = dashboardData.value.recentReservations || [];
    const properties = dashboardData.value.properties || [];

    if (dashboardData.value.paymentStatus && !dashboardData.value.paymentStatus.isComplete) {
        feed.push({
            icon: 'ExclamationTriangleIcon',
            bg: '#FAEEDA',
            title: 'Payment account setup is incomplete',
            time: 'Needs attention',
            amount: 'Pending',
            tone: 'warning',
        });
    }

    reservations.slice(0, 3).forEach((reservation) => {
        feed.push({
            icon: 'DocumentTextIcon',
            bg: '#E6F1FB',
            title: `${reservation.guestName} booked ${reservation.propertyName}`,
            time: formatDate(reservation.checkIn),
            amount: formatMoney(reservation.amount || 0),
            tone: 'info',
        });
    });

    properties.slice(0, 2).forEach((property) => {
        feed.push({
            icon: property.status === 'Approved' ? CheckCircleIcon : ClockIcon,
            bg: property.status === 'Approved' ? '#E1F5EE' : '#FAEEDA',
            title: `${property.name} is ${property.status.toLowerCase()}`,
            time: property.location,
            amount: formatMoney(property.revenue || 0),
            tone: property.status === 'Approved' ? 'success' : 'warning',
        });
    });

    return feed;
});

const activeReservations = computed(() =>
    reservationRows.value.map((reservation) => ({
        ...reservation,
        statusTone: reservation.status === 'cancelled' ? 'danger' : reservation.status === 'paid' ? 'success' : 'warning',
    })),
);

const propertyStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'approved') return 'badge badge-teal';
    if (normalized === 'pending') return 'badge badge-amber';
    return 'badge badge-coral';
};

const barHeightStyle = (value, maxValue) => ({
    height: `${Math.max((Number(value) / Math.max(maxValue, 1)) * 100, 8)}%`,
});

const barOffsetStyle = (value, maxValue) => ({
    top: `${100 - Math.max((Number(value) / Math.max(maxValue, 1)) * 100, 8)}%`,
});

const maxRevenueValue = computed(() => Math.max(...visibleMonthlySeries.value.map((item) => item.revenue), 1));
const maxExpenseValue = computed(() => Math.max(...visibleMonthlySeries.value.map((item) => item.expenses), 1));
const maxWeeklySessions = computed(() => Math.max(...weeklySessions.value.map((item) => item.sessions), 1));
const maxWeeklyConversions = computed(() => Math.max(...weeklySessions.value.map((item) => item.conversions), 1));

onMounted(fetchDashboardData);
</script>

<template>
    <main class="owner-dashboard mt-25">
        <div v-if="loading" class="dashboard-state">
            <div class="loader"></div>
            <p>Loading owner dashboard...</p>
        </div>

        <div v-else-if="error" class="dashboard-state dashboard-state--error">
            <p>{{ error }}</p>
            <button type="button" class="retry-button" @click="fetchDashboardData">Retry</button>
        </div>

        <template v-else>
            <header class="topbar">
                <div>
                    <p class="eyebrow">May 2026 · Live data</p>
                    <h1 class="text-3xl font-semibold text-(--color-text)">Analytics Dashboard</h1>
                    <p class="topbar-subtitle">Track revenue, booking traffic, and property performance from one place.
                    </p>
                </div>

                <div class="topbar-actions">
                    <nav class="tabs" aria-label="Dashboard sections">
                        <button v-for="tab in tabs" :key="tab.key" type="button" class="tab"
                            :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
                            {{ tab.label }}
                        </button>
                    </nav>
                </div>
            </header>

            <section class="metrics" aria-label="Summary metrics">
                <article v-for="card in summaryCards" :key="card.label" class="metric">
                    <div class="metric__icon" :class="`metric__icon--${card.tone}`">
                        <component :is="card.icon" class="h-6 w-6" />
                    </div>
                    <div>
                        <p class="metric__label">{{ card.label }}</p>
                        <p class="metric__value">{{ card.value }}</p>
                        <p class="metric__delta">{{ card.delta }}</p>
                    </div>
                </article>
            </section>

            <section v-if="activeTab === 'overview'" class="dashboard-grid dashboard-grid--overview">
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
                                <div class="bar bar--sessions" :style="barHeightStyle(day.sessions, maxWeeklySessions)">
                                </div>
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
                        <div v-for="reservation in activeReservations" :key="reservation.id"
                            class="act-row act-row--compact">
                            <div class="act-body">
                                <p class="act-title">{{ reservation.guestName }}</p>
                                <p class="act-time">{{ reservation.propertyName }} · {{ formatDate(reservation.checkIn)
                                    }} to {{ formatDate(reservation.checkOut) }}</p>
                            </div>
                            <div class="act-side">
                                <span :class="['badge', `status-${reservation.statusTone}`]">{{ reservation.status
                                    }}</span>
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
                                <div class="progress-inner"
                                    :style="{ width: `${item.share}%`, background: item.color }"></div>
                            </div>
                            <strong class="seg-pct">{{ item.share }}%</strong>
                        </div>
                    </div>
                </article>
            </section>

            <section v-if="activeTab === 'revenue'" class="dashboard-grid dashboard-grid--revenue">
                <article class="card card-full">
                    <div class="card-hdr">
                        <div>
                            <h2 class="card-title">Profit Trend</h2>
                            <p class="card-sub">Net profit over time</p>
                        </div>

                        <label class="range-wrap">
                            <span class="badge badge-blue">Net Profit</span>
                            <span>{{ monthWindow }}mo</span>
                            <input v-model="monthWindow" type="range" min="4" max="12" step="1" />
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
                            <path :d="profitLinePath" fill="none" stroke="#1D9E75" stroke-width="3"
                                stroke-linecap="round" stroke-linejoin="round"></path>
                            <circle v-for="point in profitPoints" :key="`${point.x}-${point.y}`" :cx="point.x"
                                :cy="point.y" r="4" fill="#1D9E75"></circle>
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
                                <div class="progress-inner"
                                    :style="{ width: `${item.share}%`, background: item.color }"></div>
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
                            <span>{{ monthWindow }}mo</span>
                            <input v-model="monthWindow" type="range" min="4" max="12" step="1" />
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

            <section v-if="activeTab === 'traffic'" class="dashboard-grid dashboard-grid--traffic">
                <article class="card card-full">
                    <div class="card-hdr">
                        <div>
                            <h2 class="card-title">Traffic Overview</h2>
                            <p class="card-sub">Weekly sessions &amp; conversions</p>
                        </div>

                        <div class="legend-inline">
                            <span><i class="swatch swatch--sessions"></i> Sessions</span>
                            <span><i class="swatch swatch--conversions"></i> Conversions</span>
                        </div>
                    </div>

                    <div class="bar-chart bar-chart--dual bar-chart--tall">
                        <div v-for="day in weeklySessions" :key="day.day" class="bar-group">
                            <div class="bar-stack">
                                <div class="bar bar--sessions" :style="barHeightStyle(day.sessions, maxWeeklySessions)">
                                </div>
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
                            <h2 class="card-title">Property Mix</h2>
                            <p class="card-sub">Revenue by segment</p>
                        </div>

                        <span class="badge badge-coral">by %</span>
                    </div>

                    <div class="seg-bar seg-bar--wide" aria-hidden="true">
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
                                <div class="progress-inner"
                                    :style="{ width: `${item.share}%`, background: item.color }"></div>
                            </div>
                            <strong class="seg-pct">{{ item.share }}%</strong>
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
                        <div v-for="reservation in activeReservations" :key="reservation.id"
                            class="act-row act-row--compact">
                            <div class="act-body">
                                <p class="act-title">{{ reservation.guestName }}</p>
                                <p class="act-time">{{ reservation.propertyName }} · {{ formatDate(reservation.checkIn)
                                    }} to {{ formatDate(reservation.checkOut) }}</p>
                            </div>
                            <div class="act-side">
                                <span :class="['badge', `status-${reservation.statusTone}`]">{{ reservation.status
                                    }}</span>
                                <strong>{{ formatMoney(reservation.amount || 0) }}</strong>
                            </div>
                        </div>
                    </div>
                </article>

                <article class="card card-full">
                    <div class="card-hdr">
                        <div>
                            <h2 class="card-title">Profit Trend</h2>
                            <p class="card-sub">Net profit over time</p>
                        </div>

                        <label class="range-wrap">
                            <span class="badge badge-blue">Net Profit</span>
                            <span>{{ monthWindow }}mo</span>
                            <input v-model="monthWindow" type="range" min="4" max="12" step="1" />
                        </label>
                    </div>

                    <div class="chart-shell">
                        <svg viewBox="0 0 640 220" class="chart-svg" role="img" aria-label="Profit trend chart">
                            <defs>
                                <linearGradient id="profitFillTraffic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="rgba(29, 158, 117, 0.32)" />
                                    <stop offset="100%" stop-color="rgba(29, 158, 117, 0.04)" />
                                </linearGradient>
                            </defs>
                            <path :d="profitAreaPath" fill="url(#profitFillTraffic)"></path>
                            <path :d="profitLinePath" fill="none" stroke="#1D9E75" stroke-width="3"
                                stroke-linecap="round" stroke-linejoin="round"></path>
                            <circle v-for="point in profitPoints" :key="`${point.x}-${point.y}`" :cx="point.x"
                                :cy="point.y" r="4" fill="#1D9E75"></circle>
                        </svg>

                        <div class="chart-axis chart-axis--compact">
                            <span v-for="item in visibleMonthlySeries" :key="item.label">{{ item.label }}</span>
                        </div>
                    </div>
                </article>
            </section>

            <div v-if="dashboardData.paymentStatus && !dashboardData.paymentStatus.isComplete" class="payment-note">
                <div>
                    <p class="payment-note__title">Payment account setup is incomplete</p>
                    <p class="payment-note__text">Finish the missing fields to receive earnings from confirmed bookings.
                    </p>
                </div>
                <RouterLink class="payment-note__link" to="/owner/payment-accounts">Complete setup</RouterLink>
            </div>
        </template>
    </main>
</template>

<style scoped>
.owner-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    color: var(--color-text);
}

.dashboard-state {
    min-height: 48vh;
    display: grid;
    place-items: center;
    gap: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-surface);
}

.dashboard-state--error {
    color: var(--color-danger, #c53030);
    padding: 2rem;
}

.retry-button {
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.25rem;
    font-weight: 700;
    cursor: pointer;
    background: var(--color-primary);
    color: white;
}

.topbar {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
}

.eyebrow {
    margin: 0 0 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    color: var(--color-muted);
}

.topbar-subtitle {
    margin: 0.4rem 0 0;
    color: var(--color-muted);
    max-width: 56ch;
}

.topbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
    align-items: center;
}

.tabs {
    display: flex;
    gap: 0.35rem;
    padding: 0.35rem;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-soft);
}

.tab {
    border: 0;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    background: transparent;
    color: var(--color-muted);
    cursor: pointer;
    font-weight: 600;
}

.tab.active {
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-card);
}

.button-plus {
    font-size: 1rem;
    line-height: 1;
}

.metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.metric {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
}

.metric__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.metric__icon--blue {
    background: var(--color-primary-soft);
}

.metric__icon--teal {
    background: var(--color-success-soft);
}

.metric__icon--amber {
    background: var(--color-warning-soft);
}

.metric__icon--coral {
    background: var(--color-danger-soft);
}

.metric__label {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.85rem;
}

.metric__value {
    margin: 0.15rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.metric__delta {
    margin: 0.15rem 0 0;
    color: #1d9e75;
    font-size: 0.85rem;
}

.dashboard-grid {
    display: grid;
    gap: 1rem;
}

.dashboard-grid--overview,
.dashboard-grid--revenue,
.dashboard-grid--traffic {
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

.badge-amber {
    background: var(--color-warning-soft);
    color: var(--color-warning);
}

.badge-coral {
    background: var(--color-danger-soft);
    color: var(--color-danger);
}

.status-success {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.status-warning {
    background: var(--color-warning-soft);
    color:var(--color-warning);
}

.status-danger {
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


.bar-chart--paired {
    height: 340px;
}

.bar-chart--tall {
    height: 380px;
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

.seg-bar {
    display: flex;
    height: 0.75rem;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color-surface-soft);
    gap: 2px;
    margin-bottom: 0.75rem;
}

.seg-bar--wide {
    margin-bottom: 1rem;
}

.seg {
    border-radius: 999px;
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
    background: var(--color-warning);
}

.rate-value {
    width: 3.5rem;
    text-align: right;
}

.act-row--compact {
    padding: 0.85rem 0;
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

.act-title,
.property-name {
    margin: 0;
    font-weight: 700;
}

.act-time,
.property-location {
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

.payment-note {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-top: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    background: var(--color-warning-soft);
    border: 1px solid var(--color-warning);
}

.payment-note__title {
    margin: 0;
    font-weight: 700;
}

.payment-note__text {
    margin: 0.25rem 0 0;
    color: var(--color-muted);
}

.payment-note__link {
    flex-shrink: 0;
    padding: 0.7rem 1rem;
    border-radius: 999px;
    text-decoration: none;
    background: var(--color-primary);
    color: var(--color-surface);
    font-weight: 700;
}

.loader {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 3px solid rgba(55, 138, 221, 0.15);
    border-top-color: var(--color-primary);
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 1100px) {

    .metrics,
    .dashboard-grid--overview,
    .dashboard-grid--revenue,
    .dashboard-grid--traffic {
        grid-template-columns: 1fr 1fr;
    }

    .topbar {
        flex-direction: column;
    }

    .topbar-actions {
        justify-content: flex-start;
    }
}

@media (max-width: 760px) {

    .metrics,
    .dashboard-grid--overview,
    .dashboard-grid--revenue,
    .dashboard-grid--traffic {
        grid-template-columns: 1fr;
    }

    .topbar-actions,
    .payment-note,
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

    .tabs {
        flex-wrap: wrap;
    }

    .bar-chart {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>