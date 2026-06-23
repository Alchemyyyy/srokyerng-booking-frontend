// modules/analytics/services/ownerAnalytics.service.js

export const ownerAnalyticsService = {
    /**
     * បំប្លែង និងផ្គុំទិន្នន័យដែលបានមកពី API ផ្សេងៗគ្នាចេញពី Postman ឱ្យទៅជា Object ស្អាតមួយ
     */
    processDashboardData({ summary, revenue, properties, rooms, reservations }) {
        // ទាញយកទិន្នន័យផ្ទាល់ចេញពី response.data.data របស់ Axios
        const mainSummary = summary?.data?.data?.dashboard_summary || {};
        const revenueData = revenue?.data?.data || {};
        const propertyList = properties?.data?.data?.top_properties || [];
        const roomList = rooms?.data?.data?.top_rooms || [];
        const reservationData = reservations?.data?.data || {};

        return {
            // ១. ផ្នែក Summary
            summary: {
                totalReservations: mainSummary.total_reservations || 0,
                confirmedReservations: mainSummary.confirmed_reservations || 0,
                completedReservations: mainSummary.completed_reservations || 0,
                upcomingReservations: mainSummary.upcoming_reservations || 0,
            },
            
            // ២. ផ្នែក Revenue & Segments
            revenue: {
                totalRevenue: revenueData.total_revenue || 0,
                paidRevenue: revenueData.paid_revenue || 0,
                netRevenue: revenueData.net_revenue || 0,
                revenueByStatus: revenueData.revenue_by_status || {}
            },

            // ៣. បំប្លែងទិន្នន័យ Properties (Array)
            properties: propertyList.map(p => ({
                id: p.property_id,
                name: p.property_name,
                reservationCount: p.reservation_count || 0,
                revenue: Number(p.total_revenue || 0),
                rating: Number(p.avg_rating || 0),
                uniqueCustomers: p.unique_customers || 0,
                status: p.status || 'approved' // default ទុកឱ្យ UI ទាញប្រើ
            })),

            // ៤. បំប្លែងទិន្នន័យ Rooms (Array)
            rooms: roomList.map(r => ({
                id: r.room_id,
                name: r.room_name,
                propertyName: r.property_name || '',
                pricePerNight: r.price_per_night || 0,
                reservationCount: r.reservation_count || 0,
                revenue: Number(r.total_revenue || 0),
                rating: Number(r.avg_rating || 0)
            })),

            // ៥. ផ្នែក Reservations 
            reservations: {
                reservationsByStatus: reservationData.reservations_by_status || {},
                totalReservations: reservationData.total_reservations || 0,
                totalReservationRevenue: reservationData.total_reservation_revenue || 0
            }
        };
    }
};