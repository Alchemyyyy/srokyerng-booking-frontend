// modules/analytics/services/ownerAnalytics.service.js

// Percentage change vs. the same period last year. `previous` of 0 can't
// produce a ratio, so it's reported as "New" rather than a bogus +Infinity%.
const computeTrend = (current, previous) => {
    if (!previous) {
        return current > 0
            ? { text: 'New vs last year', direction: 'up' }
            : { text: '', direction: 'neutral' };
    }

    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct === 0) return { text: 'No change vs last year', direction: 'neutral' };

    const sign = pct > 0 ? '+' : '';
    return { text: `${sign}${pct}% vs last year`, direction: pct > 0 ? 'up' : 'down' };
};

export const ownerAnalyticsService = {
    /**
     * Axios interceptor already unwraps the outer response, so each param shape is:
     *   { success, message, data: { ... } }
     *
     * We normalise all 5 endpoints into the single dashboardData object the store consumes.
     * prevSummary/prevRevenue/prevProperties are the same-shaped responses for the prior
     * year, used only to compute the trend badges shown on the summary cards.
     */
    processDashboardData({
        summary, revenue, properties, rooms, reservations,
        prevSummary, prevRevenue, prevProperties,
    }) {
        const mainSummary = summary?.data?.dashboard_summary || {};
        const revenueData = revenue?.data || {};
        const propertiesData = properties?.data || {};
        const propertyList = propertiesData.top_properties || [];
        const totalPropertiesCount = Number(propertiesData.count ?? propertyList.length);
        const roomList = rooms?.data?.top_rooms || [];
        const reservationData = reservations?.data || {};

        // ── Prior-year comparisons (for trend badges) ────────────────────────
        const prevMainSummary = prevSummary?.data?.dashboard_summary || {};
        const prevRevenueData = prevRevenue?.data || {};
        const prevPropertiesData = prevProperties?.data || {};
        const prevPropertyList = prevPropertiesData.top_properties || [];
        const prevTotalPropertiesCount = Number(prevPropertiesData.count ?? prevPropertyList.length);
        const prevTotalReservations = Number(prevMainSummary.total_reservations || 0);
        const prevTotalRevenue = Number(prevRevenueData.total_revenue || 0);
        const prevPaidRevenue = Number(prevRevenueData.paid_revenue || 0);

        // ── Revenue ─────────────────────────────────────────────────────────
        const totalRevenue = Number(revenueData.total_revenue || 0);
        const paidRevenue = Number(revenueData.paid_revenue || 0);
        const netRevenue = Number(revenueData.net_revenue || 0);

        // ── Reservation counts (from summary endpoint) ───────────────────────
        const totalReservations = Number(mainSummary.total_reservations || 0);
        const confirmedReservations = Number(mainSummary.confirmed_reservations || 0);
        const completedReservations = Number(mainSummary.completed_reservations || 0);
        const upcomingReservations = Number(mainSummary.upcoming_reservations || 0);

        // ── segmentPerformance → revenue_by_status (for donut chart) ────────
        const revenueByStatus = revenueData.revenue_by_status || {};
        const segmentPerformance = Object.entries(revenueByStatus)
            .filter(([, v]) => Number(v?.total_amount || 0) > 0)
            .map(([status, v]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: Number(v?.total_amount || 0),
            }));

        // ── reservations_by_status → summary rows (for the panel table) ──────
        const reservationsByStatus = reservationData.reservations_by_status || {};
        const statusToneMap = {
            confirmed: 'success',
            completed: 'success',
            cancelled: 'danger',
            pending: 'warning',
            submitted: 'info',
        };
        const reservationStatusRows = Object.entries(reservationsByStatus).map(([status, v]) => ({
            status,
            count: Number(v?.count || 0),
            avgNights: Number(v?.avg_nights || 0),
            amount: Number(v?.total_amount || 0),
            statusTone: statusToneMap[status] ?? 'warning',
        }));

        // ── reservationChartData → bar chart labels + datasets ───────────────
        // Labels = statuses, one dataset per metric (count / amount)
        const chartLabels = reservationStatusRows.map(r =>
            r.status.charAt(0).toUpperCase() + r.status.slice(1));
        const chartCounts = reservationStatusRows.map(r => r.count);
        const chartAmounts = reservationStatusRows.map(r => r.amount);

        // ── avgRating — skip 0.00 values (no reviews yet) ───────────────────
        const ratedProps = propertyList.filter(p => Number(p.avg_rating) > 0);
        const avgRating = ratedProps.length
            ? ratedProps.reduce((s, p) => s + Number(p.avg_rating), 0) / ratedProps.length
            : 0;

        return {
            summary: {
                totalReservations,
                confirmedReservations,
                completedReservations,
                upcomingReservations,
                totalRevenue,
                paidRevenue,
                netRevenue,
                totalProperties: totalPropertiesCount,
                avgRating: Number(avgRating.toFixed(2)),
                trends: {
                    properties: computeTrend(totalPropertiesCount, prevTotalPropertiesCount),
                    bookings: computeTrend(totalReservations, prevTotalReservations),
                    revenue: computeTrend(totalRevenue, prevTotalRevenue),
                    paidRevenue: computeTrend(paidRevenue, prevPaidRevenue),
                },
            },

            analytics: {
                weeklyTraffic: [],
                monthlyPerformance: [],
                segmentPerformance,
                yearlyPerformance: [],
                // chart data for ReservationOverviewChart (bar by status)
                reservationChart: {
                    labels: chartLabels,
                    counts: chartCounts,
                    amounts: chartAmounts,
                },
            },

            reservationStats: {
                totalReservations: reservationData.total_reservations || 0,
                totalReservationRevenue: reservationData.total_reservation_revenue || 0,
                byStatus: reservationStatusRows,
            },

            paymentStatus: { isComplete: true, missingFields: [], lastUpdated: null },

            properties: propertyList.map(p => ({
                id: p.property_id,
                name: p.property_name,
                reservationCount: Number(p.reservation_count || 0),
                revenue: Number(p.total_revenue || 0),
                rating: Number(p.avg_rating || 0),
                uniqueCustomers: Number(p.unique_customers || 0),
                status: p.status || 'approved',
            })),

            rooms: roomList.map(r => ({
                id: r.room_id,
                name: r.room_name,
                propertyName: r.property_name || '',
                pricePerNight: Number(r.price_per_night || 0),
                reservationCount: Number(r.reservation_count || 0),
                revenue: Number(r.total_revenue || 0),
                rating: Number(r.avg_rating || 0),
            })),

            // No individual reservation rows from API — panel uses reservationStats.byStatus
            recentReservations: [],
        };
    },

    processLatestReservations(response) {
        // ទាញយក Array ចេញពី response.data របស់ Postman
        const rawList = response?.data?.data || response?.data || [];

        const statusToneMap = {
            confirmed: 'success',
            completed: 'success',
            cancelled: 'danger',
            pending: 'warning',
        };

        // ប្រើប្រាស់ .slice(0, 5) ដើម្បីយកតែទិន្នន័យ ៥ ដំបូងប៉ុណ្ណោះ
        return rawList.slice(0, 4).map(res => ({
            id: res.id,
            guestName: res.customer_name || '—',
            propertyName: res.property_name || '—',
            roomName: res.room_name || null,
            checkIn: res.check_in_date,
            checkOut: res.check_out_date,
            amount: Number(res.total_amount || 0),
            status: res.reservation_status
                ? (res.reservation_status.charAt(0).toUpperCase() + res.reservation_status.slice(1))
                : '—',
            statusTone: statusToneMap[String(res.reservation_status).toLowerCase()] ?? 'warning'
        }));
    },

    extractRawReservations(response) {
        // Return full raw list (no slice) so the chart can aggregate all months
        return response?.data?.data || response?.data || [];
    },
};