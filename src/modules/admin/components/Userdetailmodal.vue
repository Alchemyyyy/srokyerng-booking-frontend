<script setup>
import { computed } from "vue";
import {
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarDaysIcon,
    ClockIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    CheckBadgeIcon,
} from "@heroicons/vue/24/outline";
import { formatDate } from "../utils/formatters.js";
import AppModal from "@/shared/components/AppModal.vue";

const props = defineProps({
    user: { type: Object, default: null },
    open: { type: Boolean, default: false },
    processing: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "action"]);

const statusClass = (status) => {
    if (status === "active") return "badge-active";
    if (status === "suspended") return "badge-suspended";
    if (status === "banned") return "badge-banned";
    return "badge-default";
};

const roleClass = (role) => {
    if (role === "admin") return "role-admin";
    if (role === "owner") return "role-owner";
    if (role === "customer") return "role-customer";
    return "role-default";
};

const avatarLetter = computed(() =>
    props.user?.full_name?.charAt(0)?.toUpperCase() ?? "?"
);

const profileImageUrl = computed(() => {
    const url = props.user?.profile_image_url;
    if (!url) return null;
    if (url.startsWith("http")) return url;
    // VITE_API_BASE_URL = "https://api-srokyerng.devspace.linkpc.net/api"
    // Strip /api to get the file server origin for /uploads/... paths
    const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/api\/?$/, "");
    return `${base}${url}`;
});

const availableActions = computed(() => {
    if (!props.user) return [];
    const actions = [];
    if (props.user.status !== "active") actions.push("activate");
    if (props.user.status !== "suspended") actions.push("suspend");
    return actions;
});

const ACTION_META = {
    activate: { label: "Activate", color: "btn-approve" },
    suspend: { label: "Suspend", color: "btn-suspend" },
};
</script>

<template>
    <AppModal v-if="user" :open="open" title="User Profile" panel-class="max-w-xl" @close="emit('close')">
        <!-- Avatar + identity -->
        <div class="identity-section">
            <div class="avatar-wrap">
                <img v-if="profileImageUrl" :src="profileImageUrl" :alt="user.full_name" class="avatar-img"
                    @error="(e) => (e.target.style.display = 'none')" />
                <span v-else class="avatar-letter">{{ avatarLetter }}</span>
            </div>

            <div class="identity-info">
                <h3 class="user-name">{{ user.full_name }}</h3>
                <div class="badges-row">
                    <span class="role-badge" :class="roleClass(user.role)">
                        {{ user.role }}
                    </span>
                    <span class="status-badge" :class="statusClass(user.status)">
                        {{ user.status }}
                    </span>
                </div>
                <p class="user-id">ID #{{ user.id }}</p>
            </div>
        </div>

        <!-- Detail fields -->
        <div class="detail-grid">
            <!-- Email -->
            <div class="detail-item">
                <EnvelopeIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Email</p>
                    <p class="detail-value">{{ user.email }}</p>
                </div>
                <span v-if="user.email_verified_at" class="verified-badge" title="Email verified">
                    <CheckBadgeIcon class="w-4 h-4" />
                    Verified
                </span>
            </div>

            <!-- Phone -->
            <div class="detail-item">
                <PhoneIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Phone</p>
                    <p class="detail-value">{{ user.phone || "—" }}</p>
                </div>
            </div>

            <!-- Gender -->
            <div class="detail-item">
                <UserCircleIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Gender</p>
                    <p class="detail-value">
                        {{ user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "—" }}
                    </p>
                </div>
            </div>

            <!-- Date of birth -->
            <div class="detail-item">
                <CalendarDaysIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Date of Birth</p>
                    <p class="detail-value">
                        {{ user.date_of_birth ? formatDate(user.date_of_birth) : "—" }}
                    </p>
                </div>
            </div>

            <!-- Address -->
            <div class="detail-item detail-item--full">
                <MapPinIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Address</p>
                    <p class="detail-value">{{ user.address || "—" }}</p>
                </div>
            </div>

            <!-- Last login -->
            <div class="detail-item">
                <ClockIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Last Login</p>
                    <p class="detail-value">
                        {{ user.last_login ? formatDate(user.last_login) : "Never" }}
                    </p>
                </div>
            </div>

            <!-- Joined -->
            <div class="detail-item">
                <ShieldCheckIcon class="detail-icon" />
                <div>
                    <p class="detail-label">Joined</p>
                    <p class="detail-value">{{ formatDate(user.created_at) }}</p>
                </div>
            </div>
        </div>

        <template #footer>
            <button class="btn-cancel" @click="emit('close')">Close</button>
            <div class="action-group">
                <button v-for="action in availableActions" :key="action" class="action-btn"
                    :class="ACTION_META[action].color" :disabled="processing"
                    @click="emit('action', { user, action })">
                    {{ ACTION_META[action].label }}
                </button>
            </div>
        </template>
    </AppModal>
