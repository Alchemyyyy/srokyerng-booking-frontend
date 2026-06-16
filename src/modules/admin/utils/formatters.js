const defaultMoneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value) || 0);

export const formatMoney = (value) => defaultMoneyFormatter.format(Number(value) || 0);

export const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

export const normalizeStatus = (status) => (status || "pending").toString().toLowerCase().trim();

export const statusBadgeClass = (status) => {
    const normalized = normalizeStatus(status);
    if (["approved", "verified", "confirmed", "paid", "success"].includes(normalized)) {
        return "status-badge status-approved";
    }
    if (["failed", "rejected", "cancelled", "refunded"].includes(normalized)) {
        return "status-badge status-rejected";
    }
    return "status-badge status-pending";
};

export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    const apiBase = import.meta.env.VITE_API_BASE_URL;
    const apiOrigin = new URL(apiBase).origin;

    return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
};