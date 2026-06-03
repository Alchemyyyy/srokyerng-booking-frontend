import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
    HomeIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    StarIcon,
} from '@heroicons/vue/24/outline';

import i18n from '@/app/i18n';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const palette = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-info)', 'var(--color-muted)'];

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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

export const useAnalyticsDashboardStore = defineStore('owner-analytics-dashboard', () => {
    const loading = ref(true);
    const error = ref(null);
    const selectedYear = ref(null);
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
        rooms: [],
        recentReservations: [],
    });

    const analyticsData = computed(() => dashboardData.value.analytics || {});

    const yearlyPerformance = computed(() => {
        const source = analyticsData.value.yearlyPerformance;

        if (!Array.isArray(source)) {
            return [];
        }

        return source
            .map((entry) => ({
                year: Number(entry.year) || 0,
                summary: entry.summary || null,
                segmentPerformance: Array.isArray(entry.segmentPerformance) ? entry.segmentPerformance : [],
                monthlyPerformance: Array.isArray(entry.monthlyPerformance)
                    ? entry.monthlyPerformance.map((item) => ({
                        label: item.label,
                        revenue: Number(item.revenue) || 0,
                        expenses: Number(item.expenses) || 0,
                        profit: Number(item.profit) || (Number(item.revenue) || 0) - (Number(item.expenses) || 0),
                    }))
                    : [],
            }))
            .filter((entry) => entry.year > 0);
    });

    const yearOptions = computed(() => [...new Set(yearlyPerformance.value.map((entry) => entry.year))].sort((left, right) => right - left));

    const selectedYearEntry = computed(() => {
        const availableYears = yearlyPerformance.value;

        if (!availableYears.length) {
            return null;
        }

        const fallbackYear = yearOptions.value[0] || new Date().getFullYear();
        const targetYear = Number(selectedYear.value) || fallbackYear;

        return availableYears.find((entry) => entry.year === targetYear) || availableYears[0];
    });

    const selectedYearLabel = computed(() => selectedYearEntry.value?.year || selectedYear.value || yearOptions.value[0] || new Date().getFullYear());

    const selectedYearSummary = computed(() => {
        const summary = selectedYearEntry.value?.summary || dashboardData.value.summary || {};
        const properties = dashboardData.value.properties || [];

        return {
            ...summary,
            totalProperties: properties.length,
        };
    });

    const selectedYearSegments = computed(() => {
        const selectedYearPerformance = selectedYearEntry.value?.segmentPerformance;

        if (Array.isArray(selectedYearPerformance) && selectedYearPerformance.length > 0) {
            const total = selectedYearPerformance.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;

            return selectedYearPerformance.map((item, index) => ({
                id: item.name,
                name: item.name,
                type: item.name,
                revenue: Number(item.value) || 0,
                share: Math.round(((Number(item.value) || 0) / total) * 100),
                color: palette[index % palette.length],
            }));
        }

        return [];
    });

    const selectedYearSeries = computed(() => {
        if (selectedYearEntry.value) {
            return selectedYearEntry.value.monthlyPerformance;
        }

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

    const visibleMonthlySeries = computed(() => selectedYearSeries.value);

    const propertyBreakdown = computed(() => selectedYearSegments.value.length > 0
        ? selectedYearSegments.value
        : (() => {
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
        })());

    const segmentBreakdown = computed(() => propertyBreakdown.value.slice(0, 4));

    const propertyLookup = computed(() => {
        const properties = dashboardData.value.properties || [];

        return properties.reduce((lookup, property) => {
            lookup[property.id] = property;
            return lookup;
        }, {});
    });

    const roomLookup = computed(() => {
        const rooms = dashboardData.value.rooms || [];

        return rooms.reduce((lookup, room) => {
            lookup[room.id] = room;
            return lookup;
        }, {});
    });

    const reservationRows = computed(() => (dashboardData.value.recentReservations || []).slice(0, 5));

    const activeReservations = computed(() =>
        reservationRows.value.map((reservation) => {
            const room = reservation.roomId ? roomLookup.value[reservation.roomId] : null;
            const property = reservation.propertyId ? propertyLookup.value[reservation.propertyId] : null;

            return {
                ...reservation,
                propertyName: property?.name || reservation.propertyName || t('owner.analytics.unknownProperty'),
                roomName: room?.type || reservation.roomName || t('owner.analytics.noRoomAssigned'),
                roomType: room?.type || reservation.roomType || '',
                propertyId: property?.id || reservation.propertyId || '',
                roomId: room?.id || reservation.roomId || '',
                statusTone: reservation.status === 'cancelled' ? 'danger' : reservation.status === 'paid' ? 'success' : 'warning',
            };
        }),
    );

    const summaryCards = computed(() => {
        const summary = selectedYearSummary.value || {};

        return [
            {
                label: t('owner.analytics.summary.totalProperties'),
                value: integerFormatter.format(summary.totalProperties || 0),
                delta: summary.trends?.properties || '',
                tone: 'blue',
                icon: HomeIcon,
                kind: 'number',
            },
            {
                label: t('owner.analytics.summary.totalBookings'),
                value: integerFormatter.format(summary.totalBookings || 0),
                delta: summary.trends?.bookings || '',
                tone: 'teal',
                icon: CalendarDaysIcon,
                kind: 'number',
            },
            {
                label: t('owner.analytics.summary.totalRevenue'),
                value: formatMoney(summary.totalRevenue || 0),
                delta: summary.trends?.revenue || '',
                tone: 'amber',
                icon: CurrencyDollarIcon,
                kind: 'currency',
            },
            {
                label: t('owner.analytics.summary.avgRating'),
                value: `${Number(summary.avgRating || 0).toFixed(1)}★`,
                delta: summary.trends?.rating || '',
                tone: 'coral',
                icon: StarIcon,
                kind: 'rating',
            },
        ];
    });


    const fetchDashboardData = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            dashboardData.value = data;

            const availableYears = Array.isArray(data.analytics?.yearlyPerformance)
                ? data.analytics.yearlyPerformance.map((entry) => Number(entry.year)).filter((year) => Number.isFinite(year))
                : [];

            if (availableYears.length > 0) {
                selectedYear.value = availableYears.includes(Number(selectedYear.value))
                    ? Number(selectedYear.value)
                    : Math.max(...availableYears);
            }
        } catch (requestError) {
            error.value = t('owner.analytics.error.failedToLoadDashboardData');
            console.error('Dashboard Fetch Error:', requestError);
        } finally {
            loading.value = false;
        }
    };

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
        activeReservations,
        fetchDashboardData,
        formatMoney,
        formatDate,
    };
});