</template>

<style scoped>
/* Identity section */
.identity-section {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding-bottom: 1.25rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
}

.avatar-wrap {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    font-size: 1.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    border: 2px solid var(--color-border);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-letter {
    line-height: 1;
}

.identity-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--color-text);
    margin: 0 0 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badges-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 0.35rem;
}

.user-id {
    font-size: 0.72rem;
    color: var(--color-muted);
    margin: 0;
}

/* Detail grid */
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--color-border);
    position: relative;
}

.detail-item--full {
    grid-column: 1 / -1;
}

.detail-item:nth-child(odd):not(.detail-item--full) {
    padding-right: 1.5rem;
    border-right: 1px solid var(--color-border);
}

.detail-item:nth-child(even) {
    padding-left: 1.5rem;
}

.detail-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-muted);
    flex-shrink: 0;
    margin-top: 0.2rem;
}

.detail-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-muted);
    margin: 0 0 0.2rem;
}

.detail-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    word-break: break-word;
}

.verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--color-success-soft);
    color: var(--color-success);
    border: 1px solid var(--color-success);
    margin-left: auto;
    white-space: nowrap;
    align-self: center;
}

.action-group {
    display: flex;
    gap: 0.5rem;
}

.btn-cancel {
    padding: 0.55rem 1.1rem;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-soft);
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.15s;
}

.btn-cancel:hover {
    background: var(--color-border);
}

.action-btn {
    padding: 0.55rem 1.1rem;
    border-radius: 12px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Shared badge styles (same as parent view) */
.status-badge,
.role-badge {
    display: inline-block;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid transparent;
}

.badge-active {
    background: var(--color-success-soft);
    color: var(--color-success);
    border-color: var(--color-success);
}

.badge-suspended {
    background: var(--color-warning-soft);
    color: var(--color-warning);
    border-color: var(--color-warning);
}

.badge-banned {
    background: var(--color-danger-soft);
    color: var(--color-danger);
    border-color: var(--color-danger);
}

.badge-default {
    background: var(--color-surface-soft);
    color: var(--color-muted);
}

.role-admin {
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
    border-color: rgba(139, 92, 246, 0.25);
}

.role-owner {
    background: var(--color-primary-soft);
    color: var(--color-primary);
    border-color: var(--color-primary);
}

.role-customer {
    background: var(--color-success-soft);
    color: var(--color-success);
    border-color: var(--color-success);
}

.role-default {
    background: var(--color-surface-soft);
    color: var(--color-muted);
}

.btn-approve {
    background: var(--color-success-soft);
    color: var(--color-success);
    border-color: var(--color-success);
}

.btn-approve:hover:not(:disabled) {
    background: var(--color-success);
    color: white;
}

.btn-suspend {
    background: var(--color-warning-soft);
    color: var(--color-warning);
    border-color: var(--color-warning);
}

.btn-suspend:hover:not(:disabled) {
    background: var(--color-warning);
    color: white;
}
</style>
