// modules/analytics/stores/OwnerAnalyticsStore.js
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import {
    BuildingOffice2Icon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    StarIcon,
} from '@heroicons/vue/24/outline';

import i18n from '@/app/i18n';
import { analyticsApi } from '@/modules/analytics/api/analytics.api';
import { ownerAnalyticsService } from '@/modules/analytics/services/ownerAnalytics.service';

// ─── Formatters ───────────────────────────────────────────────────────────────
const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});
const integerFormatter = new Intl.NumberFormat('en-US');
const t = (...args) => i18n.global.t(...args);

const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    }).format(parsed);
};

const palette = [
    'var(--color-primary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-danger)',
    'var(--color-info)',
    'var(--color-muted)',
];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAnalyticsDashboardStore = defineStore('owner-analytics-dashboard', () => {
    const loading = ref(true);
    const error = ref(null);
    const selectedYear = ref(new Date().getFullYear());

    const dashboardData = ref({
        summary: {
            totalReservations: 0,
            confirmedReservations: 0,
            completedReservations: 0,
            upcomingReservations: 0,
            totalRevenue: 0,
            paidRevenue: 0,
            netRevenue: 0,
            totalProperties: 0,
            avgRating: 0,
            trends: { properties: '', bookings: '', revenue: '', rating: '' },
        },
        analytics: {
            weeklyTraffic: [],
            monthlyPerformance: [],
            segmentPerformance: [],
            yearlyPerformance: [],
            reservationChart: { labels: [], counts: [], amounts: [] },
        },
        reservationStats: {
            totalReservations: 0,
            totalReservationRevenue: 0,
            byStatus: [],
        },
        paymentStatus: { isComplete: true, missingFields: [], lastUpdated: null },
        properties: [],
        rooms: [],
        recentReservations: [],
    });

    // បញ្ជីផ្ទុកទិន្នន័យកក់បន្ទប់ថ្មីៗពី Postman API
    const recentBookingsList = ref([]);
    const allReservationsList = ref([]);

    // ── Year Options ─────────────────────────────────────────────────────────
    const yearOptions = computed(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    });
    const selectedYearLabel = computed(() => selectedYear.value || yearOptions.value[0]);

    // ── Summary Cards ────────────────────────────────────────────────────────
    const summaryCards = computed(() => {
        const s = dashboardData.value.summary || {};
        return [
            {
                label: t('owner.analytics.summary.totalProperties'),
                value: integerFormatter.format(s.totalProperties || 0),
                delta: s.trends?.properties || '',
                tone: 'blue',
                icon: BuildingOffice2Icon,
                kind: 'number',
            },
            {
                label: t('owner.analytics.summary.totalBookings'),
                value: integerFormatter.format(s.totalReservations || 0),
                delta: s.trends?.bookings || '',
                tone: 'teal',
                icon: CalendarDaysIcon,
                kind: 'number',
            },
            {
                label: t('owner.analytics.summary.totalRevenue'),
                value: formatMoney(s.totalRevenue || 0),
                delta: s.trends?.revenue || '',
                tone: 'amber',
                icon: CurrencyDollarIcon,
                kind: 'currency',
            },
            {
                label: t('owner.analytics.summary.paidRevenue'),
                value: formatMoney(s.paidRevenue || 0),
                delta: s.trends?.revenue || '',
                tone: 'amber',
                icon: CurrencyDollarIcon,
                kind: 'currency',
            },
        ];
    });

    // ── Line chart ───────────────────────────────────────────────────────────
    const visibleMonthlySeries = computed(() => {
        const chart = dashboardData.value.analytics?.reservationChart || {};
        const labels = chart.labels || [];
        const amounts = chart.amounts || [];

        return labels.map((label, i) => ({
            label,
            profit: amounts[i] || 0,
        }));
    });

    // ── Segment breakdown (Donut chart) ──────────────────────────────────────
    const propertyBreakdown = computed(() => {
        const source = dashboardData.value.analytics?.segmentPerformance || [];

        if (source.length > 0) {
            const total = source.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
            return source.map((item, i) => ({
                id: item.name,
                name: item.name,
                type: item.name,
                revenue: Number(item.value) || 0,
                share: Math.round(((Number(item.value) || 0) / total) * 100),
                color: palette[i % palette.length],
            }));
        }

        const properties = dashboardData.value.properties || [];
        const totalRevenue = properties.reduce((s, p) => s + (Number(p.revenue) || 0), 0) || 1;
        const paidRevenue = properties.reduce((s, p) => s + (Number(p.revenue) || 0), 0) || 1;
        return properties.slice(0, 4).map((p, i) => ({
            id: p.id,
            name: p.name,
            type: p.name,
            revenue: Number(p.revenue) || 0,
            share: Math.round(((Number(p.revenue) || 0) / totalRevenue) * 100),
            shard: Math.round(((Number(p.revenue) || 0) / paidRevenue) * 100),
            color: palette[i % palette.length],
        })).sort((a, b) => b.revenue - a.revenue);
    });

    const segmentBreakdown = computed(() => propertyBreakdown.value.slice(0, 4));

    // ── Fetch Data ───────────────────────────────────────────────────────────
    const fetchDashboardData = async () => {
        loading.value = true;
        error.value = null;

        const params = {
            start_date: `${selectedYear.value}-01-01`,
            end_date: `${selectedYear.value}-12-31`
        };

        try {
            const [summary, revenue, properties, rooms, reservations, latestRes] = await Promise.all([
                analyticsApi.getOwnerSummary(params),
                analyticsApi.getOwnerRevenue(params),
                analyticsApi.getOwnerProperties(params),
                analyticsApi.getOwnerRooms(params),
                analyticsApi.getOwnerReservations(params),
                analyticsApi.getOwnerReservationLatest(params),
            ]);

            // ១. ចម្បងទិន្នន័យស្ថិតិរួមសម្រាប់ Dashboard
            dashboardData.value = ownerAnalyticsService.processDashboardData({
                summary, revenue, properties, rooms, reservations
            });

            // ២. ចម្បងបញ្ជីទិន្នន័យនៃការកក់ថ្មីៗដែលទាញចេញពី Postman
            recentBookingsList.value = ownerAnalyticsService.processLatestReservations(latestRes);
            allReservationsList.value = ownerAnalyticsService.extractRawReservations(latestRes);

        } catch (err) {
            error.value = i18n.global.t('owner.analytics.error.failedToLoadDashboardData');
            console.error('Owner Analytics Fetch Error:', err);
        } finally {
            loading.value = false;
        }
    };

    watch(selectedYear, () => { void fetchDashboardData(); });
    void fetchDashboardData();

    return {
        loading,
        error,
        dashboardData,
        selectedYear,
        yearOptions,
        selectedYearLabel,
        summaryCards,
        visibleMonthlySeries,
        segmentBreakdown,
        recentBookingsList,
        allReservationsList,
        fetchDashboardData,
        formatMoney,
        formatDate,
    };
});