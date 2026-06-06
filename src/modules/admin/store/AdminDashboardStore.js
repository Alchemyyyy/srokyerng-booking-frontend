import { computed, ref } from "vue";
import { defineStore } from "pinia";

const createDefaultDashboardState = () => ({
    summary: {
        totalProperties: 0,
        totalRooms: 0,
        totalBookings: 0,
        totalRevenue: 0,
    },
    pending: {
        propertyApprovals: 0,
        paymentVerifications: 0,
    },
    recentReservations: [],
    recentPayments: [],
    users: [],
});

const asNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const sumReservationRevenue = (reservations) =>
    reservations.reduce((total, item) => total + asNumber(item?.amount || item?.totalAmount || item?.total), 0);

const normalizeReservation = (item, index) => ({
    id: item?.id || item?._id || `RSV-${index + 1}`,
    guestName: item?.guestName || item?.guest?.name || item?.customerName || "Guest",
    propertyName: item?.propertyName || item?.property?.name || "Unknown property",
    checkInDate: item?.checkInDate || item?.checkIn || item?.createdAt || new Date().toISOString(),
    status: (item?.status || "pending").toString().toLowerCase(),
    totalAmount: asNumber(item?.totalAmount || item?.amount || item?.total),
});

const normalizePayment = (item, index) => ({
    id: item?.id || item?._id || `PAY-${index + 1}`,
    reservationId: item?.reservationId || item?.reservation?.id || "N/A",
    payerName: item?.payerName || item?.user?.fullName || item?.guestName || "Unknown payer",
    method: item?.method || item?.paymentMethod || "Transfer",
    amount: asNumber(item?.amount || item?.totalAmount),
    submittedAt: item?.submittedAt || item?.createdAt || new Date().toISOString(),
    status: (item?.status || "pending").toString().toLowerCase(),
});

const normalizeUser = (item, index) => ({
    id: item?.id || item?._id || `USR-${index + 1}`,
    fullName: item?.fullName || item?.name || item?.displayName || "Unknown user",
    email: item?.email || "-",
    role: (item?.role || "customer").toString().toLowerCase(),
    status: (item?.status || "active").toString().toLowerCase(),
});

const normalizeDashboardOverview = (payload) => {
    const properties = Array.isArray(payload?.properties) ? payload.properties : [];
    const rooms = Array.isArray(payload?.rooms) ? payload.rooms : [];
    const recentReservations = Array.isArray(payload?.recentReservations) ? payload.recentReservations : [];
    const admin = payload?.admin || {};
    const users = Array.isArray(admin?.users) ? admin.users.map(normalizeUser) : [];
    const recentPayments = Array.isArray(admin?.recentPayments) ? admin.recentPayments.map(normalizePayment) : [];

    return {
        summary: {
            totalProperties: asNumber(payload?.summary?.totalProperties || properties.length),
            totalRooms: asNumber(payload?.summary?.totalRooms || rooms.length),
            totalBookings: asNumber(payload?.summary?.totalBookings || recentReservations.length),
            totalRevenue: asNumber(payload?.summary?.totalRevenue || sumReservationRevenue(recentReservations)),
        },
        pending: {
            propertyApprovals: asNumber(
                admin?.pending?.propertyApprovals || properties.filter((item) => item?.status === "Pending").length,
            ),
            paymentVerifications: asNumber(
                admin?.pending?.paymentVerifications || recentPayments.filter((item) => item.status === "pending").length,
            ),
        },
        recentReservations: recentReservations.map(normalizeReservation),
        recentPayments,
        users,
    };
};

const defaultMoneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export const useAdminDashboardStore = defineStore("admin-dashboard", () => {
    const loading = ref(true);
    const error = ref("");
    const dashboardData = ref(createDefaultDashboardState());

    const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value) || 0);

    const formatMoney = (value) => defaultMoneyFormatter.format(Number(value) || 0);

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const normalizeStatus = (status) => (status || "pending").toString().toLowerCase().trim();

    const statusBadgeClass = (status) => {
        const normalized = normalizeStatus(status);

        if (["approved", "verified", "confirmed", "paid", "success"].includes(normalized)) {
            return "status-badge status-approved";
        }

        if (["failed", "rejected", "cancelled", "refunded"].includes(normalized)) {
            return "status-badge status-rejected";
        }

        return "status-badge status-pending";
    };

    const summaryCards = computed(() => [
        {
            title: "Total properties",
            value: dashboardData.value.summary.totalProperties,
            hint: "Listings in the platform",
        },
        {
            title: "Total rooms",
            value: dashboardData.value.summary.totalRooms,
            hint: "Rooms across all listings",
        },
        {
            title: "Total bookings",
            value: dashboardData.value.summary.totalBookings,
            hint: "Reservations captured in the data store",
        },
        {
            title: "Total revenue",
            value: dashboardData.value.summary.totalRevenue,
            hint: "Gross booking revenue",
        },
    ]);

    const quickLinks = computed(() => [
        {
            title: "Review property approvals",
            description: "Check and approve newly submitted properties.",
            to: { name: "admin.properties.index" },
            count: dashboardData.value.pending.propertyApprovals,
        },
        {
            title: "Verify payments",
            description: "Validate payment slips and update payment status.",
            to: { name: "admin.paymentVerifications" },
            count: dashboardData.value.pending.paymentVerifications,
        },
        {
            title: "Monitor reservations",
            description: "Inspect booking activity and detect abnormal trends.",
            to: { name: "admin.reservations" },
            count: dashboardData.value.recentReservations.length,
        },
        {
            title: "Manage users",
            description: "Review user roles and account health.",
            to: { name: "admin.users" },
            count: dashboardData.value.users.length,
        },
    ]);

    const loadDashboard = async () => {
        loading.value = true;
        error.value = "";

        try {
            const response = await fetch("/data.json");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const payload = await response.json();

            dashboardData.value = normalizeDashboardOverview(payload);
        } catch (requestError) {
            error.value = "Failed to load dashboard data.";
            console.error("Admin dashboard data load error:", requestError);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        dashboardData,
        summaryCards,
        quickLinks,
        loadDashboard,
        formatNumber,
        formatMoney,
        formatDate,
        statusBadgeClass,
    };
});
